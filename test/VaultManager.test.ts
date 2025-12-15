import { expect } from "chai";
import { ethers } from "hardhat";
import {
    VaultManager,
    StrategyManager,
    RebalanceExecutor,
    MockWBNB,
    MockUSDT
} from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("VaultManager", function () {
    let vaultManager: VaultManager;
    let strategyManager: StrategyManager;
    let rebalanceExecutor: RebalanceExecutor;
    let wbnb: MockWBNB;
    let usdt: MockUSDT;
    let owner: SignerWithAddress;
    let user1: SignerWithAddress;
    let user2: SignerWithAddress;
    let relayer: SignerWithAddress;

    const DEFAULT_STRATEGY_PARAMS = {
        tickLower: -887220,
        tickUpper: 887220,
        rebalanceThreshold: 500,
        autoRebalance: true,
    };

    beforeEach(async function () {
        [owner, user1, user2, relayer] = await ethers.getSigners();

        // Deploy mock tokens
        const MockWBNBFactory = await ethers.getContractFactory("MockWBNB");
        wbnb = await MockWBNBFactory.deploy() as MockWBNB;

        const MockUSDTFactory = await ethers.getContractFactory("MockUSDT");
        usdt = await MockUSDTFactory.deploy() as MockUSDT;

        // Deploy VaultManager
        const VaultManagerFactory = await ethers.getContractFactory("VaultManager");
        vaultManager = await VaultManagerFactory.deploy(owner.address) as VaultManager;

        // Deploy StrategyManager
        const StrategyManagerFactory = await ethers.getContractFactory("StrategyManager");
        strategyManager = await StrategyManagerFactory.deploy(await vaultManager.getAddress()) as StrategyManager;

        // Deploy RebalanceExecutor
        const RebalanceExecutorFactory = await ethers.getContractFactory("RebalanceExecutor");
        rebalanceExecutor = await RebalanceExecutorFactory.deploy(await vaultManager.getAddress()) as RebalanceExecutor;

        // Configure
        await vaultManager.setStrategyManager(await strategyManager.getAddress());
        await vaultManager.setRelayerAuthorization(relayer.address, true);
        await vaultManager.setRelayerAuthorization(await rebalanceExecutor.getAddress(), true);
        await rebalanceExecutor.setSignerAuthorization(owner.address, true);

        // Mint tokens to users
        await wbnb.mint(user1.address, ethers.parseEther("100"));
        await usdt.mint(user1.address, ethers.parseUnits("100000", 6));
        await wbnb.mint(user2.address, ethers.parseEther("100"));
        await usdt.mint(user2.address, ethers.parseUnits("100000", 6));
    });

    describe("Vault Creation", function () {
        it("Should create a vault successfully", async function () {
            const tx = await vaultManager.connect(user1).createVault(
                await wbnb.getAddress(),
                await usdt.getAddress(),
                DEFAULT_STRATEGY_PARAMS
            );

            await expect(tx)
                .to.emit(vaultManager, "VaultCreated")
                .withArgs(1, user1.address, await wbnb.getAddress(), await usdt.getAddress());

            expect(await vaultManager.vaultCount()).to.equal(1);

            const vaultInfo = await vaultManager.getVaultInfo(1);
            expect(vaultInfo.owner).to.equal(user1.address);
            expect(vaultInfo.tokenA).to.equal(await wbnb.getAddress());
            expect(vaultInfo.tokenB).to.equal(await usdt.getAddress());
            expect(vaultInfo.isActive).to.be.true;
        });

        it("Should reject vault creation with same tokens", async function () {
            await expect(
                vaultManager.connect(user1).createVault(
                    await wbnb.getAddress(),
                    await wbnb.getAddress(),
                    DEFAULT_STRATEGY_PARAMS
                )
            ).to.be.revertedWithCustomError(vaultManager, "InvalidTokens");
        });

        it("Should reject vault creation with zero address", async function () {
            await expect(
                vaultManager.connect(user1).createVault(
                    ethers.ZeroAddress,
                    await usdt.getAddress(),
                    DEFAULT_STRATEGY_PARAMS
                )
            ).to.be.revertedWithCustomError(vaultManager, "InvalidTokens");
        });
    });

    describe("Deposits", function () {
        beforeEach(async function () {
            await vaultManager.connect(user1).createVault(
                await wbnb.getAddress(),
                await usdt.getAddress(),
                DEFAULT_STRATEGY_PARAMS
            );
        });

        it("Should accept initial deposit", async function () {
            const amountA = ethers.parseEther("1");
            const amountB = ethers.parseUnits("600", 6);

            await wbnb.connect(user1).approve(await vaultManager.getAddress(), amountA);
            await usdt.connect(user1).approve(await vaultManager.getAddress(), amountB);

            const tx = await vaultManager.connect(user1).deposit(1, amountA, amountB);

            await expect(tx).to.emit(vaultManager, "Deposit");

            const vaultInfo = await vaultManager.getVaultInfo(1);
            expect(vaultInfo.totalTokenA).to.equal(amountA);
            expect(vaultInfo.totalTokenB).to.equal(amountB);
            expect(vaultInfo.totalShares).to.be.gt(0);
        });

        it("Should accept subsequent deposits", async function () {
            const amountA = ethers.parseEther("1");
            const amountB = ethers.parseUnits("600", 6);

            // First deposit
            await wbnb.connect(user1).approve(await vaultManager.getAddress(), amountA * 2n);
            await usdt.connect(user1).approve(await vaultManager.getAddress(), amountB * 2n);
            await vaultManager.connect(user1).deposit(1, amountA, amountB);

            // Second deposit
            await vaultManager.connect(user1).deposit(1, amountA, amountB);

            const vaultInfo = await vaultManager.getVaultInfo(1);
            expect(vaultInfo.totalTokenA).to.equal(amountA * 2n);
            expect(vaultInfo.totalTokenB).to.equal(amountB * 2n);
        });

        it("Should reject deposit below minimum", async function () {
            const amountA = 100n; // Below MIN_DEPOSIT (1e6)
            const amountB = 100n; // Below MIN_DEPOSIT (1e6)

            await wbnb.connect(user1).approve(await vaultManager.getAddress(), amountA);
            await usdt.connect(user1).approve(await vaultManager.getAddress(), amountB);

            await expect(
                vaultManager.connect(user1).deposit(1, amountA, amountB)
            ).to.be.revertedWithCustomError(vaultManager, "InsufficientDeposit");
        });
    });

    describe("Withdrawals", function () {
        beforeEach(async function () {
            await vaultManager.connect(user1).createVault(
                await wbnb.getAddress(),
                await usdt.getAddress(),
                DEFAULT_STRATEGY_PARAMS
            );

            const amountA = ethers.parseEther("10");
            const amountB = ethers.parseUnits("6000", 6);

            await wbnb.connect(user1).approve(await vaultManager.getAddress(), amountA);
            await usdt.connect(user1).approve(await vaultManager.getAddress(), amountB);
            await vaultManager.connect(user1).deposit(1, amountA, amountB);
        });

        it("Should allow full withdrawal", async function () {
            const shares = await vaultManager.getUserShares(1, user1.address);

            const balanceABefore = await wbnb.balanceOf(user1.address);
            const balanceBBefore = await usdt.balanceOf(user1.address);

            const tx = await vaultManager.connect(user1).withdraw(1, shares);
            await expect(tx).to.emit(vaultManager, "Withdraw");

            const balanceAAfter = await wbnb.balanceOf(user1.address);
            const balanceBAfter = await usdt.balanceOf(user1.address);

            expect(balanceAAfter).to.be.gt(balanceABefore);
            expect(balanceBAfter).to.be.gt(balanceBBefore);

            const vaultInfo = await vaultManager.getVaultInfo(1);
            expect(vaultInfo.totalShares).to.equal(0);
        });

        it("Should allow partial withdrawal", async function () {
            const shares = await vaultManager.getUserShares(1, user1.address);
            const halfShares = shares / 2n;

            await vaultManager.connect(user1).withdraw(1, halfShares);

            const remainingShares = await vaultManager.getUserShares(1, user1.address);
            expect(remainingShares).to.equal(shares - halfShares);
        });

        it("Should reject withdrawal with insufficient shares", async function () {
            const shares = await vaultManager.getUserShares(1, user1.address);

            await expect(
                vaultManager.connect(user1).withdraw(1, shares + 1n)
            ).to.be.revertedWithCustomError(vaultManager, "InsufficientShares");
        });
    });

    describe("Rebalancing", function () {
        beforeEach(async function () {
            await vaultManager.connect(user1).createVault(
                await wbnb.getAddress(),
                await usdt.getAddress(),
                DEFAULT_STRATEGY_PARAMS
            );

            const amountA = ethers.parseEther("10");
            const amountB = ethers.parseUnits("6000", 6);

            await wbnb.connect(user1).approve(await vaultManager.getAddress(), amountA);
            await usdt.connect(user1).approve(await vaultManager.getAddress(), amountB);
            await vaultManager.connect(user1).deposit(1, amountA, amountB);
        });

        it("Should allow authorized relayer to rebalance", async function () {
            const newTickLower = -900000;
            const newTickUpper = 900000;
            const reallocatePct = 30;

            const strategyData = ethers.AbiCoder.defaultAbiCoder().encode(
                ["int24", "int24", "uint256"],
                [newTickLower, newTickUpper, reallocatePct]
            );

            const tx = await vaultManager.connect(relayer).rebalance(1, strategyData);
            await expect(tx).to.emit(vaultManager, "Rebalanced");

            const strategy = await vaultManager.getVaultStrategy(1);
            expect(strategy.tickLower).to.equal(newTickLower);
            expect(strategy.tickUpper).to.equal(newTickUpper);
        });

        it("Should reject rebalance from unauthorized address", async function () {
            const strategyData = ethers.AbiCoder.defaultAbiCoder().encode(
                ["int24", "int24", "uint256"],
                [-900000, 900000, 30]
            );

            await expect(
                vaultManager.connect(user2).rebalance(1, strategyData)
            ).to.be.revertedWithCustomError(vaultManager, "UnauthorizedRelayer");
        });
    });

    describe("Admin Functions", function () {
        it("Should allow owner to pause and unpause", async function () {
            await vaultManager.connect(owner).pause();

            await expect(
                vaultManager.connect(user1).createVault(
                    await wbnb.getAddress(),
                    await usdt.getAddress(),
                    DEFAULT_STRATEGY_PARAMS
                )
            ).to.be.revertedWithCustomError(vaultManager, "EnforcedPause");

            await vaultManager.connect(owner).unpause();

            await expect(
                vaultManager.connect(user1).createVault(
                    await wbnb.getAddress(),
                    await usdt.getAddress(),
                    DEFAULT_STRATEGY_PARAMS
                )
            ).to.not.be.reverted;
        });

        it("Should allow owner to update protocol fee", async function () {
            await vaultManager.connect(owner).setProtocolFee(100); // 1%
            expect(await vaultManager.protocolFeeBps()).to.equal(100);
        });

        it("Should reject fee above maximum", async function () {
            await expect(
                vaultManager.connect(owner).setProtocolFee(1001) // 10.01%
            ).to.be.revertedWith("Fee too high");
        });
    });
});

