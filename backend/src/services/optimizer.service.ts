import ss from 'simple-statistics';

interface PriceData {
    price: number;
    timestamp: number;
}

interface VaultMetrics {
    volatility: number;
    volume24h: number;
    priceChange24h: number;
    slippageEstimate: number;
    trend: 'bullish' | 'bearish' | 'neutral';
}

interface RebalanceRecommendation {
    shouldRebalance: boolean;
    reason: string;
    confidence: number;
    action: {
        withdrawPct: number;
        destination: string;
        range: {
            tickLower: number;
            tickUpper: number;
        };
    };
}

/**
 * AI Optimizer Service
 * Uses heuristic-based rules and simple statistics to recommend rebalances
 */
export class OptimizerService {
    // Configuration thresholds
    private readonly VOLATILITY_THRESHOLD = 0.05; // 5% volatility triggers rebalance
    private readonly PRICE_CHANGE_THRESHOLD = 0.03; // 3% price change triggers consideration
    private readonly SLIPPAGE_THRESHOLD = 0.02; // 2% slippage is concerning
    private readonly MIN_CONFIDENCE = 0.6; // Minimum confidence to recommend
    private readonly REBALANCE_COOLDOWN = 3600; // 1 hour minimum between rebalances

    // Simulated price history (in production, fetch from oracle/DEX)
    private priceHistory: Map<string, PriceData[]> = new Map();

    constructor() {
        // Initialize with some mock data for demo
        this.initializeMockData();
    }

    /**
     * Calculates metrics for a vault's token pair
     */
    calculateMetrics(tokenA: string, tokenB: string): VaultMetrics {
        const historyA = this.priceHistory.get(tokenA) || [];
        const historyB = this.priceHistory.get(tokenB) || [];

        // Calculate volatility using standard deviation of returns
        const volatility = this.calculateVolatility(historyA);

        // Calculate 24h volume (simulated)
        const volume24h = this.simulateVolume(tokenA, tokenB);

        // Calculate price change
        const priceChange24h = this.calculatePriceChange(historyA);

        // Estimate slippage based on volume and TVL
        const slippageEstimate = this.estimateSlippage(volume24h);

        // Determine trend
        const trend = this.determineTrend(historyA);

        return {
            volatility,
            volume24h,
            priceChange24h,
            slippageEstimate,
            trend,
        };
    }

    /**
     * Generates a rebalance recommendation based on metrics
     */
    getRecommendation(
        vaultId: number,
        tokenA: string,
        tokenB: string,
        currentTickLower: number,
        currentTickUpper: number,
        lastRebalance: number
    ): RebalanceRecommendation {
        const metrics = this.calculateMetrics(tokenA, tokenB);
        const timeSinceRebalance = Math.floor(Date.now() / 1000) - lastRebalance;

        // Check cooldown
        if (timeSinceRebalance < this.REBALANCE_COOLDOWN) {
            return {
                shouldRebalance: false,
                reason: 'cooldown_not_passed',
                confidence: 1.0,
                action: this.getDefaultAction(currentTickLower, currentTickUpper),
            };
        }

        // Evaluate rebalance conditions
        let shouldRebalance = false;
        let reason = 'no_action_needed';
        let confidence = 0.5;
        let withdrawPct = 0;
        let destination = 'same_pool';
        let newTickLower = currentTickLower;
        let newTickUpper = currentTickUpper;

        // High volatility check
        if (metrics.volatility >= this.VOLATILITY_THRESHOLD) {
            shouldRebalance = true;
            reason = 'volatility_spike';
            confidence = Math.min(0.95, 0.6 + metrics.volatility * 2);

            // Widen range and consider stable pool
            const rangeExpansion = Math.floor((currentTickUpper - currentTickLower) * 0.2);
            newTickLower = currentTickLower - rangeExpansion;
            newTickUpper = currentTickUpper + rangeExpansion;

            if (metrics.volatility > 0.08) {
                withdrawPct = 30; // Move 30% to stable
                destination = 'stable_pool';
            }
        }

        // Large price change check
        if (Math.abs(metrics.priceChange24h) >= this.PRICE_CHANGE_THRESHOLD) {
            const currentRange = currentTickUpper - currentTickLower;

            if (metrics.priceChange24h > 0 && metrics.trend === 'bullish') {
                // Price moving up - shift range up
                shouldRebalance = true;
                reason = 'price_increase_shift';
                confidence = 0.7 + Math.abs(metrics.priceChange24h);
                newTickLower = currentTickLower + Math.floor(currentRange * 0.1);
                newTickUpper = currentTickUpper + Math.floor(currentRange * 0.1);
            } else if (metrics.priceChange24h < 0 && metrics.trend === 'bearish') {
                // Price moving down - shift range down
                shouldRebalance = true;
                reason = 'price_decrease_shift';
                confidence = 0.7 + Math.abs(metrics.priceChange24h);
                newTickLower = currentTickLower - Math.floor(currentRange * 0.1);
                newTickUpper = currentTickUpper - Math.floor(currentRange * 0.1);
            }
        }

        // High slippage check
        if (metrics.slippageEstimate >= this.SLIPPAGE_THRESHOLD) {
            shouldRebalance = true;
            reason = 'high_slippage';
            confidence = 0.75;
            withdrawPct = 20; // Redistribute to reduce concentration
            destination = 'wider_range';

            // Widen range significantly
            const rangeExpansion = Math.floor((currentTickUpper - currentTickLower) * 0.3);
            newTickLower = currentTickLower - rangeExpansion;
            newTickUpper = currentTickUpper + rangeExpansion;
        }

        // Apply minimum confidence filter
        if (confidence < this.MIN_CONFIDENCE) {
            shouldRebalance = false;
            reason = 'low_confidence';
        }

        return {
            shouldRebalance,
            reason,
            confidence: Math.round(confidence * 100) / 100,
            action: {
                withdrawPct,
                destination,
                range: {
                    tickLower: newTickLower,
                    tickUpper: newTickUpper,
                },
            },
        };
    }

