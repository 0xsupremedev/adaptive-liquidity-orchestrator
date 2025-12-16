export interface VaultStats {
    totalTvl: number;
    feesEarned: number;
    ilIncurred: number;
    activeVaults: number;
}

export interface DashboardToken {
    symbol: string;
    balance: string;
    valueUsd: number;
    address: string;
}

export interface VaultSnapshot {
    id: number;
    pair: string;
    tvl: number;
    apr: number;
    status: 'active' | 'paused' | 'rebalancing';
    lastRebalance: number;
}

export interface DashboardData {
    stats: VaultStats;
    tokens: DashboardToken[];
    vaults: VaultSnapshot[];
}
