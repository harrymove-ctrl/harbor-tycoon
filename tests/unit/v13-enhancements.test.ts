import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  WalletAdapter,
  buildMetaMaskMobileDeepLink,
  clearEip6963ProvidersForTest,
  discoverEip6963Wallets,
  encodeVaultEnterRankedCalldata,
  encodeVaultHasPaydayBoostCalldata,
  encodeVaultPatronizeDistrictCalldata,
  encodeVaultStakeWifCalldata,
  encodeVaultStakedBalanceOfCalldata,
  encodeVaultUnstakeWifCalldata,
  isMobileBrowserWithoutWallet,
  registerEip6963Provider,
} from '../../src/tokenomics/wallet.js';
import {
  DISTRICT_MAJORITY_BONUS,
  claimPlots,
  chooseSmartDraftPlots,
  detectRivalMonopolyRisk,
  getPlayerDistrictMajorities,
  getYearMarketEvent,
  incomeBreakdown,
  newDailyGame,
  proposeBotCounterOffer,
} from '../../src/town/engine.js';
import { createTrading } from '../../src/town/trading.js';
import { buildEmpireXShareUrl } from '../../src/town/score-card.js';
// @ts-expect-error ESM script
import { createWalletRegistry, MAX_PLAUSIBLE_NET_WORTH_WIF } from '../../scripts/wallet-registry.mjs';
// @ts-expect-error ESM script
import { SHIP_RELEASES, renderDynamicIndexHtml, renderUpdatesHtml } from '../../scripts/ship-updates.mjs';

describe('v1.3 Wave 1: EIP-6963 Multi-Wallet, Mobile Deep Links & HarborVault ABI', () => {
  it('encodes all 6 RobinTownHarborVault function selectors accurately', () => {
    const stakeData = encodeVaultStakeWifCalldata(500, 18);
    const unstakeData = encodeVaultUnstakeWifCalldata(500, 18);
    const patronData = encodeVaultPatronizeDistrictCalldata(2, 10, 18);
    const rankedData = encodeVaultEnterRankedCalldata(
      '0x0000000000000000000000000000000000000000000000000000000000000001',
      1000,
      18,
    );
    const boostData = encodeVaultHasPaydayBoostCalldata(
      '0x1000000000000000000000000000000000000001',
    );
    const balData = encodeVaultStakedBalanceOfCalldata(
      '0x1000000000000000000000000000000000000001',
    );

    assert.equal(stakeData.slice(0, 10), '0x92680b29');
    assert.equal(stakeData.length, 74);
    assert.equal(unstakeData.slice(0, 10), '0xea09e357');
    assert.equal(patronData.slice(0, 10), '0x5798edad');
    assert.equal(patronData.length, 138);
    assert.equal(rankedData.slice(0, 10), '0x5ef615b7');
    assert.equal(boostData.slice(0, 10), '0x64295ca5');
    assert.equal(balData.slice(0, 10), '0x16765391');
  });

  it('discovers EIP-6963 wallets, switches providers, and triggers wallet_watchAsset', async () => {
    clearEip6963ProvidersForTest();
    let watchedSymbol = '';
    const rabbyMock = {
      request: async ({ method, params }: { method: string; params?: unknown }) => {
        if (method === 'wallet_watchAsset') {
          watchedSymbol = (params as { options?: { symbol?: string } })?.options?.symbol ?? '';
          return true;
        }
        if (method === 'eth_requestAccounts') {
          return ['0x1111111111111111111111111111111111111111'];
        }
        if (method === 'eth_chainId') return '0x1237';
        if (method === 'wallet_switchEthereumChain') return null;
        if (method === 'eth_call') return '0x0de0b6b3a7640000'; // 1.0 WIF
        return null;
      },
    };
    registerEip6963Provider({
      info: {
        uuid: 'rabby-uuid-1',
        name: 'Rabby Wallet',
        icon: 'data:image/png;base64,',
        rdns: 'io.rabby',
      },
      provider: rabbyMock,
    });

    const found = discoverEip6963Wallets();
    assert.equal(found.length, 1);
    assert.equal(found[0]!.info.rdns, 'io.rabby');

    const adapter = new WalletAdapter({ mode: 'simulation', autoConnect: true });
    assert.equal(adapter.selectEip6963Provider('io.rabby'), true);
    assert.equal(adapter.getSelectedProviderRdns(), 'io.rabby');

    const added = await adapter.watchMainnetWifAsset();
    assert.equal(added, true);
    assert.equal(watchedSymbol, 'WIF');
    clearEip6963ProvidersForTest();
  });

  it('builds MetaMask Mobile deep links preserving room and daily challenge params', () => {
    const link = buildMetaMaskMobileDeepLink(
      'https://harbor-tycoon-production.up.railway.app/?daily=2026-11-02&target=840',
    );
    assert.equal(
      link,
      'https://metamask.app.link/dapp/harbor-tycoon-production.up.railway.app/?daily=2026-11-02&target=840',
    );
    assert.equal(
      isMobileBrowserWithoutWallet(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
        false,
      ),
      true,
    );
    assert.equal(
      isMobileBrowserWithoutWallet(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        false,
      ),
      false,
    );
  });
});

