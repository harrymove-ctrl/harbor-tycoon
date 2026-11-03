# Harbor Tycoon Changelog

Live Web Changelog: [https://harbor-tycoon-production.up.railway.app/changelog](https://harbor-tycoon-production.up.railway.app/changelog)
RSS 2.0 Release Feed: [https://harbor-tycoon-production.up.railway.app/changelog.xml](https://harbor-tycoon-production.up.railway.app/changelog.xml)
Atom 1.0 Release Feed: [https://harbor-tycoon-production.up.railway.app/atom.xml](https://harbor-tycoon-production.up.railway.app/atom.xml)
JSON Feed 1.1: [https://harbor-tycoon-production.up.railway.app/feed.json](https://harbor-tycoon-production.up.railway.app/feed.json)
Web Game & `$GOLD` Docs: [https://harbor-tycoon-production.up.railway.app/docs](https://harbor-tycoon-production.up.railway.app/docs)

## v1.5.0 (2026-11-02)

### Unified Changelog Portal, Syndicated Release Feeds & In-Game HUD Polish

1. Launched `/changelog` with interactive category filtering, version permalinks, and auto-discovered syndication tags in `index.html` for automated release crawlers.
2. Added RFC 822 RSS 2.0 (`/changelog.xml`, `/rss.xml`, `/feed.xml`), RFC 4287 Atom 1.0 (`/atom.xml`), and JSON Feed 1.1 (`/feed.json`) feeds publishing every Harbor Tycoon ship.
3. Published comprehensive web game documentation at `/docs` covering the 6-year turn loop, storefront `$GOLD` yield matrix, Zodiac Market Events, and AI Merchant heuristics.
4. Polished in-game top HUD player cards (`+52/yr`), paper calendar header (`HARBOR TYCOON`), bottom-right non-blocking toast notifications, and shop rack yield badges (`+10/yr`) across all 9 responsive viewports.

## v1.4.0 (2026-11-02)

### Harbor Vault Contract, On-Chain Match Anchoring & Deploy Studio

1. Upgraded `contracts/RobinTownHarborVault.sol` (`Solc 0.8.24`, EVM `paris`) with gas-only Year 6 match score anchoring (`recordHarborMatch`), Daily Seed streak protection, and soulbound Harbor Reputation (`RTOWN`).
2. Verified 100% EVM runtime parity and added full Foundry unit tests for staking, 50/50 deflationary burns, and non-transferable reputation.
3. Shipped 1-Click browser Contract Deployer and verification studio at `/deploy`.
4. Wired 1-click Anchor Score On-Chain onto the Year 6 Harbor Empire Score Card and Vault Staking (`1.20x` payday multiplier) inside the `$GOLD` Treasury Hub.

## v1.3.0 (2026-11-02)

### Zodiac Harbor Events, AI Counter-Offers, EIP-6963 Wallets & Beat My Score Links

1. Added 6 deterministic Zodiac Market Events (Harbor Cargo Surge, Night Market Festival, Morning Bake & Bloom, Merchant Guild Fair, Master Artisan Grant, Port District Boom) permuted cleanly per Daily Harbor Seed.
2. Added District Guild Majority Seals (`+15 $GOLD/yr` per 6+ plot majority across the 6 harbor districts) and full income Breakdown tracking in the Shopkeeper Ledger.
3. Added intelligent 1-click AI Counter-Offers and Rival Monopoly Risk warnings inside the OTC Bargaining Table.
4. Added EIP-6963 multi-wallet discovery, mobile MetaMask deep-link handoff, and Beat-My-Score challenge links.
5. Hardened anti-spoof match bounds, per-IP match submission rate limiting, dynamic OpenGraph social preview unfurling (`?room=` and `?daily=&target=`), tabletop deal pings, and Year 6 Harbor Fireworks.

## v1.2.0 (2026-11-01)

### Full-Viewport Responsive Overhaul, Harbor Leaderboard & Daily Seed Streaks

1. Rebuilt responsive geometry across 9 desktop, tablet, compact laptop, mobile portrait, and mobile landscape viewports with zero horizontal overflow.
2. Shipped persistent Harbor Leaderboard and Daily Harbor Challenge standings.
3. Added downloadable `1200x630` Year 6 Harbor Empire Score Cards, live OTC deal-closeness meters, and 1-click Sweeten (`+10 $GOLD`) bargaining.

## v1.1.0 (2026-10-31)

### Fast Play A-to-Z Simulation, Smart Draft Synergies & Interactive Coachmarks

1. Added Fast Play `1x`, `3x`, and `8x` tabletop simulation alongside bot-to-bot OTC bargaining between Cole, Maya, and Clara.
2. Added adjacent corner synergy indicators, marginal `+$GOLD/yr` build yield badges, and a 3-step interactive Year 1 harbor onboarding banner.
3. Upgraded cross-device WebSocket room discovery with 1-click public room joining and perspective-swapped PvP trading.

## v1.0.0 (2026-10-30)

### Harbor Tycoon Launch: 3D Harbor Diorama, 2D Street Board & `$GOLD` Economy

1. Launched 6-year trading board game across 72 plots, 6 harbor districts, and 6 storefront types with zero-loss switching between Three.js 3D Harbor Diorama (Day, Sunset, Night) and 2D Street Board.
2. Integrated `$GOLD` Treasury economy alongside Casual Town free entry, Daily Seed Challenges, and Ranked Arena pots.
