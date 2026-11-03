// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

/**
 * @title RobinTownHarborVault
 * @notice Official Robin Town on-chain game contract on Robinhood Chain Mainnet (Chain ID 4663).
 *         Unifies World is Flat ($wif) instant-withdrawal staking, deflationary district patronage,
 *         ranked harbor arena escrow, Year 6 Daily Seed score anchoring, and soulbound Harbor
 *         Reputation (RTOWN) while keeping $wif (0x5173b8eA6923c2d40267890D45C46a3480954773) as
 *         the sole transferable game token.
 */
contract RobinTownHarborVault {
    string public constant name = "Robin Town";
    string public constant symbol = "RTOWN";
    uint8 public constant decimals = 18;

    string public constant PROJECT_WEBSITE = "https://robin-town-production.up.railway.app";
    string public constant PROJECT_GITHUB = "https://github.com/harrymove-ctrl/robin-town";
    string public constant PROJECT_UPDATES = "https://robin-town-production.up.railway.app/changelog";
    string public constant PROJECT_DOCS = "https://robin-town-production.up.railway.app/docs";
    string public constant PROJECT_FEED_RSS = "https://robin-town-production.up.railway.app/changelog.xml";

    address public constant OFFICIAL_WIF_MAINNET = 0x5173b8eA6923c2d40267890D45C46a3480954773;
    address public constant BURN_SINK = 0x000000000000000000000000000000000000dEaD;
    uint256 public constant MIN_BOOST_STAKE = 10 ether;
    uint32 public constant MAX_PLAUSIBLE_NET_WORTH_WIF = 250_000;
    uint32 public constant MAX_REP_MINT_PER_MATCH = 2_500;
    uint8 public constant DISTRICT_COUNT = 6;
    bytes32 private constant CATEGORY_DISTRICT_PATRON = "DISTRICT_PATRON";

    IERC20 public immutable wif;
    address public owner;

    uint256 private unlocked = 1;

    // Soulbound Harbor Reputation (RTOWN) state
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;

    // $wif Vault & Deflationary Burn state
    uint256 public totalStaked;
    uint256 public totalBurnedViaVault;
    uint256 public totalHarborPool;

    // Game Match & Leaderboard Registry state
    uint64 public totalOnChainMatches;
    uint64 public totalUniquePlayers;

    mapping(address => bool) public hasRegisteredPlayer;
    mapping(address => uint256) public stakedBalanceOf;
    mapping(address => uint256) public lifetimeBurnedBy;
    mapping(address => uint32) public matchesPlayedBy;
    mapping(address => uint32) public bestNetWorthOf;
    mapping(address => uint32) public lastCasualRepDay;
    mapping(address => mapping(uint32 => uint32)) public dailySeedScoreOf;
    mapping(uint8 => uint256) public districtPatronageTotal;
    mapping(bytes32 => mapping(address => uint256)) public matchEntries;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event HarborStaked(address indexed trader, uint256 amount, uint256 newStakedBalance);
    event HarborUnstaked(address indexed trader, uint256 amount, uint256 remainingStakedBalance);
    event HarborBurn(address indexed trader, uint256 burnedAmount, bytes32 indexed category);
    event DistrictPatronized(
        address indexed trader,
        uint8 indexed districtId,
        uint256 totalAmount,
        uint256 burnedAmount,
        uint256 vaultAdded
    );
    event RankedHarborEntered(
        address indexed trader,
        bytes32 indexed matchId,
        uint256 totalAmount,
        uint256 burnedAmount,
        uint256 poolAdded
    );
    event HarborMatchAnchored(
        address indexed player,
        uint32 indexed dailySeedYmd,
        uint32 finalNetWorthWif,
        uint8 districtsWon,
        uint64 matchNumber
    );
    event HarborRewardDistributed(address indexed recipient, uint256 amount, bytes32 indexed reason);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    error ReentrancyBlocked();
    error InvalidAmount();
    error InvalidDistrict();
    error InvalidDailySeed();
    error DailySeedAlreadyAnchored();
    error InsufficientStake();
    error InsufficientPoolBalance();
    error SoulboundReputation();
    error Unauthorized();
    error TransferFailed();

    modifier nonReentrant() {
        if (unlocked != 1) revert ReentrancyBlocked();
        unlocked = 2;
        _;
        unlocked = 1;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    constructor(address wifTokenAddress) {
        address resolved = wifTokenAddress == address(0) ? OFFICIAL_WIF_MAINNET : wifTokenAddress;
        wif = IERC20(resolved);
        owner = msg.sender;
    }

    /**
     * @notice Soulbound Harbor Reputation (RTOWN) cannot be transferred or traded; $wif is the sole money token.
     */
    function allowance(address, address) external pure returns (uint256) {
        return 0;
    }

    function approve(address, uint256) external pure returns (bool) {
        revert SoulboundReputation();
    }

    function transfer(address, uint256) external pure returns (bool) {
        revert SoulboundReputation();
    }

    function transferFrom(address, address, uint256) external pure returns (bool) {
        revert SoulboundReputation();
    }

    /**
     * @notice Returns true if trader qualifies for the 1.20x annual storefront payday multiplier.
     */
    function hasPaydayBoost(address trader) public view returns (bool) {
        return stakedBalanceOf[trader] >= MIN_BOOST_STAKE || lifetimeBurnedBy[trader] >= 1 ether;
    }

    /**
     * @notice Returns a consolidated snapshot of a player's on-chain Harbor Vault & Match profile.
     */
    function getPlayerSummary(
        address trader
    )
        external
        view
        returns (
            uint256 stakedWif,
            uint256 burnedWif,
            uint256 reputation,
            uint32 bestNetWorth,
            uint32 matchesPlayed,
            bool boostActive
        )
    {
        return (
            stakedBalanceOf[trader],
            lifetimeBurnedBy[trader],
            balanceOf[trader],
            bestNetWorthOf[trader],
            matchesPlayedBy[trader],
            hasPaydayBoost(trader)
        );
    }

    /**
     * @notice Anchors a completed 6-year Robin Town match score on Robinhood Chain (gas-only, zero $wif required).
     *         Pass dailySeedYmd as YYYYMMDD (for example 20261102) for Daily Harbor Challenges, or 0 for Casual Town.
     */
    function recordHarborMatch(
        uint32 dailySeedYmd,
        uint32 finalNetWorthWif,
        uint8 districtsWon
    ) external nonReentrant {
        if (finalNetWorthWif == 0 || finalNetWorthWif > MAX_PLAUSIBLE_NET_WORTH_WIF) {
            revert InvalidAmount();
        }
        if (districtsWon > DISTRICT_COUNT) revert InvalidDistrict();

        bool mintRep = false;
        if (dailySeedYmd != 0) {
            if (dailySeedYmd < 20260101 || dailySeedYmd > 21001231) revert InvalidDailySeed();
            if (dailySeedScoreOf[msg.sender][dailySeedYmd] != 0) revert DailySeedAlreadyAnchored();
            dailySeedScoreOf[msg.sender][dailySeedYmd] = finalNetWorthWif;
            mintRep = true;
        } else {
            uint32 utcDay = uint32(block.timestamp / 1 days);
            if (lastCasualRepDay[msg.sender] < utcDay) {
                lastCasualRepDay[msg.sender] = utcDay;
                mintRep = true;
            }
        }

        _touchPlayer(msg.sender);
        unchecked {
            matchesPlayedBy[msg.sender] += 1;
            totalOnChainMatches += 1;
        }
        if (finalNetWorthWif > bestNetWorthOf[msg.sender]) {
            bestNetWorthOf[msg.sender] = finalNetWorthWif;
        }

        if (mintRep) {
            uint32 cappedScore = finalNetWorthWif > MAX_REP_MINT_PER_MATCH
                ? MAX_REP_MINT_PER_MATCH
                : finalNetWorthWif;
            _mintReputation(msg.sender, uint256(cappedScore) * 1 ether);
        }

        emit HarborMatchAnchored(
            msg.sender,
            dailySeedYmd,
            finalNetWorthWif,
            districtsWon,
            totalOnChainMatches
        );
    }

    /**
     * @notice Stakes $wif in the Harbor Vault to activate the 1.20x storefront payday boost.
     *         Principal funds remain 100% withdrawable at any time via unstakeWif.
     */
    function stakeWif(uint256 amount) external nonReentrant {
        if (amount == 0) revert InvalidAmount();
        _pullWif(msg.sender, address(this), amount);
        _touchPlayer(msg.sender);
        stakedBalanceOf[msg.sender] += amount;
        totalStaked += amount;
        emit HarborStaked(msg.sender, amount, stakedBalanceOf[msg.sender]);
    }

    /**
     * @notice Withdraws previously staked $wif back to the trader wallet immediately.
     */
    function unstakeWif(uint256 amount) external nonReentrant {
        if (amount == 0) revert InvalidAmount();
        uint256 current = stakedBalanceOf[msg.sender];
        if (current < amount) revert InsufficientStake();
        unchecked {
            stakedBalanceOf[msg.sender] = current - amount;
            totalStaked -= amount;
        }
        _pushWif(msg.sender, amount);
        emit HarborUnstaked(msg.sender, amount, stakedBalanceOf[msg.sender]);
    }

    /**
     * @notice Patronizes one of the 6 Robin Town harbor districts (0..5) using $wif.
     *         Splits 50% permanently burned to 0x...dEaD and 50% added to the Harbor Pool.
     */
    function patronizeDistrict(uint8 districtId, uint256 amount) external nonReentrant {
        if (districtId >= DISTRICT_COUNT) revert InvalidDistrict();
        if (amount < 2) revert InvalidAmount();

        uint256 burnShare = amount / 2;
        uint256 poolShare = amount - burnShare;

        _pullWif(msg.sender, BURN_SINK, burnShare);
        _pullWif(msg.sender, address(this), poolShare);
        _touchPlayer(msg.sender);

        totalBurnedViaVault += burnShare;
        totalHarborPool += poolShare;
        lifetimeBurnedBy[msg.sender] += burnShare;
        districtPatronageTotal[districtId] += amount;
        _mintReputation(msg.sender, burnShare * 10);

        emit HarborBurn(msg.sender, burnShare, CATEGORY_DISTRICT_PATRON);
        emit DistrictPatronized(msg.sender, districtId, amount, burnShare, poolShare);
    }

    /**
     * @notice Enters a Ranked Harbor Arena match (or Daily Seeded Challenge pot) using $wif.
     *         Splits 50% permanently burned to 0x...dEaD and 50% added to the Harbor Pool.
     */
    function enterRankedHarbor(bytes32 matchId, uint256 amount) external nonReentrant {
        if (amount < 2) revert InvalidAmount();

        uint256 burnShare = amount / 2;
        uint256 poolShare = amount - burnShare;

        _pullWif(msg.sender, BURN_SINK, burnShare);
        _pullWif(msg.sender, address(this), poolShare);
        _touchPlayer(msg.sender);

        totalBurnedViaVault += burnShare;
        totalHarborPool += poolShare;
        lifetimeBurnedBy[msg.sender] += burnShare;
        matchEntries[matchId][msg.sender] += amount;
        _mintReputation(msg.sender, burnShare * 10);

        emit HarborBurn(msg.sender, burnShare, matchId);
        emit RankedHarborEntered(msg.sender, matchId, amount, burnShare, poolShare);
    }

    /**
     * @notice Distributes $wif prizes strictly from totalHarborPool (never touching user staked funds).
     */
    function distributeHarborReward(
        address recipient,
        uint256 amount,
        bytes32 reason
    ) external onlyOwner nonReentrant {
        if (recipient == address(0) || amount == 0) revert InvalidAmount();
        if (amount > totalHarborPool) revert InsufficientPoolBalance();
        unchecked {
            totalHarborPool -= amount;
        }
        _pushWif(recipient, amount);
        emit HarborRewardDistributed(recipient, amount, reason);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert InvalidAmount();
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function _touchPlayer(address player) private {
        if (!hasRegisteredPlayer[player]) {
            hasRegisteredPlayer[player] = true;
            unchecked {
                totalUniquePlayers += 1;
            }
        }
    }

    function _mintReputation(address player, uint256 repAmount) private {
        if (repAmount == 0) return;
        balanceOf[player] += repAmount;
        totalSupply += repAmount;
        emit Transfer(address(0), player, repAmount);
    }

    function _pullWif(address from, address to, uint256 amount) private {
        if (!wif.transferFrom(from, to, amount)) revert TransferFailed();
    }

    function _pushWif(address to, uint256 amount) private {
        if (!wif.transfer(to, amount)) revert TransferFailed();
    }
}
