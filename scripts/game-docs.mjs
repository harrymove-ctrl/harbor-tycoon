export function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderSharedPortalCss() {
  return `
      :root {
        color-scheme: dark;
        --bg: #0d251b;
        --panel: #15392a;
        --card: #0f2c20;
        --border: rgba(238, 195, 83, 0.34);
        --gold: #eec353;
        --mint: #8bf5b5;
        --text: #f6f2e6;
        --muted: #b9d4c4;
      }
      * { box-sizing: border-box; }
      html { scroll-behavior: smooth; }
      body {
        margin: 0;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: radial-gradient(circle at top, #1d4e39 0%, var(--bg) 70%);
        color: var(--text);
        line-height: 1.58;
        padding: 24px 16px 72px;
      }
      .portal-shell { max-width: 1080px; margin: 0 auto; min-width: 0; }
      main, .hero, .doc-section, .ship-card { min-width: 0; max-width: 100%; overflow-wrap: anywhere; }
      .portal-topbar {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
        justify-content: space-between;
        background: rgba(10, 28, 20, 0.92);
        border: 1.5px solid var(--border);
        border-radius: 14px;
        padding: 10px 14px;
        margin-bottom: 18px;
        position: sticky;
        top: 10px;
        z-index: 20;
        backdrop-filter: blur(10px);
      }
      .portal-brand {
        font-weight: 900;
        letter-spacing: 0.04em;
        color: var(--gold);
        text-decoration: none;
        font-size: 15px;
      }
      .portal-brand span { color: var(--mint); font-weight: 700; font-size: 12px; margin-left: 6px; }
      .portal-nav { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
      .nav-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 6px 11px;
        border-radius: 9px;
        font-size: 13px;
        font-weight: 700;
        text-decoration: none;
        color: var(--text);
        background: rgba(255, 255, 255, 0.07);
        border: 1px solid rgba(255, 255, 255, 0.12);
      }
      .nav-pill:hover { border-color: var(--gold); color: var(--gold); }
      .nav-pill.active {
        background: rgba(238, 195, 83, 0.18);
        border-color: var(--gold);
        color: var(--gold);
      }
      .nav-pill.play {
        background: var(--gold);
        color: #13261b;
        border-color: var(--gold);
      }
      .hero {
        background: rgba(11, 31, 22, 0.88);
        border: 2px solid var(--gold);
        border-radius: 18px;
        padding: 24px;
        margin-bottom: 22px;
      }
      .kicker {
        display: inline-block;
        font-size: 11.5px;
        font-weight: 800;
        letter-spacing: 0.06em;
        color: var(--mint);
        background: rgba(57, 168, 131, 0.18);
        border: 1px solid rgba(139, 245, 181, 0.35);
        border-radius: 999px;
        padding: 4px 12px;
        margin-bottom: 10px;
      }
      h1 { margin: 0 0 8px; font-size: clamp(25px, 3.8vw, 36px); line-height: 1.15; }
      .hero p { margin: 0 0 14px; color: var(--muted); max-width: 820px; }
      .contract-meta {
        margin-top: 14px;
        padding-top: 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        font-size: 13px;
        color: var(--muted);
        word-break: break-all;
      }
      .contract-meta code, .contract-meta a { color: var(--mint); }
      .docs-grid {
        display: grid;
        grid-template-columns: 240px minmax(0, 1fr);
        gap: 20px;
        align-items: start;
      }
      @media (max-width: 860px) {
        .docs-grid { grid-template-columns: minmax(0, 1fr); }
        .docs-toc { position: static !important; }
      }
      .docs-toc {
        position: sticky;
        top: 74px;
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 15px;
        padding: 16px;
      }
      .docs-toc h2 {
        margin: 0 0 10px;
        font-size: 12px;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--gold);
      }
      .docs-toc ol {
        margin: 0;
        padding-left: 18px;
        font-size: 13.5px;
      }
      .docs-toc li { margin-bottom: 7px; }
      .docs-toc a { color: var(--muted); text-decoration: none; font-weight: 600; }
      .docs-toc a:hover { color: var(--mint); text-decoration: underline; }
      .doc-section {
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 22px 24px;
        margin-bottom: 18px;
        scroll-margin-top: 82px;
      }
      .doc-section h2 {
        margin: 0 0 10px;
        font-size: 21px;
        color: var(--gold);
      }
      .doc-section h3 {
        margin: 18px 0 8px;
        font-size: 16px;
        color: var(--mint);
      }
      .doc-section p { margin: 0 0 12px; color: var(--text); }
      .doc-section ol { margin: 0 0 12px; padding-left: 20px; }
      .doc-section li { margin-bottom: 6px; }
      .table-wrap { overflow-x: auto; margin: 12px 0; }
      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13.5px;
        background: var(--card);
        border-radius: 12px;
        overflow: hidden;
      }
      th, td {
        text-align: left;
        padding: 10px 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }
      th {
        background: rgba(238, 195, 83, 0.14);
        color: var(--gold);
        font-weight: 800;
        white-space: nowrap;
      }
      code {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        background: rgba(0, 0, 0, 0.28);
        padding: 2px 6px;
        border-radius: 5px;
        color: var(--mint);
        font-size: 12.5px;
        overflow-wrap: anywhere;
        word-break: break-word;
      }
      .stat-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(185px, 1fr));
        gap: 10px;
        margin: 12px 0 6px;
      }
      .stat-card {
        background: var(--card);
        border: 1px solid rgba(139, 245, 181, 0.24);
        border-radius: 12px;
        padding: 12px 14px;
      }
      .stat-card small { display: block; color: var(--muted); font-size: 12px; }
      .stat-card strong { display: block; color: var(--gold); font-size: 18px; margin-top: 2px; }
  `;
}

