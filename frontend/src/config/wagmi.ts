import { http } from 'wagmi';
import { opBNBTestnet, opBNB } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

// Custom opBNB chain config (in case wagmi doesn't have latest)
const opBNBTestnetConfig = {
    ...opBNBTestnet,
    name: 'opBNB Testnet',
    nativeCurrency: {
        name: 'tBNB',
        symbol: 'tBNB',
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ['https://opbnb-testnet-rpc.bnbchain.org'],
        },
        public: {
            http: ['https://opbnb-testnet-rpc.bnbchain.org'],
        },
    },
    blockExplorers: {
        default: {
            name: 'opBNBScan',
            url: 'https://opbnb-testnet.bscscan.com',
        },
    },
};

const opBNBMainnetConfig = {
    ...opBNB,
    name: 'opBNB',
    nativeCurrency: {
        name: 'BNB',
        symbol: 'BNB',
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ['https://opbnb-mainnet-rpc.bnbchain.org'],
        },
        public: {
            http: ['https://opbnb-mainnet-rpc.bnbchain.org'],
        },
    },
    blockExplorers: {
        default: {
            name: 'opBNBScan',
            url: 'https://opbnb.bscscan.com',
        },
    },
};

export const config = getDefaultConfig({
    appName: 'Adaptive Liquidity Orchestrator',
    projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
    chains: [opBNBTestnetConfig, opBNBMainnetConfig],
    transports: {
        [opBNBTestnetConfig.id]: http('https://opbnb-testnet-rpc.bnbchain.org'),
        [opBNBMainnetConfig.id]: http('https://opbnb-mainnet-rpc.bnbchain.org'),
    },
});

// Contract addresses (update after deployment)
export const CONTRACTS = {
    vaultManager: import.meta.env.VITE_VAULT_MANAGER_ADDRESS || '',
    strategyManager: import.meta.env.VITE_STRATEGY_MANAGER_ADDRESS || '',
    rebalanceExecutor: import.meta.env.VITE_REBALANCE_EXECUTOR_ADDRESS || '',
};

// Token addresses on opBNB
export const TOKENS = {
    WBNB: '0x4200000000000000000000000000000000000006',
    USDT: '0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3',
    USDC: '0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3', // Same as USDT for demo
};

// API configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
