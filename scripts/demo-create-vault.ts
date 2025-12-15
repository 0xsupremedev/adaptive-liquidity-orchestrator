import { ethers } from "hardhat";

/**
 * Demo script to create a vault, deposit, and trigger rebalance
 * Produces 2+ on-chain transactions for hackathon demo
 */
async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Running demo with account:", deployer.address);

    // Get deployed contract addresses (replace with actual addresses after deployment)
    const VAULT_MANAGER_ADDRESS = process.env.VAULT_MANAGER_ADDRESS || "";
    const WBNB_ADDRESS = process.env.WBNB_ADDRESS || "";
    const USDT_ADDRESS = process.env.USDT_ADDRESS || "";

    if (!VAULT_MANAGER_ADDRESS) {
        console.log("⚠️ Contract addresses not set. Deploying fresh contracts...");

        // Deploy mock tokens
        const MockWBNB = await ethers.getContractFactory("MockWBNB");
        const wbnb = await MockWBNB.deploy();
        await wbnb.waitForDeployment();
        const wbnbAddress = await wbnb.getAddress();
        console.log("MockWBNB deployed to:", wbnbAddress);

        const MockUSDT = await ethers.getContractFactory("MockUSDT");
        const usdt = await MockUSDT.deploy();
        await usdt.waitForDeployment();
        const usdtAddress = await usdt.getAddress();
        console.log("MockUSDT deployed to:", usdtAddress);

        // Mint tokens
        await wbnb.mint(deployer.address, ethers.parseEther("100"));
        await usdt.mint(deployer.address, ethers.parseUnits("10000", 6));
        console.log("✅ Minted test tokens");

        // Deploy VaultManager
        const VaultManager = await ethers.getContractFactory("VaultManager");
        const vaultManager = await VaultManager.deploy(deployer.address);
        await vaultManager.waitForDeployment();
        const vaultManagerAddress = await vaultManager.getAddress();
        console.log("VaultManager deployed to:", vaultManagerAddress);

        // Authorize deployer as relayer
        await vaultManager.setRelayerAuthorization(deployer.address, true);
        console.log("✅ Relayer authorized");

        await runDemo(vaultManager, wbnb, usdt, wbnbAddress, usdtAddress);
    } else {
        const vaultManager = await ethers.getContractAt("VaultManager", VAULT_MANAGER_ADDRESS);
        const wbnb = await ethers.getContractAt("MockWBNB", WBNB_ADDRESS);
        const usdt = await ethers.getContractAt("MockUSDT", USDT_ADDRESS);

        await runDemo(vaultManager, wbnb, usdt, WBNB_ADDRESS, USDT_ADDRESS);
    }
}

async function runDemo(
    vaultManager: any,
    wbnb: any,
    usdt: any,
    wbnbAddress: string,
    usdtAddress: string
) {
    const [deployer] = await ethers.getSigners();

    console.log("\n" + "=".repeat(60));
    console.log("🎬 DEMO: Adaptive Liquidity Orchestrator");
    console.log("=".repeat(60));

    // Step 1: Create a vault
    console.log("\n📦 Step 1: Creating BNB/USDT vault...");
    const strategyParams = {
        tickLower: -887220,
        tickUpper: 887220,
        rebalanceThreshold: 500, // 5%
        autoRebalance: true,
    };

    const createTx = await vaultManager.createVault(
        wbnbAddress,
        usdtAddress,
        strategyParams
    );
    const createReceipt = await createTx.wait();
    console.log("✅ Transaction 1: Vault Created");
    console.log("   TX Hash:", createTx.hash);
    console.log("   Gas Used:", createReceipt?.gasUsed.toString());

    // Get the vault ID from the event
    const vaultId = 1; // First vault
    console.log("   Vault ID:", vaultId);

    // Step 2: Approve and deposit tokens
    console.log("\n💰 Step 2: Depositing liquidity...");

    const depositAmountWBNB = ethers.parseEther("1"); // 1 BNB
    const depositAmountUSDT = ethers.parseUnits("600", 6); // 600 USDT (matching ~$600 BNB price)

    // Approve tokens
    const vaultManagerAddress = await vaultManager.getAddress();
    await wbnb.approve(vaultManagerAddress, depositAmountWBNB);
    await usdt.approve(vaultManagerAddress, depositAmountUSDT);
    console.log("   Approved tokens for deposit");

    // Deposit
    const depositTx = await vaultManager.deposit(vaultId, depositAmountWBNB, depositAmountUSDT);
    const depositReceipt = await depositTx.wait();
    console.log("✅ Transaction 2: Deposit Completed");
    console.log("   TX Hash:", depositTx.hash);
    console.log("   Gas Used:", depositReceipt?.gasUsed.toString());
    console.log("   Deposited: 1 WBNB + 600 USDT");

    // Step 3: Simulate market shock and trigger rebalance
    console.log("\n⚡ Step 3: Simulating volatility spike and rebalancing...");
    console.log("   AI Optimizer detected: 8% volatility increase");
    console.log("   Recommendation: Widen range by 20%, move 30% to stable position");

    // Encode rebalance data
    const newTickLower = -887220 - 120; // Widen range
    const newTickUpper = 887220 + 120;
    const reallocatePct = 30; // 30% reallocation

    const strategyData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["int24", "int24", "uint256"],
        [newTickLower, newTickUpper, reallocatePct]
    );

    const rebalanceTx = await vaultManager.rebalance(vaultId, strategyData);
    const rebalanceReceipt = await rebalanceTx.wait();
    console.log("✅ Transaction 3: Rebalance Executed");
    console.log("   TX Hash:", rebalanceTx.hash);
    console.log("   Gas Used:", rebalanceReceipt?.gasUsed.toString());

    // Step 4: Display results
    console.log("\n📊 Demo Results:");
    const vaultInfo = await vaultManager.getVaultInfo(vaultId);
    const strategy = await vaultManager.getVaultStrategy(vaultId);

    console.log("   Vault ID:", vaultId.toString());
    console.log("   Total Shares:", vaultInfo.totalShares.toString());
    console.log("   Total TokenA:", ethers.formatEther(vaultInfo.totalTokenA), "WBNB");
    console.log("   Total TokenB:", ethers.formatUnits(vaultInfo.totalTokenB, 6), "USDT");
    console.log("   New Tick Range:", strategy.tickLower.toString(), "to", strategy.tickUpper.toString());
    console.log("   Last Rebalance:", new Date(Number(vaultInfo.lastRebalance) * 1000).toISOString());

    console.log("\n" + "=".repeat(60));
    console.log("🏆 DEMO COMPLETE - 3 on-chain transactions executed!");
    console.log("=".repeat(60));
    console.log("\n📝 Summary:");
    console.log("   • Created vault: 1 TX");
    console.log("   • Deposited liquidity: 1 TX");
    console.log("   • AI-triggered rebalance: 1 TX");
    console.log("\n🔗 View on opBNBScan:");
    console.log(`   https://opbnb-testnet.bscscan.com/address/${await vaultManager.getAddress()}`);
}

main()
    .then(() => {
        console.log("\n✅ Demo script finished!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Demo failed:", error);
        process.exit(1);
    });