export function renderPortalTopbarHtml(activePage, githubUrl) {
  const isChangelog = activePage === 'changelog';
  const isDocs = activePage === 'docs';
  const isDeploy = activePage === 'deploy';
  return `<header class="portal-topbar" role="banner">
      <a class="portal-brand" href="/">HARBOR TYCOON <span>AI MERCHANT ENGINE · $GOLD</span></a>
      <nav class="portal-nav" aria-label="Harbor Tycoon navigation">
        <a class="nav-pill play" href="/">Play Game ▶</a>
        <a class="nav-pill" href="/?news=1">✨ In-Game News</a>
        <a class="nav-pill ${isChangelog ? 'active' : ''}" href="/changelog">Changelog</a>
        <a class="nav-pill ${isDocs ? 'active' : ''}" href="/docs">Docs</a>
        <a class="nav-pill ${isDeploy ? 'active' : ''}" href="/deploy">Contract Studio</a>
        <a class="nav-pill" href="/changelog.xml">RSS 2.0</a>
        <a class="nav-pill" href="/atom.xml">Atom</a>
        <a class="nav-pill" href="/feed.json">JSON Feed</a>
        <a class="nav-pill" href="${escapeHtml(githubUrl)}" target="_blank" rel="noopener">GitHub ↗</a>
      </nav>
    </header>`;
}