describe('v1.3 Wave 2: Anti-Spoof Match Bounds & Per-IP Match Rate Limiting', () => {
  it('rejects spoofed net worths above MAX_PLAUSIBLE_NET_WORTH_WIF and throttles match spam', async () => {
    const tmpFile = path.join(os.tmpdir(), `robin-v13-reg-${Date.now()}.json`);
    const registry = createWalletRegistry({
      storePath: tmpFile,
      fetchBalance: async () => 12.5,
      matchRateLimitPerMin: 2,
    });

    try {
      assert.throws(
        () => registry.recordMatch({ finalNetWorthWif: MAX_PLAUSIBLE_NET_WORTH_WIF + 1, won: true }),
        /between 0 and 250,000 \$wif/i,
      );
      assert.throws(
        () => registry.recordMatch({ finalNetWorthWif: -5, won: false }),
        /between 0 and 250,000 \$wif/i,
      );
      assert.throws(
        () => registry.recordMatch({ finalNetWorthWif: 420, burnedWif: 99_999, won: true }),
        /burned \$wif must be between 0 and 50,000/i,
      );

      // Spin up ephemeral HTTP server to verify 429 match rate limit
      const srv = http.createServer((req, res) => {
        if (!registry.handleRequest(req, res)) {
          res.writeHead(404);
          res.end();
        }
      });
      await new Promise<void>((resolve) => srv.listen(0, '127.0.0.1', () => resolve()));
      const port = (srv.address() as { port: number }).port;

      const postMatch = (score: number) =>
        fetch(`http://127.0.0.1:${port}/api/wallets/match`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ finalNetWorthWif: score, won: true, entryMode: 'casual' }),
        });

      const r1 = await postMatch(520);
      const r2 = await postMatch(580);
      const r3 = await postMatch(610);
      assert.equal(r1.status, 200);
      assert.equal(r2.status, 200);
      assert.equal(r3.status, 429);

      await new Promise<void>((resolve) => srv.close(() => resolve()));
    } finally {
      try {
        fs.unlinkSync(tmpFile);
      } catch {}
    }
  });
});

