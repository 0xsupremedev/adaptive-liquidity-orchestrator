import { z } from 'zod';

// ============ Request Schemas ============

export const LoginRequestSchema = z.object({
    message: z.string(),
    signature: z.string(),
});

export const CreateVaultRequestSchema = z.object({
    tokenA: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    tokenB: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    strategy: z.enum(['conservative', 'moderate', 'aggressive']),
    params: z.object({
        tickLower: z.number().int().optional(),
        tickUpper: z.number().int().optional(),
        rebalanceThreshold: z.number().min(0).max(10000).optional(),
    }).optional(),
});

export const DepositRequestSchema = z.object({
    amountA: z.string().regex(/^\d+$/),
    amountB: z.string().regex(/^\d+$/),
});

export const WithdrawRequestSchema = z.object({
    shares: z.string().regex(/^\d+$/),
});

export const OptimizerScoreRequestSchema = z.object({
    vaultId: z.number().int().positive(),
    historyWindow: z.number().int().min(60).max(86400).optional().default(3600),
});

export const BacktestRequestSchema = z.object({
    vaultId: z.number().int().positive(),
    start: z.string().datetime().optional(),
    end: z.string().datetime().optional(),
    strategy: z.enum(['conservative', 'moderate', 'aggressive']),
});

export const SubmitSignalRequestSchema = z.object({
    vaultId: z.number().int().positive(),
    action: z.enum(['rebalance', 'withdraw_to_stable']),
    payload: z.record(z.any()),
    signature: z.string(),
});

// ============ Response Types ============

export interface VaultInfo {
    vaultId: number;
    owner: string;
    tokenA: string;
    tokenB: string;
    totalShares: string;
    totalTokenA: string;
    totalTokenB: string;
    strategy: string;
    lastRebalance: number;
    isActive: boolean;
    tvlUsd?: number;
    apy?: number;
}

export interface OptimizerScore {
    shouldRebalance: boolean;
    reason: string;
    recommendedAction: {
        withdrawPct: number;
        destination: string;
        range: {
            tickLower: number;
            tickUpper: number;
        };
    };
    confidence: number;
    timestamp: number;
    metrics: {
        volatility: number;
        volume24h: number;
        priceChange24h: number;
        slippageEstimate: number;
    };
}

export interface BacktestResult {
    period: {
        start: string;
        end: string;
        durationHours: number;
    };
    performance: {
        withOrchestrator: {
            feesEarned: number;
            impermanentLoss: number;
            netPnl: number;
            avgSlippage: number;
        };
        withoutOrchestrator: {
            feesEarned: number;
            impermanentLoss: number;
            netPnl: number;
            avgSlippage: number;
        };
    };
    improvement: {
        feesImprovement: number;
        ilReduction: number;
        slippageReduction: number;
    };
    rebalanceCount: number;
}

export interface RelayerJob {
    jobId: string;
    vaultId: number;
    action: string;
    status: 'queued' | 'pending' | 'completed' | 'failed';
    txHash?: string;
    createdAt: number;
    updatedAt: number;
    error?: string;
}

// ============ Inferred Types ============

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type CreateVaultRequest = z.infer<typeof CreateVaultRequestSchema>;
export type DepositRequest = z.infer<typeof DepositRequestSchema>;
export type WithdrawRequest = z.infer<typeof WithdrawRequestSchema>;
export type OptimizerScoreRequest = z.infer<typeof OptimizerScoreRequestSchema>;
export type BacktestRequest = z.infer<typeof BacktestRequestSchema>;
export type SubmitSignalRequest = z.infer<typeof SubmitSignalRequestSchema>;
