/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_WALLETCONNECT_PROJECT_ID: string;
    readonly VITE_VAULT_MANAGER_ADDRESS: string;
    readonly VITE_STRATEGY_MANAGER_ADDRESS: string;
    readonly VITE_REBALANCE_EXECUTOR_ADDRESS: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