describe('v1.3 Wave 3: Zodiac Market Events, District Majorities & AI Counter-Offers', () => {
  it('assigns 6 unique deterministic Zodiac Market Events per Daily Seed and awards +15 $wif Guild Seals', () => {
    const g1 = newDailyGame('2026-11-02');
    const g2 = newDailyGame('2026-11-02');
    const seenIds = new Set<string>();
    for (let yr = 1; yr <= 6; yr++) {
      const e1 = getYearMarketEvent(g1, yr);
      const e2 = getYearMarketEvent(g2, yr);
      assert.equal(e1.id, e2.id);
      seenIds.add(e1.id);
    }
    assert.equal(seenIds.size, 6, 'All 6 Zodiac Market Events should appear once across 6 years');

    // Grant player 0 six plots in Sherwood (Block 0) to unlock Guild Majority Seal
    for (let i = 0; i < 6; i++) {
      g1.lots[i]!.owner = 0;
    }
    const majorities = getPlayerDistrictMajorities(g1, 0);
    assert.deepEqual(majorities, [0]);
    const bd = incomeBreakdown(g1, 0, false);
    assert.equal(bd.districtBonus, DISTRICT_MAJORITY_BONUS);
    assert.ok(bd.total >= DISTRICT_MAJORITY_BONUS);
  });

  it('proposes AI counter-offers and flags rival monopoly risk in OTC Bargaining', () => {
    const state = newDailyGame('2026-11-02');
    claimPlots(state, chooseSmartDraftPlots(state), () => 0.35);

    // Ask Cole for a tile while offering 0 cash -> Cole should propose a cash or asset counter-offer
    state.players[0]!.cash = 120;
    const coleTileIdx = state.players[1]!.tiles.findIndex((c) => c > 0);
    assert.ok(coleTileIdx >= 0);

    const askOffer = {
      partner: 1,
      give: { cash: 0, lots: [] as number[], tiles: [0, 0, 0, 0, 0, 0] },
      take: {
        cash: 0,
        lots: [] as number[],
        tiles: [0, 0, 0, 0, 0, 0].map((v, idx) => (idx === coleTileIdx ? 1 : v)),
      },
    };
    const counter = proposeBotCounterOffer(state, askOffer);
    assert.ok(counter !== null, 'Bot should propose a counter-offer when shortfall is bridgeable');

    // Set up a 2-tile Coffee chain for Cole (plots 0 and 1) plus an empty adjacent plot 3, and offer 1 Coffee tile to test monopoly warning
    state.lots[0]!.owner = 1;
    state.lots[0]!.shop = 0;
    state.lots[1]!.owner = 1;
    state.lots[1]!.shop = 0;
    state.lots[3]!.owner = 1;
    state.lots[3]!.shop = null;
    state.players[0]!.tiles[0] = Math.max(1, state.players[0]!.tiles[0]!);

    const riskyOffer = {
      partner: 1,
      give: { cash: 0, lots: [] as number[], tiles: [1, 0, 0, 0, 0, 0] },
      take: { cash: 30, lots: [] as number[], tiles: [0, 0, 0, 0, 0, 0] },
    };
    const warning = detectRivalMonopolyRisk(state, riskyOffer);
    assert.ok(warning && warning.includes('Coffee'), 'Should warn before handing rival a complete chain');

    // Verify Trading UI renders [data-bargain="accept-counter"] and executes counter-offer cleanly
    const prevDoc = globalThis.document;
    const modalBodyStub = { innerHTML: '' };
    const modalStub = { classList: { add: () => {}, remove: () => {} }, querySelector: () => null };
    globalThis.document = {
      querySelector: (sel: string) => {
        if (sel === '#modal') return modalStub;
        if (sel === '#modal .modal-body') return modalBodyStub;
        return null;
      },
    } as unknown as Document;

    try {
      const trading = createTrading({
        getState: () => state,
        sprite: (_k, id) => `<i data-s="${id}"></i>`,
        token: (p) => `<i data-t="${p}"></i>`,
        modal: (_t, body) => {
          modalBodyStub.innerHTML = body;
        },
        closeModal: () => {},
        onChanged: () => {},
        playSound: () => {},
        onTrading: () => {},
      });
      trading.open(1);
      trading.handle({
        dataset: { bargain: 'asset', side: 'take', kind: 'tile', index: String(coleTileIdx) },
      } as unknown as HTMLElement);
      assert.ok(
        modalBodyStub.innerHTML.includes('data-bargain="accept-counter"'),
        'OTC modal should render 1-click AI Counter-Offer button',
      );
    } finally {
      globalThis.document = prevDoc;
    }
  });
});

describe('v1.3 Wave 4: Ship Updates Log, Dynamic OpenGraph Unfurling & Beat-My-Score Share', () => {
  it('renders semantic English /updates HTML with zero dashes and dynamic OG tags for rooms & challenges', () => {
    assert.ok(SHIP_RELEASES.length >= 4);
    const updatesHtml = renderUpdatesHtml();
    assert.ok(updatesHtml.includes('0x5173b8eA6923c2d40267890D45C46a3480954773'));
    assert.ok(updatesHtml.includes('https://github.com/harrymove-ctrl/harbor-tycoon'));
    assert.ok(!updatesHtml.includes('—') && !updatesHtml.includes('–'));

    const baseIndex = fs.readFileSync(
      path.resolve(process.cwd(), 'index.html'),
      'utf8',
    );
    const roomHtml = renderDynamicIndexHtml(baseIndex, '/?room=WIF777');
    assert.ok(roomHtml.includes('Join Live Room WIF777'));
    assert.ok(roomHtml.includes('content="https://harbor-tycoon-production.up.railway.app/?room=WIF777"'));

    const dailyHtml = renderDynamicIndexHtml(baseIndex, '/?daily=2026-11-02&target=840');
    assert.ok(dailyHtml.includes('Beat 840 $GOLD on Daily Seed 2026-11-02'));

    const g = newDailyGame('2026-11-02');
    g.players[0]!.cash = 840;
    const xUrl = buildEmpireXShareUrl({ state: g, stakedBoost: true });
    const decoded = decodeURIComponent(xUrl);
    assert.ok(decoded.includes('daily=2026-11-02&target=840'));

    const dockerfile = fs.readFileSync(path.resolve(process.cwd(), 'Dockerfile'), 'utf8');
    for (const runtimeScript of [
      'scripts/serve-prod.mjs',
      'scripts/ws-relay.mjs',
      'scripts/wallet-registry.mjs',
      'scripts/ship-updates.mjs',
    ]) {
      assert.ok(
        dockerfile.includes(runtimeScript),
        `Dockerfile runner stage must copy ${runtimeScript}`,
      );
    }
  });
});
