import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

    // Deploy MockERC20 tokens for testing (skip on mainnet)
    const network = await ethers.provider.getNetwork();
    let wbnbAddress: string;
    let usdtAddress: string;

    if (network.chainId === 31337n || network.chainId === 5611n) {
        // Local or testnet - deploy mocks
        console.log("\n📦 Deploying mock tokens...");

        const MockWBNB = await ethers.getContractFactory("MockWBNB");
        const wbnb = await MockWBNB.deploy();
        await wbnb.waitForDeployment();
        wbnbAddress = await wbnb.getAddress();
        console.log("✅ MockWBNB deployed to:", wbnbAddress);

        const MockUSDT = await ethers.getContractFactory("MockUSDT");
        const usdt = await MockUSDT.deploy();
        await usdt.waitForDeployment();
        usdtAddress = await usdt.getAddress();
        console.log("✅ MockUSDT deployed to:", usdtAddress);

        // Mint some tokens to deployer for testing
        await wbnb.mint(deployer.address, ethers.parseEther("1000"));
        await usdt.mint(deployer.address, ethers.parseUnits("100000", 6));
        console.log("✅ Minted test tokens to deployer");
    } else {
        // Mainnet - use real addresses
        wbnbAddress = "0x4200000000000000000000000000000000000006"; // opBNB WBNB
        usdtAddress = "0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3"; // opBNB USDT
        console.log("Using mainnet token addresses");
    }

    // Deploy VaultManager
    console.log("\n📦 Deploying VaultManager...");
    const VaultManager = await ethers.getContractFactory("VaultManager");
    const vaultManager = await VaultManager.deploy(deployer.address);
    await vaultManager.waitForDeployment();
    const vaultManagerAddress = await vaultManager.getAddress();
    console.log("✅ VaultManager deployed to:", vaultManagerAddress);

    // Deploy StrategyManager
    console.log("\n📦 Deploying StrategyManager...");
    const StrategyManager = await ethers.getContractFactory("StrategyManager");
    const strategyManager = await StrategyManager.deploy(vaultManagerAddress);
    await strategyManager.waitForDeployment();
    const strategyManagerAddress = await strategyManager.getAddress();
    console.log("✅ StrategyManager deployed to:", strategyManagerAddress);

    // Deploy RebalanceExecutor
    console.log("\n📦 Deploying RebalanceExecutor...");
    const RebalanceExecutor = await ethers.getContractFactory("RebalanceExecutor");
    const rebalanceExecutor = await RebalanceExecutor.deploy(vaultManagerAddress);
    await rebalanceExecutor.waitForDeployment();
    const rebalanceExecutorAddress = await rebalanceExecutor.getAddress();
    console.log("✅ RebalanceExecutor deployed to:", rebalanceExecutorAddress);

    // Configure contracts
    console.log("\n⚙️ Configuring contracts...");

    // Set strategy manager on vault manager
    await vaultManager.setStrategyManager(strategyManagerAddress);
    console.log("✅ StrategyManager set on VaultManager");

    // Authorize deployer as relayer for testing
    await vaultManager.setRelayerAuthorization(deployer.address, true);
    await vaultManager.setRelayerAuthorization(rebalanceExecutorAddress, true);
    console.log("✅ Relayers authorized");

    // Authorize deployer as signer on RebalanceExecutor
    await rebalanceExecutor.setSignerAuthorization(deployer.address, true);
    console.log("✅ Signers authorized");

    // Deploy MockOracle for testing
    if (network.chainId === 31337n || network.chainId === 5611n) {
        console.log("\n📦 Deploying MockOracle...");
        const MockOracle = await ethers.getContractFactory("MockOracle");
        const mockOracle = await MockOracle.deploy();
        await mockOracle.waitForDeployment();
        const mockOracleAddress = await mockOracle.getAddress();
        console.log("✅ MockOracle deployed to:", mockOracleAddress);

        // Set initial prices
        await mockOracle.updatePrice(wbnbAddress, ethers.parseEther("600")); // $600 per BNB
        await mockOracle.updatePrice(usdtAddress, ethers.parseUnits("1", 18)); // $1 per USDT
        console.log("✅ Initial prices set");
    }

    // Print deployment summary
    console.log("\n" + "=".repeat(60));
    console.log("📋 DEPLOYMENT SUMMARY");
    console.log("=".repeat(60));
    console.log(`Network: ${network.name} (chainId: ${network.chainId})`);
    console.log(`VaultManager: ${vaultManagerAddress}`);
    console.log(`StrategyManager: ${strategyManagerAddress}`);
    console.log(`RebalanceExecutor: ${rebalanceExecutorAddress}`);
    if (network.chainId === 31337n || network.chainId === 5611n) {
        console.log(`MockWBNB: ${wbnbAddress}`);
        console.log(`MockUSDT: ${usdtAddress}`);
    }
    console.log("=".repeat(60));

    // Return addresses for verification
    return {
        vaultManager: vaultManagerAddress,
        strategyManager: strategyManagerAddress,
        rebalanceExecutor: rebalanceExecutorAddress,
    };
}

main()
    .then((addresses) => {
        console.log("\n✅ Deployment complete!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
