// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {RobinTownHarborVault, IERC20} from "../RobinTownHarborVault.sol";

interface Vm {
    function prank(address msgSender) external;
    function warp(uint256 newTimestamp) external;
    function expectRevert(bytes4 revertData) external;
}

contract MockWifToken is IERC20 {
    mapping(address => uint256) public override balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transfer(address to, uint256 value) external override returns (bool) {
        if (balanceOf[msg.sender] < value) return false;
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external override returns (bool) {
        if (balanceOf[from] < value || allowance[from][msg.sender] < value) return false;
        allowance[from][msg.sender] -= value;
        balanceOf[from] -= value;
        balanceOf[to] += value;
        return true;
    }
}

contract RobinTownHarborVaultTest {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    MockWifToken private mockWif;
    RobinTownHarborVault private vault;

    address private constant ALICE = address(0xA11CE);
    address private constant BOB = address(0xB0B);
    bytes32 private constant REASON_DAILY_PODIUM = "DAILY_PODIUM";

    function setUp() public {
        vm.warp(1_793_590_000);
        mockWif = new MockWifToken();
        vault = new RobinTownHarborVault(address(mockWif));
        mockWif.mint(ALICE, 10_000 ether);
        mockWif.mint(BOB, 10_000 ether);
    }

    function testMetadataAndCorroborationConstants() public view {
        require(
            keccak256(bytes(vault.name())) == keccak256(bytes("Robin Town")),
            "name mismatch"
        );
        require(keccak256(bytes(vault.symbol())) == keccak256(bytes("RTOWN")), "symbol mismatch");
        require(vault.decimals() == 18, "decimals mismatch");
        require(
            keccak256(bytes(vault.PROJECT_WEBSITE())) ==
                keccak256(bytes("https://robin-town-production.up.railway.app")),
            "website mismatch"
        );
        require(
            keccak256(bytes(vault.PROJECT_GITHUB())) ==
                keccak256(bytes("https://github.com/harrymove-ctrl/robin-town")),
            "github mismatch"
        );
        require(
            keccak256(bytes(vault.PROJECT_UPDATES())) ==
                keccak256(bytes("https://robin-town-production.up.railway.app/changelog")),
            "updates mismatch"
        );
        require(
            keccak256(bytes(vault.PROJECT_DOCS())) ==
                keccak256(bytes("https://robin-town-production.up.railway.app/docs")),
            "docs mismatch"
        );
        require(
            keccak256(bytes(vault.PROJECT_FEED_RSS())) ==
                keccak256(bytes("https://robin-town-production.up.railway.app/changelog.xml")),
            "rss feed mismatch"
        );
        require(
            vault.OFFICIAL_WIF_MAINNET() == 0x5173b8eA6923c2d40267890D45C46a3480954773,
            "wif constant mismatch"
        );
    }

    function testDefaultConstructorBindsMainnetWif() public {
        RobinTownHarborVault prodVault = new RobinTownHarborVault(address(0));
        require(
            address(prodVault.wif()) == 0x5173b8eA6923c2d40267890D45C46a3480954773,
            "default wif binding failed"
        );
    }

    function testRecordHarborMatchAndSoulboundReputation() public {
        vm.prank(ALICE);
        vault.recordHarborMatch(20261102, 840, 3);

        (
            uint256 staked,
            uint256 burned,
            uint256 rep,
            uint32 bestWorth,
            uint32 matches,
            bool boost
        ) = vault.getPlayerSummary(ALICE);

        require(staked == 0 && burned == 0 && !boost, "unexpected financial state");
        require(rep == 840 ether, "reputation mismatch");
        require(bestWorth == 840, "best net worth mismatch");
        require(matches == 1, "matches count mismatch");
        require(vault.totalOnChainMatches() == 1, "total matches mismatch");
        require(vault.totalUniquePlayers() == 1, "unique players mismatch");
        require(vault.dailySeedScoreOf(ALICE, 20261102) == 840, "daily score mismatch");

        // Duplicate daily seed anchor must revert
        vm.prank(ALICE);
        vm.expectRevert(RobinTownHarborVault.DailySeedAlreadyAnchored.selector);
        vault.recordHarborMatch(20261102, 950, 4);

        // Soulbound RTOWN reputation cannot be transferred
        vm.prank(ALICE);
        vm.expectRevert(RobinTownHarborVault.SoulboundReputation.selector);
        vault.transfer(BOB, 100 ether);

        // Casual match caps reputation mint at 2,500 RTOWN once per UTC day
        vm.prank(BOB);
        vault.recordHarborMatch(0, 4200, 5);
        require(vault.balanceOf(BOB) == 2500 ether, "capped casual rep mismatch");
        require(vault.totalUniquePlayers() == 2, "second unique player mismatch");
    }

    function testStakeUnstakeAndPatronageDeflationarySplit() public {
        vm.prank(ALICE);
        mockWif.approve(address(vault), 5_000 ether);

        vm.prank(ALICE);
        vault.stakeWif(500 ether);
        require(vault.hasPaydayBoost(ALICE), "boost should be active at 500 WIF");
        require(vault.stakedBalanceOf(ALICE) == 500 ether, "stake mismatch");

        // Patronize Harborview District (id 2) with 100 WIF: 50 burned, 50 to Harbor Pool
        vm.prank(ALICE);
        vault.patronizeDistrict(2, 100 ether);
        require(
            mockWif.balanceOf(vault.BURN_SINK()) == 50 ether,
            "50% burn to 0x...dEaD failed"
        );
        require(vault.totalHarborPool() == 50 ether, "50% pool share failed");
        require(vault.balanceOf(ALICE) == 500 ether, "10x burn reputation failed");

        // Owner cannot distribute more than totalHarborPool (staked funds stay untouchable)
        vm.expectRevert(RobinTownHarborVault.InsufficientPoolBalance.selector);
        vault.distributeHarborReward(BOB, 51 ether, REASON_DAILY_PODIUM);

        vault.distributeHarborReward(BOB, 50 ether, REASON_DAILY_PODIUM);
        require(mockWif.balanceOf(BOB) == 10_050 ether, "reward payout failed");

        // Alice withdraws 100% of staked WIF cleanly
        vm.prank(ALICE);
        vault.unstakeWif(500 ether);
        require(vault.stakedBalanceOf(ALICE) == 0, "unstake failed");
        require(mockWif.balanceOf(ALICE) == 9_900 ether, "final Alice WIF balance mismatch");
        // Alice still keeps Payday Boost because lifetimeBurnedBy[ALICE] == 50 WIF >= 1 WIF!
        require(vault.hasPaydayBoost(ALICE), "lifetime burn boost should remain active");
    }
}