describe("StrategyManager", function () {
    let vaultManager: VaultManager;
    let strategyManager: StrategyManager;
    let owner: SignerWithAddress;
    let user1: SignerWithAddress;

    beforeEach(async function () {
        [owner, user1] = await ethers.getSigners();

        const VaultManagerFactory = await ethers.getContractFactory("VaultManager");
        vaultManager = await VaultManagerFactory.deploy(owner.address) as VaultManager;

        const StrategyManagerFactory = await ethers.getContractFactory("StrategyManager");
        strategyManager = await StrategyManagerFactory.deploy(await vaultManager.getAddress()) as StrategyManager;
    });

    it("Should register a strategy", async function () {
        const strategyAddress = user1.address; // Using user address as mock strategy

        await expect(strategyManager.connect(owner).registerStrategy(strategyAddress))
            .to.emit(strategyManager, "StrategyRegistered")
            .withArgs(strategyAddress);

        expect(await strategyManager.isRegistered(strategyAddress)).to.be.true;
    });

    it("Should unregister a strategy", async function () {
        const strategyAddress = user1.address;
        await strategyManager.connect(owner).registerStrategy(strategyAddress);

        await expect(strategyManager.connect(owner).unregisterStrategy(strategyAddress))
            .to.emit(strategyManager, "StrategyUnregistered")
            .withArgs(strategyAddress);

        expect(await strategyManager.isRegistered(strategyAddress)).to.be.false;
    });

    it("Should update volatility threshold", async function () {
        await strategyManager.connect(owner).setVolatilityThreshold(1000);
        expect(await strategyManager.volatilityThreshold()).to.equal(1000);
    });
});

