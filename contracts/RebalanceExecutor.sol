// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "./interfaces/IVault.sol";

/**
 * @title RebalanceExecutor
 * @author Adaptive Liquidity Team
 * @notice Executes rebalances with EIP-712 signature verification
 * @dev Validates signatures from authorized AI optimizer before triggering rebalance
 */
contract RebalanceExecutor is IRebalanceExecutor, Ownable2Step, EIP712 {
    using ECDSA for bytes32;

    // ============ Constants ============

    bytes32 public constant REBALANCE_TYPEHASH = keccak256(
        "RebalancePayload(uint256 vaultId,uint256 nonce,bytes actionData,uint256 issuedAt,uint256 expiry)"
    );

    // ============ State Variables ============

    /// @notice VaultManager contract address
    address public vaultManager;

    /// @notice Authorized signer addresses (AI optimizer keys)
    mapping(address => bool) public authorizedSigners;

    /// @notice Nonces for replay protection
    mapping(address => uint256) public nonces;

    /// @notice Maximum payload age (10 minutes)
    uint256 public maxPayloadAge = 600;

    /// @notice Maximum expiry duration (1 hour)
    uint256 public maxExpiryDuration = 3600;

    // ============ Errors ============

    error InvalidSignature();
    error PayloadExpired();
    error PayloadTooOld();
    error InvalidNonce();
    error UnauthorizedSigner();
    error ZeroAddress();
    error ExecutionFailed();

    // ============ Constructor ============

    constructor(
        address _vaultManager
    ) Ownable(msg.sender) EIP712("AdaptiveLiquidityOrchestrator", "1") {
        if (_vaultManager == address(0)) revert ZeroAddress();
        vaultManager = _vaultManager;
    }

    // ============ External Functions ============

    /**
     * @notice Executes a rebalance with signature verification
     * @param vaultId The vault to rebalance
     * @param signedPayload The encoded RebalancePayload
     * @param signature The EIP-712 signature
     */
    function executeRebalance(
        uint256 vaultId,
        bytes calldata signedPayload,
        bytes calldata signature
    ) external override {
        uint256 gasStart = gasleft();

        // Decode payload
        RebalancePayload memory payload = abi.decode(signedPayload, (RebalancePayload));

        // Validate payload
        if (payload.vaultId != vaultId) revert InvalidSignature();
        if (block.timestamp > payload.expiry) revert PayloadExpired();
        if (block.timestamp < payload.issuedAt) revert PayloadTooOld();
        if (block.timestamp > payload.issuedAt + maxPayloadAge) revert PayloadTooOld();

        // Reconstruct EIP-712 hash
        bytes32 structHash = keccak256(abi.encode(
            REBALANCE_TYPEHASH,
            payload.vaultId,
            payload.nonce,
            keccak256(payload.actionData),
            payload.issuedAt,
            payload.expiry
        ));

        bytes32 hash = _hashTypedDataV4(structHash);

        // Recover signer
        address signer = hash.recover(signature);

        // Validate signer
        if (!authorizedSigners[signer]) revert UnauthorizedSigner();
        if (nonces[signer] != payload.nonce) revert InvalidNonce();

        // Increment nonce
        nonces[signer]++;

        // Execute rebalance on VaultManager
        (bool success, ) = vaultManager.call(
            abi.encodeWithSelector(
                IVaultManager.rebalance.selector,
                vaultId,
                payload.actionData
            )
        );

        if (!success) revert ExecutionFailed();

        uint256 gasUsed = gasStart - gasleft();
        emit RebalanceExecuted(vaultId, msg.sender, gasUsed);
    }

    /**
     * @notice Gets the current nonce for a signer
     * @param signer The signer address
     * @return The current nonce
     */
    function getNonce(address signer) external view override returns (uint256) {
        return nonces[signer];
    }

    /**
     * @notice Returns the EIP-712 domain separator
     * @return The domain separator hash
     */
    function domainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }

    /**
     * @notice Computes the hash of a rebalance payload for signing
     * @param payload The payload to hash
     * @return The EIP-712 typed data hash
     */
    function getPayloadHash(RebalancePayload calldata payload) external view returns (bytes32) {
        bytes32 structHash = keccak256(abi.encode(
            REBALANCE_TYPEHASH,
            payload.vaultId,
            payload.nonce,
            keccak256(payload.actionData),
            payload.issuedAt,
            payload.expiry
        ));

        return _hashTypedDataV4(structHash);
    }

    // ============ Admin Functions ============

    /**
     * @notice Authorizes a signer for executing rebalances
     * @param signer The signer address
     * @param authorized Whether to authorize or revoke
     */
    function setSignerAuthorization(address signer, bool authorized) external onlyOwner {
        if (signer == address(0)) revert ZeroAddress();
        authorizedSigners[signer] = authorized;
    }

    /**
     * @notice Updates the vault manager address
     * @param _vaultManager The new vault manager address
     */
    function setVaultManager(address _vaultManager) external onlyOwner {
        if (_vaultManager == address(0)) revert ZeroAddress();
        vaultManager = _vaultManager;
    }

    /**
     * @notice Updates the maximum payload age
     * @param _maxAge The new maximum age in seconds
     */
    function setMaxPayloadAge(uint256 _maxAge) external onlyOwner {
        maxPayloadAge = _maxAge;
    }

    /**
     * @notice Updates the maximum expiry duration
     * @param _maxExpiry The new maximum expiry in seconds
     */
    function setMaxExpiryDuration(uint256 _maxExpiry) external onlyOwner {
        maxExpiryDuration = _maxExpiry;
    }
}