export function renderRssFeedXml({
  origin,
  githubUrl,
  wifContract,
  releases,
  vaultInfo = null,
}) {
  const latestDate = releases[0]?.publishedAt || '2026-11-02T12:00:00Z';
  const vaultSuffix = vaultInfo?.vaultContractAddress
    ? ` Official Harbor Vault contract: ${vaultInfo.vaultContractAddress}.`
    : '';
  const itemsXml = releases
    .map((rel) => {
      const pubDate = new Date(rel.publishedAt || `${rel.date}T12:00:00Z`).toUTCString();
      const linkUrl = `${origin}/changelog#${rel.version}`;
      const categoriesXml = (rel.categories || ['Release'])
        .map((cat) => `<category>${escapeXml(cat)}</category>`)
        .join('');
      const summaryText = rel.highlights.map((h, i) => `${i + 1}. ${h}`).join(' ');
      return `    <item>
      <title>${escapeXml(`Harbor Tycoon ${rel.version}: ${rel.title}`)}</title>
      <link>${escapeXml(linkUrl)}</link>
      <guid isPermaLink="true">${escapeXml(linkUrl)}</guid>
      <pubDate>${escapeXml(pubDate)}</pubDate>
      ${categoriesXml}
      <description>${escapeXml(`${summaryText} GitHub Release: ${rel.tagUrl}`)}</description>
    </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Harbor Tycoon Changelog &amp; Release Feed</title>
    <link>${escapeXml(`${origin}/changelog`)}</link>
    <atom:link href="${escapeXml(`${origin}/changelog.xml`)}" rel="self" type="application/rss+xml" />
    <description>${escapeXml(`Verified product ships, AI Merchant Engine upgrades, and gameplay releases for Harbor Tycoon ($GOLD ${wifContract}). Repository: ${githubUrl}.${vaultSuffix}`)}</description>
    <language>en-us</language>
    <lastBuildDate>${escapeXml(new Date(latestDate).toUTCString())}</lastBuildDate>
    <docs>${escapeXml(`${origin}/docs`)}</docs>
${itemsXml}
  </channel>
</rss>`;
}

export function renderAtomFeedXml({
  origin,
  githubUrl,
  wifContract,
  releases,
}) {
  const latestIso = new Date(releases[0]?.publishedAt || '2026-11-02T12:00:00Z').toISOString();
  const entriesXml = releases
    .map((rel) => {
      const iso = new Date(rel.publishedAt || `${rel.date}T12:00:00Z`).toISOString();
      const entryUrl = `${origin}/changelog#${rel.version}`;
      const listHtml = `<ol>${rel.highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join('')}</ol><p><a href="${escapeHtml(rel.tagUrl)}">GitHub Release ${escapeHtml(rel.version)}</a></p>`;
      return `  <entry>
    <id>${escapeXml(entryUrl)}</id>
    <title>${escapeXml(`Harbor Tycoon ${rel.version}: ${rel.title}`)}</title>
    <link rel="alternate" type="text/html" href="${escapeXml(entryUrl)}" />
    <link rel="related" type="text/html" href="${escapeXml(rel.tagUrl)}" />
    <published>${escapeXml(iso)}</published>
    <updated>${escapeXml(iso)}</updated>
    <summary>${escapeXml(rel.highlights[0] || rel.title)}</summary>
    <content type="html">${escapeXml(listHtml)}</content>
  </entry>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>${escapeXml(`${origin}/changelog`)}</id>
  <title>Harbor Tycoon Changelog &amp; Release Feed</title>
  <subtitle>${escapeXml(`Six-year 3D Harbor Diorama and 2D street trading board game with AI Merchant Engine ($GOLD ${wifContract}). Repo: ${githubUrl}`)}</subtitle>
  <updated>${escapeXml(latestIso)}</updated>
  <link rel="self" type="application/atom+xml" href="${escapeXml(`${origin}/atom.xml`)}" />
  <link rel="alternate" type="text/html" href="${escapeXml(`${origin}/changelog`)}" />
  <author>
    <name>Harbor Tycoon</name>
    <uri>${escapeXml(origin)}</uri>
  </author>
${entriesXml}
</feed>`;
}

export function buildJsonFeedPayload({
  origin,
  githubUrl,
  wifContract,
  releases,
  vaultInfo = null,
}) {
  return {
    version: 'https://jsonfeed.org/version/1.1',
    title: 'Harbor Tycoon Changelog & Release Feed',
    home_page_url: origin,
    feed_url: `${origin}/feed.json`,
    description:
      'Verified product ships, AI Merchant Engine updates, and gameplay releases for Harbor Tycoon ($GOLD).',
    language: 'en-US',
    ok: true,
    project: 'Harbor Tycoon',
    chainId: 4663,
    wifTokenContract: wifContract,
    vaultContractAddress: vaultInfo?.vaultContractAddress || null,
    vaultExplorerUrl: vaultInfo?.explorerUrl || null,
    websiteUrl: origin,
    githubUrl,
    changelogUrl: `${origin}/changelog`,
    updatesUrl: `${origin}/changelog`,
    docsUrl: `${origin}/docs`,
    rssFeedUrl: `${origin}/changelog.xml`,
    atomFeedUrl: `${origin}/atom.xml`,
    releases,
    items: releases.map((rel) => {
      const iso = new Date(rel.publishedAt || `${rel.date}T12:00:00Z`).toISOString();
      const permalink = `${origin}/changelog#${rel.version}`;
      return {
        id: permalink,
        url: permalink,
        external_url: rel.tagUrl,
        title: `Harbor Tycoon ${rel.version}: ${rel.title}`,
        content_text: rel.highlights.map((h, i) => `${i + 1}. ${h}`).join('\n'),
        content_html: `<ol>${rel.highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join('')}</ol>`,
        date_published: iso,
        tags: rel.categories || ['Release'],
      };
    }),
  };
}

export function renderRobotsTxt(origin) {
  return [
    'User-agent: *',
    'Allow: /',
    `Sitemap: ${origin}/sitemap.xml`,
    '',
  ].join('\n');
}

export function renderSitemapXml(origin, lastmod = '2026-11-02') {
  const routes = [
    { path: '/', priority: '1.0' },
    { path: '/changelog', priority: '0.9' },
    { path: '/docs', priority: '0.9' },
    { path: '/deploy', priority: '0.8' },
    { path: '/changelog.xml', priority: '0.8' },
    { path: '/atom.xml', priority: '0.8' },
    { path: '/feed.json', priority: '0.8' },
  ];
  const urlsXml = routes
    .map(
      (r) => `  <url>
    <loc>${escapeXml(`${origin}${r.path}`)}</loc>
    <lastmod>${escapeXml(lastmod)}</lastmod>
    <priority>${r.priority}</priority>
  </url>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>`;
}

export function renderLlmsTxt({ origin, githubUrl, wifContract, releases, vaultInfo = null }) {
  const vaultLine = vaultInfo?.vaultContractAddress
    ? `4. Official RobinTownHarborVault (RTOWN) Contract on Chain 4663: ${vaultInfo.vaultContractAddress} (https://robinhoodchain.blockscout.com/address/${vaultInfo.vaultContractAddress})`
    : `4. RobinTownHarborVault (RTOWN) Contract Studio on Chain 4663: ${origin}/deploy`;
  const releaseLines = releases
    .map((rel, i) => `${i + 1}. ${rel.version} (${rel.date}): ${rel.title} (${rel.tagUrl})`)
    .join('\n');

  return `# Harbor Tycoon

> Six-year 3D Harbor Diorama and 2D street negotiation board game powered by the AI Merchant Engine and $GOLD Harbor Economy.

## Primary Links & Feeds

1. Live Web Game: ${origin}/
2. GitHub Repository: ${githubUrl}
3. Official Harbor Economy Token ($GOLD): ${wifContract}
${vaultLine}
5. Web Changelog: ${origin}/changelog
6. RSS 2.0 Release Feed: ${origin}/changelog.xml
7. Atom 1.0 Release Feed: ${origin}/atom.xml
8. JSON Feed 1.1: ${origin}/feed.json
9. Web Game & Smart Contract Documentation: ${origin}/docs

## Shipped Releases

${releaseLines}
`;
}

export function renderDocsHtml({
  origin,
  githubUrl,
  wifContract,
  vaultMetadata,
  vaultInfo = null,
}) {
  const vaultAddr = vaultInfo?.vaultContractAddress || null;
  const vaultBlockscoutUrl = vaultAddr
    ? `https://robinhoodchain.blockscout.com/address/${vaultAddr}`
    : null;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Harbor Tycoon Docs · Gameplay Rules, $GOLD Economy &amp; AI Merchant Engine</title>
    <meta name="description" content="Complete web game documentation for Harbor Tycoon: 6-year harbor rules, storefront $GOLD yield table, Zodiac market events, AI Merchant counter-offers, and WebSocket multiplayer protocol." />
    <link rel="canonical" href="${escapeHtml(origin)}/docs" />
    <link rel="vcs-git" href="${escapeHtml(githubUrl)}" />
    <link rel="alternate" type="application/rss+xml" title="Harbor Tycoon Changelog (RSS 2.0)" href="${escapeHtml(origin)}/changelog.xml" />
    <link rel="alternate" type="application/atom+xml" title="Harbor Tycoon Changelog (Atom 1.0)" href="${escapeHtml(origin)}/atom.xml" />
    <link rel="alternate" type="application/feed+json" title="Harbor Tycoon Release Feed (JSON)" href="${escapeHtml(origin)}/feed.json" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Harbor Tycoon" />
    <meta property="og:url" content="${escapeHtml(origin)}/docs" />
    <meta property="og:title" content="Harbor Tycoon · Official Web Game &amp; $GOLD Documentation" />
    <meta property="og:description" content="Gameplay loop, 6 storefront payout tables, $GOLD flywheel math, and AI Merchant Engine reference." />
    <meta property="og:image" content="${escapeHtml(origin)}/assets/saigon/saigon-town-og-v8.png?v=v13" />
    <style>${renderSharedPortalCss()}</style>
  </head>
  <body>
    <div class="portal-shell">
      ${renderPortalTopbarHtml('docs', githubUrl)}

      <header class="hero">
        <span class="kicker">OFFICIAL WEB GAME DOCUMENTATION · AI MERCHANT ENGINE</span>
        <h1>Harbor Tycoon Player Guide &amp; Technical Reference</h1>
        <p>Harbor Tycoon is a 4-player street negotiation and harbor shophouse board game powered by the AI Merchant Engine and <code>$GOLD</code>. Switch live between a Three.js 3D Harbor Diorama and an illustrated 2D street board, haggle two-way OTC deals with AI Rivals, and compound annual <code>$GOLD</code> yields across six zodiac years.</p>
        <div class="stat-cards">
          <div class="stat-card"><small>Harbor Map</small><strong>72 Plots · 6 Districts</strong></div>
          <div class="stat-card"><small>Match Length</small><strong>6 Zodiac Years</strong></div>
          <div class="stat-card"><small>Storefront Chains</small><strong>6 Shop Types (3 to 6 Tiles)</strong></div>
          <div class="stat-card"><small>Settlement Network</small><strong>Robinhood Chain (4663)</strong></div>
        </div>
        <div class="contract-meta">
          <div>Official World is Flat (<code>$wif</code>) Token: <a href="https://robinhoodchain.blockscout.com/token/${escapeHtml(wifContract)}" target="_blank" rel="noopener"><code>${escapeHtml(wifContract)}</code></a></div>
          ${
            vaultAddr && vaultBlockscoutUrl
              ? `<div style="margin-top:4px">Active RobinTownHarborVault (<code>RTOWN</code>): <a href="${escapeHtml(vaultBlockscoutUrl)}" target="_blank" rel="noopener"><code>${escapeHtml(vaultAddr)}</code></a></div>`
              : `<div style="margin-top:4px">RobinTownHarborVault Studio (<code>${escapeHtml(vaultMetadata.compilerVersion)}</code>): <a href="/deploy">${escapeHtml(origin)}/deploy</a></div>`
          }
          <div style="margin-top:4px">Syndicated Release Feeds: <a href="/changelog">/changelog</a> · <a href="/changelog.xml">RSS 2.0 (/changelog.xml)</a> · <a href="/atom.xml">Atom 1.0 (/atom.xml)</a> · <a href="/feed.json">JSON Feed (/feed.json)</a></div>
        </div>
      </header>

      <div class="docs-grid">
        <aside class="docs-toc" aria-label="Documentation sections">
          <h2>Contents</h2>
          <ol>
            <li><a href="#turn-loop">Six-Year Turn Loop</a></li>
            <li><a href="#storefront-yields">Storefront Yield Matrix</a></li>
            <li><a href="#districts-events">Districts &amp; Zodiac Events</a></li>
            <li><a href="#wif-flywheel">$wif Retention Flywheel</a></li>
            <li><a href="#smart-contract">HarborVault Smart Contract</a></li>
            <li><a href="#multiplayer-api">Multiplayer &amp; HTTP APIs</a></li>
            <li><a href="#controls-views">3D Views &amp; Controls</a></li>
          </ol>
        </aside>

        <main>
          <section class="doc-section" id="turn-loop">
            <h2>1. Six-Year Harbor Turn Loop</h2>
            <p>Four merchants (<code>You</code>, <code>Cole</code>, <code>Maya</code>, and <code>Clara</code> in solo play, or up to four live human players via 6-character WebSocket room codes) start with <code>50 $wif</code> working capital and compete across six Zodiac Years: <code>Snake</code>, <code>Horse</code>, <code>Goat</code>, <code>Monkey</code>, <code>Rooster</code>, and <code>Dog</code>. Highest total <code>$wif</code> cash after the Year 6 payday wins.</p>
            <ol>
              <li><strong>Phase 01: Receive Deeds &amp; Shop Tiles.</strong> Draw street address cards and keep <code>5, 4, 3, 2, 2, 2</code> numbered plots in Years 1 through 6. Receive <code>5</code> random shop tiles in Year 1 and <code>4</code> tiles in Years 2 through 6.</li>
              <li><strong>Phase 02: OTC Bargaining Table.</strong> Negotiate open bilateral deals combining <code>$wif</code> cash, empty plots, built storefronts, and unplaced shop tiles. AI neighbors propose 1-click counter-offers when an offer is close, and Rival Monopoly Risk alerts warn before you complete an opponent chain.</li>
              <li><strong>Phase 03: Open Storefronts.</strong> Place shop tiles from your rack onto your own empty plots at zero placement cost. Orthogonally adjacent tiles of the same shop type and owner stool merge into multi-lot 3D shophouse clusters.</li>
              <li><strong>Phase 04: Annual $wif Payday.</strong> Every connected storefront cluster pays annual <code>$wif</code> dividends, boosted by the active Zodiac Market Event, District Guild Majority Seals, and the <code>1.20x</code> Harbor Vault staking multiplier.</li>
            </ol>
          </section>

          <section class="doc-section" id="storefront-yields">
            <h2>2. Storefront Types &amp; Annual $wif Yield Matrix</h2>
            <p>Each storefront belongs to one of six neighborhood trades with target chain sizes from <code>3</code> to <code>6</code> connected plots. Larger target chains pay steeper completion premiums every payday.</p>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Storefront Type</th>
                    <th>Code</th>
                    <th>Complete Size</th>
                    <th>Growing 1 / 2 / 3 / 4 / 5 Tiles</th>
                    <th>Complete Chain ($wif/yr)</th>
                    <th>1.20x Staked Complete</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Coffee House</strong></td>
                    <td><code>CF</code></td>
                    <td>3 plots</td>
                    <td>10 / 20 $wif</td>
                    <td><strong>50 $wif/yr</strong></td>
                    <td>60 $wif/yr</td>
                  </tr>
                  <tr>
                    <td><strong>Corner Bakery</strong></td>
                    <td><code>BK</code></td>
                    <td>3 plots</td>
                    <td>10 / 20 $wif</td>
                    <td><strong>50 $wif/yr</strong></td>
                    <td>60 $wif/yr</td>
                  </tr>
                  <tr>
                    <td><strong>Noodle Kitchen</strong></td>
                    <td><code>ND</code></td>
                    <td>4 plots</td>
                    <td>10 / 20 / 40 $wif</td>
                    <td><strong>80 $wif/yr</strong></td>
                    <td>96 $wif/yr</td>
                  </tr>
                  <tr>
                    <td><strong>Flower Studio</strong></td>
                    <td><code>FL</code></td>
                    <td>4 plots</td>
                    <td>10 / 20 / 40 $wif</td>
                    <td><strong>80 $wif/yr</strong></td>
                    <td>96 $wif/yr</td>
                  </tr>
                  <tr>
                    <td><strong>Silk Tailor</strong></td>
                    <td><code>ST</code></td>
                    <td>5 plots</td>
                    <td>10 / 20 / 40 / 60 $wif</td>
                    <td><strong>110 $wif/yr</strong></td>
                    <td>132 $wif/yr</td>
                  </tr>
                  <tr>
                    <td><strong>Corner Grocer</strong></td>
                    <td><code>CG</code></td>
                    <td>6 plots</td>
                    <td>10 / 20 / 40 / 60 / 80 $wif</td>
                    <td><strong>140 $wif/yr</strong></td>
                    <td>168 $wif/yr</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section class="doc-section" id="districts-events">
            <h2>3. Six Harbor Districts, Guild Seals &amp; Zodiac Market Events</h2>
            <p>The harbor map spans <code>72</code> numbered plots divided evenly into six 12-plot commercial districts: <code>01 Sherwood</code> (Plots 1 to 12), <code>02 Clocktower</code> (Plots 13 to 24), <code>03 Harborview</code> (Plots 25 to 36), <code>04 Lantern Hall</code> (Plots 37 to 48), <code>05 Grand Market</code> (Plots 49 to 60), and <code>06 Maple Lane</code> (Plots 61 to 72).</p>
            <p><strong>District Guild Majority Seal (+15 $wif/yr):</strong> Holding <code>6</code> or more plots inside any single 12-plot district awards the Guild Majority Seal and adds <code>+15 $wif</code> to every annual payday for each majority district controlled.</p>
            <h3>Deterministic Zodiac Market Events</h3>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Event Name</th>
                    <th>Target Scope</th>
                    <th>Annual Payday Bonus</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td><strong>Harbor Cargo Surge</strong></td><td>Harborview &amp; Grand Market</td><td>+6 $wif per storefront group</td></tr>
                  <tr><td><strong>Night Market Festival</strong></td><td>Coffee House &amp; Noodle Kitchen</td><td>+6 $wif per storefront group</td></tr>
                  <tr><td><strong>Morning Bake &amp; Bloom</strong></td><td>Corner Bakery &amp; Flower Studio</td><td>+6 $wif per storefront group</td></tr>
                  <tr><td><strong>Merchant Guild Fair</strong></td><td>Silk Tailor &amp; Corner Grocer</td><td>+8 $wif per storefront group</td></tr>
                  <tr><td><strong>Master Artisan Grant</strong></td><td>All Complete Storefront Chains</td><td>+12 $wif Master Ribbon per complete chain</td></tr>
                  <tr><td><strong>Port District Boom</strong></td><td>Sherwood, Clocktower &amp; Maple Lane</td><td>+4 $wif per built shop</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section class="doc-section" id="wif-flywheel">
            <h2>4. World is Flat ($wif) Tokenomics Flywheel</h2>
            <p>Robin Town uses the official World is Flat ERC-20 token (<code>${escapeHtml(wifContract)}</code>) on Robinhood Chain Mainnet (<code>Chain ID 4663</code>) as its sole transferable token, paired with permanent burns to <code>0x000000000000000000000000000000000000dEaD</code>.</p>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Game Mode / Mechanism</th>
                    <th>Entry / Stake</th>
                    <th>Economic Flow &amp; Burn Mechanics</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Casual Town</strong></td>
                    <td>0 $wif (Free)</td>
                    <td>Awards Town Points on every match; swapping points to $wif (10 pts = 1 $wif) burns 3% permanently.</td>
                  </tr>
                  <tr>
                    <td><strong>Daily Harbor Seed</strong></td>
                    <td>0 $wif (UTC Seed)</td>
                    <td>Identical worldwide 6-year draw per UTC date, 1.1x to 1.5x multi-day streak multipliers, and 1200x630 PNG Empire Score Cards.</td>
                  </tr>
                  <tr>
                    <td><strong>Ranked 1,000 $wif Arena</strong></td>
                    <td>1,000 $wif / seat</td>
                    <td>4,000 $wif pot: 2,000 $wif 1st (50%), 1,000 $wif 2nd (25%), 600 $wif 3rd (15%), 200 $wif burned (5%), 200 $wif to Vault (5%).</td>
                  </tr>
                  <tr>
                    <td><strong>OTC Bargaining Cash Fee</strong></td>
                    <td>1% of cash leg</td>
                    <td>Every settled bilateral $wif cash transfer routes a 1% micro-fee into the neighborhood Staking Vault.</td>
                  </tr>
                  <tr>
                    <td><strong>Harbor Vault Staking</strong></td>
                    <td>10 to 500 $wif</td>
                    <td>Instant-withdrawal staking unlocks on-chain Patron status at 10 $wif and a 1.20x annual payday boost in-game.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section class="doc-section" id="smart-contract">
            <h2>5. RobinTownHarborVault.sol Smart Contract Reference</h2>
            <p><code>contracts/RobinTownHarborVault.sol</code> (compiled with <code>${escapeHtml(vaultMetadata.compilerVersion)}</code>, EVM <code>${escapeHtml(vaultMetadata.evmVersion)}</code>, optimizer <code>${vaultMetadata.optimizerRuns}</code> runs) anchors Year 6 match scores on Robinhood Chain (<code>4663</code>), manages non-custodial <code>$wif</code> staking and 50/50 district patronage burns, and mints non-transferable soulbound Harbor Reputation (<code>RTOWN</code>).</p>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Function Signature</th>
                    <th>Selector</th>
                    <th>Behavior &amp; On-Chain Invariants</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>stakeWif(uint256 amount)</code></td>
                    <td><code>0x92680b29</code></td>
                    <td>Deposits $wif into instant-withdrawal vault; 10+ $wif activates <code>hasPaydayBoost</code>.</td>
                  </tr>
                  <tr>
                    <td><code>unstakeWif(uint256 amount)</code></td>
                    <td><code>0xea09e357</code></td>
                    <td>Withdraws staked $wif immediately back to the caller with zero lockup penalty.</td>
                  </tr>
                  <tr>
                    <td><code>patronizeDistrict(uint8 districtId, uint256 amount)</code></td>
                    <td><code>0x5798edad</code></td>
                    <td>Burns 50% to <code>0x...dEaD</code>, routes 50% to Harbor Pool, and mints 10 soulbound <code>RTOWN</code> per 1 $wif.</td>
                  </tr>
                  <tr>
                    <td><code>enterRankedHarbor(bytes32 matchId, uint256 buyInAmount)</code></td>
                    <td><code>0x5ef615b7</code></td>
                    <td>Burns 5% to <code>0x...dEaD</code>, escrows 95% in Harbor Pool, and mints 5 soulbound <code>RTOWN</code> per 1 $wif.</td>
                  </tr>
                  <tr>
                    <td><code>recordHarborMatch(uint32 dailySeedYmd, uint32 finalNetWorthWif, uint8 districtsWon)</code></td>
                    <td><code>0xfa9e6186</code></td>
                    <td>Gas-only Year 6 match anchor; enforces one Daily Seed anchor per UTC day and mints soulbound <code>RTOWN</code>.</td>
                  </tr>
                  <tr>
                    <td><code>getPlayerSummary(address player)</code></td>
                    <td><code>0xdc96d5fc</code></td>
                    <td>Returns staked $wif, lifetime burned $wif, <code>RTOWN</code> reputation, matches played, best net worth, and boost flag.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section class="doc-section" id="multiplayer-api">
            <h2>6. Live HTTP, Syndication Feeds &amp; WebSocket Multiplayer API</h2>
            <p>The production server (<code>scripts/serve-prod.mjs</code> and <code>scripts/ws-relay.mjs</code>) exposes zero-dependency RFC 6455 WebSocket rooms alongside JSON and XML endpoints for wallets, leaderboards, and release syndication.</p>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Endpoint</th>
                    <th>Format</th>
                    <th>Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td><code>GET /changelog</code></td><td>HTML</td><td>Human and crawler readable release changelog with semantic version anchors.</td></tr>
                  <tr><td><code>GET /changelog.xml</code></td><td>RSS 2.0 XML</td><td>RFC 822 syndication feed (aliased at <code>/rss.xml</code> and <code>/feed.xml</code>).</td></tr>
                  <tr><td><code>GET /atom.xml</code></td><td>Atom 1.0 XML</td><td>RFC 4287 Atom release feed with ISO 8601 timestamps and HTML content.</td></tr>
                  <tr><td><code>GET /feed.json</code></td><td>JSON Feed 1.1</td><td>Machine readable JSON Feed 1.1 and Chain 4663 contract metadata (aliased at <code>/updates.json</code>).</td></tr>
                  <tr><td><code>GET /api/onchain-wif</code></td><td>JSON</td><td>Live Robinhood Chain Mainnet block height, $wif supply, and burn sink telemetry.</td></tr>
                  <tr><td><code>GET /api/wallets</code></td><td>JSON</td><td>Harbor Wallet Registry leaderboard, verified wallets, and active Daily Seed standings.</td></tr>
                  <tr><td><code>POST /api/wallets/verify</code></td><td>JSON</td><td>Gasless EIP-191 <code>personal_sign</code> wallet ownership verification.</td></tr>
                  <tr><td><code>POST /api/wallets/tx</code></td><td>JSON</td><td>On-chain Chain 4663 transaction receipt verifier for $wif burns and vault calls.</td></tr>
                  <tr><td><code>GET /api/rooms</code> &amp; <code>/ws?room=CODE</code></td><td>JSON / WS</td><td>Live 4-seat cross-device multiplayer room discovery and state synchronization.</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section class="doc-section" id="controls-views">
            <h2>7. 3D Harbor Views, Fast Play &amp; Keyboard Shortcuts</h2>
            <ol>
              <li><strong>Three Live Board Modes (Hotkey <code>V</code>):</strong> Toggle seamlessly with zero state loss between <code>3D City</code> (Three.js WebGL Harbor Diorama with Day, Sunset, and Night lighting, harbor barges, and unified multi-tile roofs), <code>3D Tilt</code> (tilted Aseprite tabletop), and <code>2D</code> (crisp flat street map).</li>
              <li><strong>Fast Play Simulation (Hotkey <code>F</code>):</strong> Watch or accelerate a full 6-year A-to-Z match at <code>1x</code>, <code>3x</code>, or <code>8x</code> speed with smart AI drafting, bot-to-bot OTC swaps, and automatic storefront construction.</li>
              <li><strong>iPod Click-Wheel Audio &amp; HUD:</strong> Control original Web Audio harbor tracks, inspect live District Guild Seals in the two-page Shopkeeper Ledger, and connect EIP-6963 desktop or mobile wallets from the <code>$wif</code> Hub.</li>
            </ol>
          </section>
        </main>
      </div>
    </div>
  </body>
</html>`;
}
