// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "./interfaces/IVault.sol";

/**
 * @title StrategyManager
 * @author Adaptive Liquidity Team
 * @notice Manages strategy registration and rebalance condition checks
 * @dev Used by the AI optimizer to verify on-chain conditions before rebalancing
 */
contract StrategyManager is IStrategyManager, Ownable2Step {
    // ============ State Variables ============

    /// @notice Registered strategy addresses
    mapping(address => bool) public strategies;

    /// @notice Vault manager contract reference
    address public vaultManager;

    /// @notice Volatility threshold for triggering rebalance (in basis points)
    uint256 public volatilityThreshold = 500; // 5%

    /// @notice Minimum time between rebalances (in seconds)
    uint256 public rebalanceCooldown = 3600; // 1 hour

    /// @notice Price oracle address (for MVP, we use simple price tracking)
    address public priceOracle;

    /// @notice Last recorded prices for volatility calculation
    mapping(address => uint256) public lastPrices;

    /// @notice Price update timestamps
    mapping(address => uint256) public priceTimestamps;

    // ============ Errors ============

    error StrategyAlreadyRegistered();
    error StrategyNotRegistered();
    error ZeroAddress();
    error CooldownNotPassed();

    // ============ Constructor ============

    constructor(address _vaultManager) Ownable(msg.sender) {
        if (_vaultManager == address(0)) revert ZeroAddress();
        vaultManager = _vaultManager;
    }

    // ============ External Functions ============

    /**
     * @notice Registers a new strategy
     * @param strategy The strategy contract address
     */
    function registerStrategy(address strategy) external override onlyOwner {
        if (strategy == address(0)) revert ZeroAddress();
        if (strategies[strategy]) revert StrategyAlreadyRegistered();
        
        strategies[strategy] = true;
        emit StrategyRegistered(strategy);
    }

    /**
     * @notice Unregisters a strategy
     * @param strategy The strategy contract address
     */
    function unregisterStrategy(address strategy) external override onlyOwner {
        if (!strategies[strategy]) revert StrategyNotRegistered();
        
        strategies[strategy] = false;
        emit StrategyUnregistered(strategy);
    }

    /**
     * @notice Checks if a vault should be rebalanced
     * @param vaultId The vault ID to check
     * @return shouldRebalance Whether rebalancing is recommended
     * @return details Encoded details about the rebalance recommendation
     */
    function checkRebalance(
        uint256 vaultId
    ) external view override returns (bool shouldRebalance, bytes memory details) {
        IVaultManager manager = IVaultManager(vaultManager);
        IVault.VaultInfo memory vault = manager.getVaultInfo(vaultId);
        IVaultManager.StrategyParams memory params = manager.getVaultStrategy(vaultId);

        // Check cooldown period
        if (block.timestamp < vault.lastRebalance + rebalanceCooldown) {
            return (false, abi.encode("Cooldown not passed"));
        }

        // Calculate volatility score (simplified for MVP)
        uint256 volatilityScore = _calculateVolatility(vault.tokenA, vault.tokenB);

        // Determine if rebalance is needed based on volatility
        if (volatilityScore >= volatilityThreshold) {
            // High volatility - recommend widening range or moving to stable pools
            int24 newTickLower = params.tickLower - 120; // Widen range
            int24 newTickUpper = params.tickUpper + 120;
            uint256 reallocatePct = 30; // Move 30% to safer position

            details = abi.encode(newTickLower, newTickUpper, reallocatePct);
            return (true, details);
        }

        return (false, abi.encode("No rebalance needed"));
    }

    /**
     * @notice Checks if a strategy is registered
     * @param strategy The strategy address to check
     * @return Whether the strategy is registered
     */
    function isRegistered(address strategy) external view override returns (bool) {
        return strategies[strategy];
    }

    /**
     * @notice Updates the price for a token (called by oracle or admin for MVP)
     * @param token The token address
     * @param price The new price (18 decimals)
     */
    function updatePrice(address token, uint256 price) external onlyOwner {
        lastPrices[token] = price;
        priceTimestamps[token] = block.timestamp;
    }

    /**
     * @notice Gets the current volatility score for a token pair
     * @param tokenA First token
     * @param tokenB Second token
     * @return volatilityBps Volatility in basis points
     */
    function getVolatility(address tokenA, address tokenB) external view returns (uint256) {
        return _calculateVolatility(tokenA, tokenB);
    }

    // ============ Admin Functions ============

    /**
     * @notice Sets the volatility threshold
     * @param _threshold New threshold in basis points
     */
    function setVolatilityThreshold(uint256 _threshold) external onlyOwner {
        volatilityThreshold = _threshold;
    }

    /**
     * @notice Sets the rebalance cooldown
     * @param _cooldown New cooldown in seconds
     */
    function setRebalanceCooldown(uint256 _cooldown) external onlyOwner {
        rebalanceCooldown = _cooldown;
    }

    /**
     * @notice Sets the vault manager address
     * @param _vaultManager New vault manager address
     */
    function setVaultManager(address _vaultManager) external onlyOwner {
        if (_vaultManager == address(0)) revert ZeroAddress();
        vaultManager = _vaultManager;
    }

    /**
     * @notice Sets the price oracle address
     * @param _oracle New oracle address
     */
    function setPriceOracle(address _oracle) external onlyOwner {
        priceOracle = _oracle;
    }

    // ============ Internal Functions ============

    /**
     * @notice Calculates volatility for a token pair
     * @param tokenA First token
     * @param tokenB Second token
     * @return volatilityBps Volatility in basis points
     */
    function _calculateVolatility(
        address tokenA,
        address tokenB
    ) internal view returns (uint256 volatilityBps) {
        // For MVP, return a simulated volatility based on price staleness
        // In production, this would use historical price data and EMA
        
        uint256 priceAgeA = block.timestamp - priceTimestamps[tokenA];
        uint256 priceAgeB = block.timestamp - priceTimestamps[tokenB];

        // If prices are stale (>1 hour), indicate higher risk
        if (priceAgeA > 3600 || priceAgeB > 3600) {
            return 800; // 8% volatility (high)
        }

        // Default to moderate volatility for demo
        return 300; // 3% volatility (moderate)
    }
}