describe("RebalanceExecutor", function () {
    let vaultManager: VaultManager;
    let rebalanceExecutor: RebalanceExecutor;
    let wbnb: MockWBNB;
    let usdt: MockUSDT;
    let owner: SignerWithAddress;
    let user1: SignerWithAddress;

    beforeEach(async function () {
        [owner, user1] = await ethers.getSigners();

        const MockWBNBFactory = await ethers.getContractFactory("MockWBNB");
        wbnb = await MockWBNBFactory.deploy() as MockWBNB;

        const MockUSDTFactory = await ethers.getContractFactory("MockUSDT");
        usdt = await MockUSDTFactory.deploy() as MockUSDT;

        const VaultManagerFactory = await ethers.getContractFactory("VaultManager");
        vaultManager = await VaultManagerFactory.deploy(owner.address) as VaultManager;

        const RebalanceExecutorFactory = await ethers.getContractFactory("RebalanceExecutor");
        rebalanceExecutor = await RebalanceExecutorFactory.deploy(await vaultManager.getAddress()) as RebalanceExecutor;

        await vaultManager.setRelayerAuthorization(await rebalanceExecutor.getAddress(), true);
        await rebalanceExecutor.setSignerAuthorization(owner.address, true);

        // Create vault and deposit
        await wbnb.mint(user1.address, ethers.parseEther("100"));
        await usdt.mint(user1.address, ethers.parseUnits("100000", 6));

        await vaultManager.connect(user1).createVault(
            await wbnb.getAddress(),
            await usdt.getAddress(),
            { tickLower: -887220, tickUpper: 887220, rebalanceThreshold: 500, autoRebalance: true }
        );

        const amountA = ethers.parseEther("10");
        const amountB = ethers.parseUnits("6000", 6);
        await wbnb.connect(user1).approve(await vaultManager.getAddress(), amountA);
        await usdt.connect(user1).approve(await vaultManager.getAddress(), amountB);
        await vaultManager.connect(user1).deposit(1, amountA, amountB);
    });

    it("Should return correct nonce", async function () {
        expect(await rebalanceExecutor.getNonce(owner.address)).to.equal(0);
    });

    it("Should have correct domain separator", async function () {
        const domainSeparator = await rebalanceExecutor.domainSeparator();
        expect(domainSeparator).to.not.equal(ethers.ZeroHash);
    });

    it("Should compute payload hash correctly", async function () {
        const actionData = ethers.AbiCoder.defaultAbiCoder().encode(
            ["int24", "int24", "uint256"],
            [-900000, 900000, 30]
        );

        const payload = {
            vaultId: 1,
            nonce: 0,
            actionData: actionData,
            issuedAt: Math.floor(Date.now() / 1000),
            expiry: Math.floor(Date.now() / 1000) + 3600,
        };

        const hash = await rebalanceExecutor.getPayloadHash(payload);
        expect(hash).to.not.equal(ethers.ZeroHash);
    });
});
