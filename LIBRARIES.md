# Technical Stack & Libraries

This document lists the libraries and tools used in the Adaptive Liquidity Orchestrator, prioritized for the 2025 ecosystem.

## 1. Smart Contract Layer (opBNB)
*   **solidity** `^0.8.23`: Compiler.
*   **@openzeppelin/contracts** `^5.0.0`: Standard secure implementations (ERC20, Ownable, Pausable).
*   **hardhat** `^2.19.0`: Development environment (Note: v3 is emerging, v2 stable is used).
*   **hardhat-deploy**: Deployment management.
*   **hardhat-gas-reporter**: Gas usage analytics.
*   **solidity-coverage**: Test coverage.
*   **prb-math** (Optional): High-precision fixed-point math.

## 2. Backend / Relayer Service (Node.js)
*   **node**: v20.x LTS.
*   **typescript**: `^5.x`.
*   **fastify**: `^4.x` / `^5.x`: High-performance web framework.
*   **ethers**: `^6.x`: Ethereum library.
*   **viem**: `^2.x`: TypeScript interfaces for Ethereum.
*   **prisma**: `^5.x`: ORM.
*   **bullmq**: Job queue for relayer tasks.
*   **siwe**: Sign-in with Ethereum.
*   **zod**: Schema validation.
*   **pino**: Logger.
*   **crypto**: For UUID generation.

## 3. Frontend Application (React)
*   **react**: `^18.x` (or `^19.x` beta).
*   **vite**: `^5.x`.
*   **wagmi**: `^2.x` / `^3.x`: Web3 React Hooks.
*   **viem**: `^2.x`.
*   **@rainbow-me/rainbowkit**: Wallet connection UI.
*   **tailwindcss**: `^3.x`: Styling.
*   **recharts**: Data visualization.
*   **framer-motion**: Animations.
*   **lucide-react**: Icons.

## 4. AI Optimizer (Python - Optional Logic)
*   **python**: 3.11+.
*   **numpy**: Numerical computing.
*   **pandas**: Data analysis.
*   **scikit-learn**: Machine learning models.
*   **matplotlib**: Plotting.

## 5. Automation & Infrastructure
*   **vercel**: Frontend hosting.
*   **docker**: Containerization.
*   **github-actions**: CI/CD.
*   **EIP-712**: Typed structure data signing/hashing standards.
