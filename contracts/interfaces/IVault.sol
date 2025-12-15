// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/**
 * @title IVault
 * @notice Interface for individual vault operations
 */
interface IVault {
    struct Position {
        int24 tickLower;
        int24 tickUpper;
        uint128 liquidity;
        uint256 tokenAAmount;
        uint256 tokenBAmount;
    }

    struct VaultInfo {
        uint256 vaultId;
        address owner;
        address tokenA;
        address tokenB;
        uint256 totalShares;
        uint256 totalTokenA;
        uint256 totalTokenB;
        address strategy;
        uint256 lastRebalance;
        bool isActive;
    }

    event LiquidityAdded(
        uint256 indexed vaultId,
        int24 tickLower,
        int24 tickUpper,
        uint128 liquidity
    );

    event LiquidityRemoved(
        uint256 indexed vaultId,
        int24 tickLower,
        int24 tickUpper,
        uint128 liquidity
    );

    event FeesCollected(
        uint256 indexed vaultId,
        uint256 feeA,
        uint256 feeB
    );
}

/**
 * @title IVaultManager
 * @notice Interface for the main vault management contract
 */
interface IVaultManager {
    struct StrategyParams {
        int24 tickLower;
        int24 tickUpper;
        uint256 rebalanceThreshold;
        bool autoRebalance;
    }

    event VaultCreated(
        uint256 indexed vaultId,
        address indexed owner,
        address tokenA,
        address tokenB
    );

    event Deposit(
        uint256 indexed vaultId,
        address indexed user,
        uint256 amountA,
        uint256 amountB,
        uint256 shares
    );

    event Withdraw(
        uint256 indexed vaultId,
        address indexed user,
        uint256 shares,
        uint256 amountA,
        uint256 amountB
    );

    event StrategyAttached(
        uint256 indexed vaultId,
        address indexed strategy
    );

    event Rebalanced(
        uint256 indexed vaultId,
        address indexed executor,
        bytes32 detailsHash
    );

    function createVault(
        address tokenA,
        address tokenB,
        StrategyParams calldata params
    ) external returns (uint256 vaultId);

    function deposit(
        uint256 vaultId,
        uint256 amountA,
        uint256 amountB
    ) external returns (uint256 shares);

    function withdraw(
        uint256 vaultId,
        uint256 shares
    ) external returns (uint256 amountA, uint256 amountB);

    function rebalance(
        uint256 vaultId,
        bytes calldata strategyData
    ) external;

    function getVaultInfo(uint256 vaultId) external view returns (IVault.VaultInfo memory);
    function getVaultStrategy(uint256 vaultId) external view returns (StrategyParams memory);
}

/**
 * @title IStrategyManager
 * @notice Interface for strategy management
 */
interface IStrategyManager {
    struct RebalanceCheck {
        bool shouldRebalance;
        bytes details;
    }

    event StrategyRegistered(address indexed strategy);
    event StrategyUnregistered(address indexed strategy);

    function registerStrategy(address strategy) external;
    function unregisterStrategy(address strategy) external;
    function checkRebalance(uint256 vaultId) external view returns (bool shouldRebalance, bytes memory details);
    function isRegistered(address strategy) external view returns (bool);
}

/**
 * @title IRebalanceExecutor
 * @notice Interface for executing rebalances with signature verification
 */
interface IRebalanceExecutor {
    struct RebalancePayload {
        uint256 vaultId;
        uint256 nonce;
        bytes actionData;
        uint256 issuedAt;
        uint256 expiry;
    }

    event RebalanceExecuted(
        uint256 indexed vaultId,
        address indexed caller,
        uint256 gasUsed
    );

    function executeRebalance(
        uint256 vaultId,
        bytes calldata signedPayload,
        bytes calldata signature
    ) external;

    function getNonce(address signer) external view returns (uint256);
}
