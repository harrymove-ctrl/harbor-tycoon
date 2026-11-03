# Robin Town Harbor Vault & Game Smart Contract (Robinhood Chain Mainnet 4663)

`RobinTownHarborVault.sol` is the official Solidity `^0.8.24` (`EVM paris`, optimizer `200` runs) game smart contract for **Robin Town** on **Robinhood Chain Mainnet (`Chain ID 4663`)**, built around the official **World is Flat (`$wif`)** ERC-20 token (`0x5173b8eA6923c2d40267890D45C46a3480954773`, `18` decimals).

## Core On-Chain Game Mechanics

1. **Gas-Only Year 6 Match & Daily Seed Anchoring (`recordHarborMatch`)**:
   1. Any player connected with MetaMask or Rabby on Robinhood Chain (`4663`) can permanently anchor their 6-year Harbor Empire score (`finalNetWorthWif`, `districtsWon`, and `dailySeedYmd`) on chain with zero `$wif` spend required.
   2. Enforces one Daily Seed anchor per `(player, dailySeedYmd)` (`DailySeedAlreadyAnchored`), tracks `totalOnChainMatches` and `totalUniquePlayers`, and mints non-transferable soulbound **Harbor Reputation (`RTOWN`)** (`name() = "Robin Town"`, `symbol() = "RTOWN"`).
2. **Instant-Withdrawal `$wif` Staking (`stakeWif` / `unstakeWif`)**:
   1. Traders lock `$wif` (`>= 10 $wif` accessible Mainnet threshold) to activate the **1.20x annual storefront payday multiplier** inside Robin Town.
   2. Principal staked balances (`totalStaked`) are strictly segregated from prize pool funds (`totalHarborPool`) so traders can withdraw `100%` of their staked `$wif` at any time.
3. **Deflationary District Patronage & Ranked Harbor Arena (`patronizeDistrict` / `enterRankedHarbor`)**:
   1. Splits every `$wif` deposit atomically on chain: **50%** is transferred directly to the permanent burn sink (`0x000000000000000000000000000000000000dEaD`) and **50%** enters `totalHarborPool` for leaderboard rewards, while minting `10x` bonus `RTOWN` Harbor Reputation.

## Option A: 1-Click Browser MetaMask Deploy Studio (Recommended, Zero Private Key Exposure)

1. Open `https://robin-town-production.up.railway.app/deploy` in Chrome or Brave with MetaMask or Rabby.
2. Click **1. Connect MetaMask / Rabby (Chain 4663)**, then **2. Deploy RobinTownHarborVault Now** (`~1.32M` gas on Chain `4663`).
3. Click **3. Sign & Activate Live on Robin Town**: the server cryptographically verifies `eth_getCode` byte-for-byte against the compiled `RobinTownHarborVault` artifact and binds the Blockscout contract URL live across `/`, `/updates`, `/updates.json`, `$wif` Hub, and the Year 6 Victory Score Card.

## Option B: CLI Deploy via Foundry (`forge`)

```bash
forge test -vvv
forge create contracts/RobinTownHarborVault.sol:RobinTownHarborVault \
  --rpc-url https://rpc.mainnet.chain.robinhood.com \
  --chain-id 4663 \
  --private-key "$DEPLOYER_PRIVATE_KEY" \
  --constructor-args 0x5173b8eA6923c2d40267890D45C46a3480954773
```
