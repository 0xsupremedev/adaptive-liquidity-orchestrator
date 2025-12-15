# Security Plan — Adaptive Liquidity Orchestrator

This document outlines the security strategy for the Adaptive Liquidity Orchestrator, prioritizing hackathon speed while maintaining a path to production.

## 1. High-Level Threat Model

### Assets to Protect
*   **User Funds:** Deposited in vaults (Primary).
*   **Data Integrity:** Oracle prices and market data.
*   **Authority:** Relayer/Executor permissions to prevent unauthorized rebalances.
*   **Code Integrity:** Source code verification.
*   **Secrets:** Private keys for relayers and AI optimizer.

### Adversaries
*   External attackers (exploiting smart contract bugs).
*   Malicious relayers or compromised keys.
*   Oracle manipulation (flash loan attacks).
*   MEV/Front-running bots.
*   Insider threats (leaked keys).

## 2. Security Principles

*   **Least Privilege:** Minimal permissions for contracts and relayers.
*   **Fail-Safe:** Prefer failing closed (pause/withdraw-only) over failing open.
*   **Defense in Depth:** On-chain checks + off-chain verification + governance.
*   **Minimize Trust:** Use signatures, nonces, and timelocks.
*   **Atomicity:** Combine operations to avoid partial state failures.

## 3. Smart Contract Security (Critical)

### Core Hardening
*   **Libraries:** Use OpenZeppelin for ERC20, AccessControl, Pausable, ReentrancyGuard, SafeERC20.
*   **Reentrancy:** Apply `ReentrancyGuard` to `deposit`, `withdraw`, and `rebalance`.
*   **Math:** Use Solidity ^0.8.x for built-in overflow checks.
*   **Validation:** Strict input validation and detailed error messages.
*   **Limits:** Implement `maxWithdrawPct`, daily caps, and `minTVL`.
*   **Signatures:** EIP-712 verification for relayer actions (validate signer, nonce, expiry).
*   **Pull Payments:** safe patterns for fee collection.

### Access Control
*   **Multisig:** Use Gnosis Safe for `OWNER` role (upgrades, strategy management).
*   **Timelock:** 24-72h timelock for critical parameter changes.
*   **Role Separation:** `OWNER`, `PAUSER`, `RELAYER`.

### Oracle & Price Checks
*   **Sources:** Multiple sources (Chainlink + On-chain TWAP).
*   **Sanity Checks:** `maxPriceDeviation`, `stalePriceThreshold`.
*   **Medianizer:** Avoid single points of failure.

## 4. On-Chain Relayer / EIP-712 Flow

### Design
1.  **AI Optimizer:** Produces `RebalancePayload` and signs with optimizer key.
2.  **Relayer:** Submits signed payload to `RebalanceExecutor`.
3.  **On-Chain Verification:**
    *   Check expiry.
    *   Verify EIP-712 signature matches optimizer key.
    *   Check and consume nonce.
    *   Verify vault existence and status.
    *   Execute `VaultManager.rebalance`.

### Sample Payload
```json
{
  "vaultId": 1,
  "nonce": 42,
  "withdrawPct": 3000,
  "destination": "stable_pool",
  "issuedAt": 1700000000,
  "expiry": 1700003600
}
```

## 5. Off-Chain & Infra Security

### Key Management
*   **Storage:** AWS KMS / GCP KMS / Azure Key Vault (Never in Git).
*   **Rotation:** Regular key rotation.
*   **Isolation:** AI worker is read-only; Relayer holds write keys but no logic.

### Relayer Architecture
*   **Containerized:** Run with non-root user.
*   **Network:** Limited outbound access to specific RPCs.
*   **Validation:** Double-check payloads off-chain before submission.

## 6. Oracle & Manipulation Defenses
*   **TWAP:** Use Time-Weighted Average Price to resist flash attacks.
*   **Slippage Guards:** Revert if execution slippage > threshold.
*   **Pre-validation:** Require conditions to persist for N blocks.

## 7. MEV & Front-Running
*   **Randomization:** Variable timing for execution.
*   **Private Pools:** Use Flashbots or private mempools where available.
*   **Max Slippage:** Enforce hard limits on execution.

## 8. Testing & Verification

### Automated Checks
*   **Unit Tests:** Happy paths & edge cases (Hardhat).
*   **Fuzzing:** Foundry/Forge for property-based testing.
*   **Static Analysis:** Slither.
*   **Coverage:** `solidity-coverage`.

### Commands
```bash
pnpm hardhat test
docker run --rm -v $(pwd):/project -w /project trailofbits/slither slither contracts/
forge test --match-path test/fuzz
```

## 9. Incident Response
1.  **Detect:** Monitoring alerts (Sentry, Grafana).
2.  **Assess:** Multisig team review.
3.  **Mitigate:** Call `pause()` via multisig.
4.  **Contain:** Revoke relayer keys.
5.  **Recover:** Deploy fix/upgrade.

## 10. Security Contact
Report vulnerabilities to: `security@adaptiveliquidity.com` (Placeholder)
We appreciate responsible disclosure.
