# Adaptive Liquidity Orchestrator

**AI-Driven DEX Liquidity Manager on opBNB**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Built for BNB Chain](https://img.shields.io/badge/Built%20for-BNB%20Chain-F0B90B?style=for-the-badge&logo=binance&logoColor=black)](https://www.bnbchain.org/)
[![opBNB](https://img.shields.io/badge/Network-opBNB-blue?style=for-the-badge&logo=binance&logoColor=white)](https://opbnb.bnbchain.org/)

> **Reduce slippage and impermanent loss with intelligent liquidity rebalancing. The first AI-driven DEX liquidity orchestrator on opBNB.**

<img width="1859" height="1079" alt="image" src="https://github.com/user-attachments/assets/b2e96acc-c826-4858-9d18-85b7d5a6b2e5" />


## Tech Stack

### Frontend
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)

### Web3 & Auth
![Thirdweb](https://img.shields.io/badge/Thirdweb-F213C4?style=for-the-badge&logo=thirdweb&logoColor=white)
![Wagmi](https://img.shields.io/badge/Wagmi-1E1E1E?style=for-the-badge&logo=wagmi&logoColor=white)
![RainbowKit](https://img.shields.io/badge/RainbowKit-001E2B?style=for-the-badge&logo=rainbow&logoColor=white)
![Reown](https://img.shields.io/badge/Reown%20(WalletConnect)-3B99FC?style=for-the-badge&logo=walletconnect&logoColor=white)

### Blockchain
![Solidity](https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity&logoColor=white)
![Hardhat](https://img.shields.io/badge/Hardhat-FAFAFA?style=for-the-badge&logo=hardhat&logoColor=yellow)
![Ethers.js](https://img.shields.io/badge/Ethers.js-2A2C3E?style=for-the-badge&logo=ethereum&logoColor=white)
![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-4E5EE4?style=for-the-badge&logo=openzeppelin&logoColor=white)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Fastify](https://img.shields.io/badge/fastify-000000?style=for-the-badge&logo=fastify&logoColor=white)

---

## Problem Statement

DeFi liquidity providers face significant challenges:
- **Impermanent Loss (IL)**: Up to 40% loss in volatile markets.
- **Manual Position Management**: Hours spent monitoring and adjusting ranges.
- **High Slippage**: Large trades on thin pools incur heavy slippage.
- **Static LP Positions**: Most LPs use V2-style pools without optimization.

## Solution

**Adaptive Liquidity Orchestrator** uses AI-driven algorithms to automatically manage LP positions:
1. **Real-time Volatility Monitoring**: Tracks market conditions using simple-statistics and on-chain data.
2. **Intelligent Rebalancing**: Automatically adjusts liquidity ranges based on AI recommendations.
3. **Slippage Reduction**: Optimizes depth across price ranges.
4. **IL Protection**: Shifts liquidity to stable pools during volatility spikes.

---

## Architecture

```mermaid
flowchart TB
    subgraph Frontend["Frontend (React + Vite)"]
        UI[User Interface]
        Wallet[Wallet Connection]
        Charts[Metrics Charts]
    end
    
    subgraph Backend["Backend (Fastify)"]
        API[REST API]
        Optimizer[AI Optimizer]
        Relayer[Transaction Relayer]
    end
    
    subgraph Blockchain["opBNB L2"]
        VM[VaultManager]
        SM[StrategyManager]
        RE[RebalanceExecutor]
        DEX[PancakeSwap V3]
    end
    
    subgraph External["External"]
        Oracle[Binance Oracle]
        Scan[opBNBScan]
    end
    
    UI --> API
    Wallet --> VM
    API --> Optimizer
    Optimizer --> Relayer
    Relayer --> RE
    RE --> VM
    VM --> DEX
    Oracle --> SM
    VM --> Scan
```

---

## Quick Start

### Prerequisites
- Node.js 20+
- npm or yarn
- MetaMask wallet (opBNB Testnet)

### Installation

```bash
# Clone the repository
git clone https://github.com/0xsupremedev/adaptive-liquidity-orchestrator.git
cd adaptive-liquidity-orchestrator

# Install dependencies (Root, Backend, Frontend)
npm run install:all # (Hypothetical script, or run manually)
```

### Environment Setup

Create a `.env` file in the root:
```env
PRIVATE_KEY=your_private_key
OPBNBSCAN_API_KEY=your_api_key
VITE_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
```

### Run Locally

1. **Smart Contracts Node**:
   ```bash
   npm run node
   npm run deploy:local
   ```

2. **Backend**:
   ```bash
   cd backend
   npm run dev
   ```

3. **Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

---

## AI Strategy Overview

The optimizer uses **volatility-based heuristics**:

1. **Volatility Detection**: Calculates Exponential Moving Average (EMA) of price changes.
2. **Threshold Comparison**: Recommendations trigger if volatility > 5%.
3. **Action Selection**:
   - **High Volatility**: Widen range + move to stable pool.
   - **Trending Up**: Shift range upwards.
   - **Trending Down**: Shift range downwards.

---

## BNB Hackathon 2025

Built for the **BNB Chain Hackathon 2025**.

- **Innovation**: First AI-driven LP manager on opBNB.
- **Integration**: Native opBNB L2 deployment, Thirdweb Auth, RainbowKit.
- **User Experience**: Premium "Minimal Animated Hero" UI.

---

## License


This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