    /**
     * Runs a backtest simulation
     */
    runBacktest(
        vaultId: number,
        startTime: number,
        endTime: number,
        strategy: 'conservative' | 'moderate' | 'aggressive'
    ) {
        const durationHours = (endTime - startTime) / 3600;

        // Simulate different outcomes based on strategy
        const baseMetrics = {
            conservative: { rebalances: 2, feeMult: 0.9, ilMult: 0.7 },
            moderate: { rebalances: 5, feeMult: 1.0, ilMult: 0.8 },
            aggressive: { rebalances: 10, feeMult: 1.2, ilMult: 0.9 },
        }[strategy];

        // Simulated results
        const withOrchestrator = {
            feesEarned: 150 * baseMetrics.feeMult,
            impermanentLoss: 80 * baseMetrics.ilMult,
            netPnl: 150 * baseMetrics.feeMult - 80 * baseMetrics.ilMult,
            avgSlippage: 0.007,
        };

        const withoutOrchestrator = {
            feesEarned: 120,
            impermanentLoss: 100,
            netPnl: 20,
            avgSlippage: 0.012,
        };

        return {
            period: {
                start: new Date(startTime * 1000).toISOString(),
                end: new Date(endTime * 1000).toISOString(),
                durationHours,
            },
            performance: {
                withOrchestrator,
                withoutOrchestrator,
            },
            improvement: {
                feesImprovement: ((withOrchestrator.feesEarned - withoutOrchestrator.feesEarned) / withoutOrchestrator.feesEarned) * 100,
                ilReduction: ((withoutOrchestrator.impermanentLoss - withOrchestrator.impermanentLoss) / withoutOrchestrator.impermanentLoss) * 100,
                slippageReduction: ((withoutOrchestrator.avgSlippage - withOrchestrator.avgSlippage) / withoutOrchestrator.avgSlippage) * 100,
            },
            rebalanceCount: baseMetrics.rebalances,
        };
    }

    // ============ Private Methods ============

    private calculateVolatility(prices: PriceData[]): number {
        if (prices.length < 2) return 0.03; // Default moderate volatility

        const priceValues = prices.map(p => p.price);
        const returns: number[] = [];

        for (let i = 1; i < priceValues.length; i++) {
            returns.push((priceValues[i] - priceValues[i - 1]) / priceValues[i - 1]);
        }

        if (returns.length === 0) return 0.03;

        return ss.standardDeviation(returns);
    }

    private calculatePriceChange(prices: PriceData[]): number {
        if (prices.length < 2) return 0;

        const oldest = prices[0].price;
        const newest = prices[prices.length - 1].price;

        return (newest - oldest) / oldest;
    }

    private simulateVolume(tokenA: string, tokenB: string): number {
        // Simulate 24h volume between $100k and $10M
        return 100000 + Math.random() * 9900000;
    }

    private estimateSlippage(volume: number): number {
        // Lower volume = higher slippage
        if (volume < 500000) return 0.025;
        if (volume < 1000000) return 0.015;
        if (volume < 5000000) return 0.008;
        return 0.004;
    }

    private determineTrend(prices: PriceData[]): 'bullish' | 'bearish' | 'neutral' {
        if (prices.length < 3) return 'neutral';

        const priceValues = prices.map(p => p.price);
        const regression = ss.linearRegression(priceValues.map((p, i) => [i, p]));

        if (regression.m > 0.001) return 'bullish';
        if (regression.m < -0.001) return 'bearish';
        return 'neutral';
    }

    private getDefaultAction(tickLower: number, tickUpper: number) {
        return {
            withdrawPct: 0,
            destination: 'same_pool',
            range: { tickLower, tickUpper },
        };
    }

    private initializeMockData() {
        // Mock BNB price history (simulating ~$600)
        const bnbAddress = '0x4200000000000000000000000000000000000006';
        const bnbHistory: PriceData[] = [];
        const now = Math.floor(Date.now() / 1000);

        for (let i = 24; i >= 0; i--) {
            bnbHistory.push({
                price: 600 + (Math.random() - 0.5) * 60, // $570-$630
                timestamp: now - i * 3600,
            });
        }
        this.priceHistory.set(bnbAddress, bnbHistory);

        // Mock USDT price history (stable ~$1)
        const usdtAddress = '0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3';
        const usdtHistory: PriceData[] = [];

        for (let i = 24; i >= 0; i--) {
            usdtHistory.push({
                price: 1 + (Math.random() - 0.5) * 0.002, // $0.999-$1.001
                timestamp: now - i * 3600,
            });
        }
        this.priceHistory.set(usdtAddress, usdtHistory);
    }

    /**
     * Updates price data (called by external data feed)
     */
    updatePrice(token: string, price: number) {
        const history = this.priceHistory.get(token) || [];
        history.push({ price, timestamp: Math.floor(Date.now() / 1000) });

        // Keep only last 24 hours of data
        const cutoff = Math.floor(Date.now() / 1000) - 86400;
        const filtered = history.filter(p => p.timestamp > cutoff);

        this.priceHistory.set(token, filtered);
    }
}

// Export singleton instance
export const optimizerService = new OptimizerService();
