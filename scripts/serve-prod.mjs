import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { createMultiplayerRelay } from './ws-relay.mjs';
import { PRODUCTION_ORIGIN, renderDynamicIndexHtml } from './ship-updates.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, '..', 'dist');
const PORT = Number(process.env.PORT || 8080);
const HOST = '0.0.0.0';
const relay = createMultiplayerRelay();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.map': 'application/json; charset=utf-8',
};

const COMPRESSIBLE_EXTS = new Set([
  '.html',
  '.js',
  '.mjs',
  '.css',
  '.json',
  '.svg',
  '.webmanifest',
  '.map',
]);

function sendFile(req, res, filePath, isHashedAsset) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  const cacheControl = isHashedAsset
    ? 'public, max-age=31536000, immutable'
    : ext === '.html'
      ? 'no-cache'
      : 'public, max-age=3600';

  const headers = {
    'Content-Type': contentType,
    'Cache-Control': cacheControl,
    'X-Content-Type-Options': 'nosniff',
  };

  if (req.method === 'HEAD') {
    res.writeHead(200, headers);
    res.end();
    return;
  }

  const acceptEncoding = String(req.headers['accept-encoding'] || '');
  if (COMPRESSIBLE_EXTS.has(ext) && acceptEncoding.includes('gzip')) {
    headers['Content-Encoding'] = 'gzip';
    headers['Vary'] = 'Accept-Encoding';
    res.writeHead(200, headers);
    fs.createReadStream(filePath).pipe(zlib.createGzip()).pipe(res);
    return;
  }

  res.writeHead(200, headers);
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer((req, res) => {
  const rawUrl = (req.url || '/').split('?')[0] || '/';
  if (rawUrl === '/healthz' || rawUrl === '/health') {
    const summary = relay.walletRegistry.publicSummary();
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(
      JSON.stringify({
        status: 'ok',
        service: 'robin-town',
        wsMultiplayer: true,
        activeRooms: relay.rooms.size,
        storePersistent: summary.storePersistent,
        totalUniqueWallets: summary.totalUniqueWallets,
        verifiedWallets: summary.verifiedWallets,
        totalMatchesPlayed: summary.totalMatchesPlayed,
      }),
    );
    return;
  }

  if (relay.handleApiRequest(req, res)) {
    return;
  }

  let decodedPath = '/';
  try {
    decodedPath = decodeURIComponent(rawUrl);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Bad Request');
    return;
  }

  const safeRel = decodedPath.replace(/^\/+/, '');
  const resolved = path.resolve(DIST_DIR, safeRel);
  if (!resolved.startsWith(DIST_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
    const vaultInfo = relay.walletRegistry.getVaultContractInfo();
    if (
      safeRel === 'index.html' &&
      ((req.url || '').includes('?') || Boolean(vaultInfo.vaultContractAddress))
    ) {
      const baseHtml = fs.readFileSync(resolved, 'utf8');
      const proto = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
      const host = String(req.headers.host || '').trim();
      const origin = host ? `${proto}://${host}` : PRODUCTION_ORIGIN;
      const html = renderDynamicIndexHtml(baseHtml, req.url || '/', origin, vaultInfo);
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      });
      if (req.method === 'HEAD') res.end();
      else res.end(html);
      return;
    }
    const isHashed = safeRel.startsWith('assets/') && /-[A-Za-z0-9_-]{6,}\./.test(safeRel);
    sendFile(req, res, resolved, isHashed);
    return;
  }

  if (path.extname(safeRel)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
    return;
  }

  const indexHtml = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexHtml)) {
    const vaultInfo = relay.walletRegistry.getVaultContractInfo();
    if ((req.url || '').includes('?') || Boolean(vaultInfo.vaultContractAddress)) {
      const baseHtml = fs.readFileSync(indexHtml, 'utf8');
      const proto = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
      const host = String(req.headers.host || '').trim();
      const origin = host ? `${proto}://${host}` : PRODUCTION_ORIGIN;
      const html = renderDynamicIndexHtml(baseHtml, req.url || '/', origin, vaultInfo);
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      });
      if (req.method === 'HEAD') res.end();
      else res.end(html);
      return;
    }
    sendFile(req, res, indexHtml, false);
    return;
  }

  res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Build output missing');
});

server.on('upgrade', (req, socket, head) => {
  if (!relay.handleUpgrade(req, socket, head)) {
    socket.destroy();
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[robin-town] Production server + WebSocket multiplayer relay listening on http://${HOST}:${PORT}`);
  console.log(`[robin-town] Wallet registry store path: ${relay.walletRegistry.storePath}`);
});

for (const sig of ['SIGTERM', 'SIGINT']) {
  process.on(sig, () => {
    try {
      relay.walletRegistry.flushToDisk();
    } catch {}
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 2000).unref();
  });
}
