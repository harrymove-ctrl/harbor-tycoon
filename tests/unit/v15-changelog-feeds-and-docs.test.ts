import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
// @ts-expect-error ESM server module
import { createMultiplayerRelay } from '../../scripts/ws-relay.mjs';
// @ts-expect-error ESM server module
import { SHIP_RELEASES } from '../../scripts/ship-updates.mjs';

describe('v1.5 Changelog Portal, RSS/Atom/JSON Syndication Feeds & Web Game Docs', () => {
  it('serves /changelog, /docs, /changelog.xml, /rss.xml, /atom.xml, and /feed.json over HTTP with valid schemas', async () => {
    const tmpStore = path.join(os.tmpdir(), `rtown-v15-${Date.now()}.json`);
    const relay = createMultiplayerRelay({
      walletRegistryOptions: { storePath: tmpStore },
    });

    const srv = http.createServer((req, res) => {
      if (!relay.handleApiRequest(req, res)) {
        res.writeHead(404);
        res.end('Not Found');
      }
    });

    await new Promise<void>((resolve) => srv.listen(0, '127.0.0.1', () => resolve()));
    const port = (srv.address() as { port: number }).port;
    const base = `http://127.0.0.1:${port}`;

    try {
      // 1. /changelog HTML
      const clRes = await fetch(`${base}/changelog`);
      assert.equal(clRes.status, 200);
      assert.match(clRes.headers.get('content-type') || '', /text\/html/i);
      const clHtml = await clRes.text();
      assert.ok(clHtml.includes('Harbor Tycoon Changelog &amp; Release Feed'));
      assert.ok(clHtml.includes('application/rss+xml'));
      assert.ok(clHtml.includes('application/atom+xml'));
      assert.ok(clHtml.includes('id="v1.5.0"'));
      assert.ok(clHtml.includes('id="v1.0.0"'));
      assert.ok(!clHtml.includes('—') && !clHtml.includes('–'));

      // HEAD /changelog
      const headCl = await fetch(`${base}/changelog`, { method: 'HEAD' });
      assert.equal(headCl.status, 200);

      // 2. /docs HTML (including trailing slash normalization)
      const docsRes = await fetch(`${base}/docs/`);
      assert.equal(docsRes.status, 200);
      assert.match(docsRes.headers.get('content-type') || '', /text\/html/i);
      const docsHtml = await docsRes.text();
      for (const anchor of [
        '#turn-loop',
        '#storefront-yields',
        '#districts-events',
        '#wif-flywheel',
        '#smart-contract',
        '#multiplayer-api',
        '#controls-views',
        '0x5173b8eA6923c2d40267890D45C46a3480954773',
        '0xfa9e6186',
        '0xdc96d5fc',
        '140 $wif/yr',
      ]) {
        assert.ok(docsHtml.includes(anchor), `/docs must contain ${anchor}`);
      }
      assert.ok(!docsHtml.includes('—') && !docsHtml.includes('–'));

      // 3. RSS 2.0 XML (/changelog.xml, /rss.xml, /feed.xml)
      for (const feedPath of ['/changelog.xml', '/rss.xml', '/feed.xml']) {
        const rssRes = await fetch(`${base}${feedPath}`);
        assert.equal(rssRes.status, 200);
        assert.match(rssRes.headers.get('content-type') || '', /application\/rss\+xml/i);
        const rssXml = await rssRes.text();
        assert.ok(rssXml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
        assert.ok(rssXml.includes('<rss version="2.0"'));
        assert.ok(rssXml.includes('<guid isPermaLink="true">'));
        assert.ok(rssXml.includes('Harbor Tycoon v1.5.0'));
        assert.ok(rssXml.includes('Harbor Tycoon v1.4.0'));
        assert.ok(!rssXml.includes('—') && !rssXml.includes('–'));
      }

      // 4. Atom 1.0 XML (/atom.xml)
      const atomRes = await fetch(`${base}/atom.xml`);
      assert.equal(atomRes.status, 200);
      assert.match(atomRes.headers.get('content-type') || '', /application\/atom\+xml/i);
      const atomXml = await atomRes.text();
      assert.ok(atomXml.includes('<feed xmlns="http://www.w3.org/2005/Atom">'));
      assert.ok(atomXml.includes('<entry>'));
      assert.ok(atomXml.includes('<content type="html">'));
      assert.ok(!atomXml.includes('—') && !atomXml.includes('–'));

      // 5. JSON Feed 1.1 (/feed.json and /updates.json)
      const jfRes = await fetch(`${base}/feed.json`);
      assert.equal(jfRes.status, 200);
      assert.match(jfRes.headers.get('content-type') || '', /application\/feed\+json/i);
      const jf = (await jfRes.json()) as {
        version: string;
        ok: boolean;
        items: Array<{ id: string; title: string }>;
        releases: unknown[];
      };
      assert.equal(jf.version, 'https://jsonfeed.org/version/1.1');
      assert.equal(jf.ok, true);
      assert.equal(jf.items.length, SHIP_RELEASES.length);
      assert.equal(jf.releases.length, SHIP_RELEASES.length);

      // 6. Crawler & LLM discovery endpoints (/robots.txt, /sitemap.xml, /llms.txt)
      const robotsRes = await fetch(`${base}/robots.txt`);
      assert.equal(robotsRes.status, 200);
      const robotsTxt = await robotsRes.text();
      assert.ok(robotsTxt.includes('Sitemap: https://harbor-tycoon-production.up.railway.app/sitemap.xml'));

      const smRes = await fetch(`${base}/sitemap.xml`);
      assert.equal(smRes.status, 200);
      assert.match(smRes.headers.get('content-type') || '', /application\/xml/i);
      const smXml = await smRes.text();
      assert.ok(smXml.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'));
      assert.ok(smXml.includes('https://harbor-tycoon-production.up.railway.app/changelog'));
      assert.ok(smXml.includes('https://harbor-tycoon-production.up.railway.app/docs'));

      const llmsRes = await fetch(`${base}/llms.txt`);
      assert.equal(llmsRes.status, 200);
      const llmsTxt = await llmsRes.text();
      assert.ok(llmsTxt.includes('# Harbor Tycoon'));
      assert.ok(llmsTxt.includes('0x5173b8eA6923c2d40267890D45C46a3480954773'));
      assert.ok(llmsTxt.includes('https://harbor-tycoon-production.up.railway.app/changelog'));
      assert.ok(!llmsTxt.includes('—') && !llmsTxt.includes('–'));
    } finally {
      await new Promise<void>((resolve) => srv.close(() => resolve()));
      try {
        fs.unlinkSync(tmpStore);
      } catch {}
    }
  });

  it('wires feed auto-discovery in index.html, root CHANGELOG.md, and Dockerfile runner stage', () => {
    const indexHtml = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf8');
    assert.ok(indexHtml.includes('href="https://harbor-tycoon-production.up.railway.app/changelog.xml"'));
    assert.ok(indexHtml.includes('href="https://harbor-tycoon-production.up.railway.app/atom.xml"'));
    assert.ok(indexHtml.includes('href="/changelog"'));
    assert.ok(indexHtml.includes('href="/docs"'));

    const changelogMd = fs.readFileSync(path.resolve(process.cwd(), 'CHANGELOG.md'), 'utf8');
    assert.ok(changelogMd.includes('## v1.5.0'));
    assert.ok(!changelogMd.includes('—') && !changelogMd.includes('–'));

    const dockerfile = fs.readFileSync(path.resolve(process.cwd(), 'Dockerfile'), 'utf8');
    assert.ok(
      dockerfile.includes('scripts/game-docs.mjs'),
      'Dockerfile runner stage must copy scripts/game-docs.mjs',
    );

    const uiSource = fs.readFileSync(
      path.resolve(process.cwd(), 'src/town/robin-town-ui.ts'),
      'utf8',
    );
    assert.ok(uiSource.includes('function openWhatsNewModal'));
    assert.ok(uiSource.includes('data-action="whats-new"'));
    assert.ok(uiSource.includes('data-action="set-whats-new-tab"'));
    assert.ok(uiSource.includes("searchParams.get('news') === '1'"));
  });
});
