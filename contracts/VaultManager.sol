// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./interfaces/IVault.sol";

/**
 * @title VaultManager
 * @author Adaptive Liquidity Team
 * @notice Core contract for managing liquidity vaults on opBNB
 * @dev Manages vault creation, deposits, withdrawals, and rebalancing
 */
contract VaultManager is IVaultManager, Ownable2Step, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // ============ State Variables ============

    /// @notice Total number of vaults created
    uint256 public vaultCount;

    /// @notice Mapping of vault ID to vault info
    mapping(uint256 => IVault.VaultInfo) public vaults;

    /// @notice Mapping of vault ID to strategy parameters
    mapping(uint256 => StrategyParams) public vaultStrategies;

    /// @notice Mapping of vault ID to user address to shares
    mapping(uint256 => mapping(address => uint256)) public userShares;

    /// @notice Authorized relayer addresses for rebalancing
    mapping(address => bool) public authorizedRelayers;

    /// @notice Strategy manager contract
    address public strategyManager;

    /// @notice Minimum deposit amount (1e6 to support various token decimals)
    uint256 public constant MIN_DEPOSIT = 1e6;

    /// @notice Protocol fee in basis points (0.5%)
    uint256 public protocolFeeBps = 50;

    /// @notice Fee recipient address
    address public feeRecipient;

    // ============ Errors ============

    error VaultNotFound();
    error InsufficientDeposit();
    error InsufficientShares();
    error UnauthorizedRelayer();
    error VaultInactive();
    error InvalidTokens();
    error ZeroAddress();

    // ============ Constructor ============

    constructor(address _feeRecipient) Ownable(msg.sender) {
        if (_feeRecipient == address(0)) revert ZeroAddress();
        feeRecipient = _feeRecipient;
    }

    // ============ External Functions ============

    /**
     * @notice Creates a new liquidity vault
     * @param tokenA First token address
     * @param tokenB Second token address
     * @param params Strategy parameters for the vault
     * @return vaultId The ID of the newly created vault
     */
    function createVault(
        address tokenA,
        address tokenB,
        StrategyParams calldata params
    ) external override whenNotPaused returns (uint256 vaultId) {
        if (tokenA == address(0) || tokenB == address(0)) revert InvalidTokens();
        if (tokenA == tokenB) revert InvalidTokens();

        vaultId = ++vaultCount;

        vaults[vaultId] = IVault.VaultInfo({
            vaultId: vaultId,
            owner: msg.sender,
            tokenA: tokenA,
            tokenB: tokenB,
            totalShares: 0,
            totalTokenA: 0,
            totalTokenB: 0,
            strategy: address(0),
            lastRebalance: block.timestamp,
            isActive: true
        });

        vaultStrategies[vaultId] = params;

        emit VaultCreated(vaultId, msg.sender, tokenA, tokenB);
    }

    /**
     * @notice Deposits tokens into a vault
     * @param vaultId The vault to deposit into
     * @param amountA Amount of token A to deposit
     * @param amountB Amount of token B to deposit
     * @return shares The number of shares minted
     */
    function deposit(
        uint256 vaultId,
        uint256 amountA,
        uint256 amountB
    ) external override nonReentrant whenNotPaused returns (uint256 shares) {
        IVault.VaultInfo storage vault = vaults[vaultId];
        if (vault.owner == address(0)) revert VaultNotFound();
        if (!vault.isActive) revert VaultInactive();
        if (amountA < MIN_DEPOSIT || amountB < MIN_DEPOSIT) revert InsufficientDeposit();

        // Transfer tokens from user
        IERC20(vault.tokenA).safeTransferFrom(msg.sender, address(this), amountA);
        IERC20(vault.tokenB).safeTransferFrom(msg.sender, address(this), amountB);

        // Calculate shares (simple proportional calculation for MVP)
        if (vault.totalShares == 0) {
            // First deposit - shares equal to geometric mean of amounts
            shares = _sqrt(amountA * amountB);
        } else {
            // Subsequent deposits - proportional to existing liquidity
            uint256 shareA = (amountA * vault.totalShares) / vault.totalTokenA;
            uint256 shareB = (amountB * vault.totalShares) / vault.totalTokenB;
            shares = shareA < shareB ? shareA : shareB;
        }

        // Update vault state
        vault.totalShares += shares;
        vault.totalTokenA += amountA;
        vault.totalTokenB += amountB;
        userShares[vaultId][msg.sender] += shares;

        emit Deposit(vaultId, msg.sender, amountA, amountB, shares);
    }

    /**
     * @notice Withdraws tokens from a vault
     * @param vaultId The vault to withdraw from
     * @param shares The number of shares to redeem
     * @return amountA Amount of token A withdrawn
     * @return amountB Amount of token B withdrawn
     */
    function withdraw(
        uint256 vaultId,
        uint256 shares
    ) external override nonReentrant returns (uint256 amountA, uint256 amountB) {
        IVault.VaultInfo storage vault = vaults[vaultId];
        if (vault.owner == address(0)) revert VaultNotFound();
        if (userShares[vaultId][msg.sender] < shares) revert InsufficientShares();

        // Calculate proportional amounts
        amountA = (shares * vault.totalTokenA) / vault.totalShares;
        amountB = (shares * vault.totalTokenB) / vault.totalShares;

        // Update vault state
        vault.totalShares -= shares;
        vault.totalTokenA -= amountA;
        vault.totalTokenB -= amountB;
        userShares[vaultId][msg.sender] -= shares;

        // Transfer tokens to user
        IERC20(vault.tokenA).safeTransfer(msg.sender, amountA);
        IERC20(vault.tokenB).safeTransfer(msg.sender, amountB);

        emit Withdraw(vaultId, msg.sender, shares, amountA, amountB);
    }

    /**
     * @notice Executes a rebalance on a vault
     * @param vaultId The vault to rebalance
     * @param strategyData Encoded strategy execution data
     */
    function rebalance(
        uint256 vaultId,
        bytes calldata strategyData
    ) external override nonReentrant whenNotPaused {
        if (!authorizedRelayers[msg.sender] && msg.sender != owner()) {
            revert UnauthorizedRelayer();
        }

        IVault.VaultInfo storage vault = vaults[vaultId];
        if (vault.owner == address(0)) revert VaultNotFound();
        if (!vault.isActive) revert VaultInactive();

        // Decode and execute rebalance strategy
        // For MVP, we simulate the rebalance by adjusting the range
        (int24 newTickLower, int24 newTickUpper, ) = abi.decode(
            strategyData,
            (int24, int24, uint256)
        );

        // Update strategy parameters
        StrategyParams storage params = vaultStrategies[vaultId];
        params.tickLower = newTickLower;
        params.tickUpper = newTickUpper;

        // Update last rebalance timestamp
        vault.lastRebalance = block.timestamp;

        // Calculate protocol fee on rebalance (simulated earnings)
        uint256 feeA = (vault.totalTokenA * protocolFeeBps) / 10000;
        uint256 feeB = (vault.totalTokenB * protocolFeeBps) / 10000;

        if (feeA > 0) {
            vault.totalTokenA -= feeA;
            IERC20(vault.tokenA).safeTransfer(feeRecipient, feeA);
        }
        if (feeB > 0) {
            vault.totalTokenB -= feeB;
            IERC20(vault.tokenB).safeTransfer(feeRecipient, feeB);
        }

        bytes32 detailsHash = keccak256(strategyData);
        emit Rebalanced(vaultId, msg.sender, detailsHash);
    }

    /**
     * @notice Gets vault information
     * @param vaultId The vault ID to query
     * @return info The vault information
     */
    function getVaultInfo(uint256 vaultId) external view override returns (IVault.VaultInfo memory) {
        return vaults[vaultId];
    }

    /**
     * @notice Gets user's share balance in a vault
     * @param vaultId The vault ID
     * @param user The user address
     * @return shares The user's share balance
     */
    function getUserShares(uint256 vaultId, address user) external view returns (uint256) {
        return userShares[vaultId][user];
    }

    /**
     * @notice Gets vault strategy parameters
     * @param vaultId The vault ID
     * @return params The strategy parameters
     */
    function getVaultStrategy(uint256 vaultId) external view returns (StrategyParams memory) {
        return vaultStrategies[vaultId];
    }

    // ============ Admin Functions ============

    /**
     * @notice Sets the strategy manager address
     * @param _strategyManager The new strategy manager address
     */
    function setStrategyManager(address _strategyManager) external onlyOwner {
        if (_strategyManager == address(0)) revert ZeroAddress();
        strategyManager = _strategyManager;
    }

    /**
     * @notice Authorizes a relayer for rebalancing
     * @param relayer The relayer address to authorize
     * @param authorized Whether to authorize or revoke
     */
    function setRelayerAuthorization(address relayer, bool authorized) external onlyOwner {
        authorizedRelayers[relayer] = authorized;
    }

    /**
     * @notice Updates the protocol fee
     * @param newFeeBps The new fee in basis points
     */
    function setProtocolFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= 1000, "Fee too high"); // Max 10%
        protocolFeeBps = newFeeBps;
    }

    /**
     * @notice Updates the fee recipient
     * @param _feeRecipient The new fee recipient address
     */
    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        if (_feeRecipient == address(0)) revert ZeroAddress();
        feeRecipient = _feeRecipient;
    }

    /**
     * @notice Pauses the contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpauses the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Attaches a strategy contract to a vault
     * @param vaultId The vault ID
     * @param strategy The strategy contract address
     */
    function attachStrategy(uint256 vaultId, address strategy) external {
        IVault.VaultInfo storage vault = vaults[vaultId];
        if (vault.owner == address(0)) revert VaultNotFound();
        require(msg.sender == vault.owner || msg.sender == owner(), "Unauthorized");
        
        vault.strategy = strategy;
        emit StrategyAttached(vaultId, strategy);
    }

    // ============ Internal Functions ============

    /**
     * @notice Calculates square root using Babylonian method
     * @param x The input value
     * @return y The square root
     */
    function _sqrt(uint256 x) internal pure returns (uint256 y) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }
}
