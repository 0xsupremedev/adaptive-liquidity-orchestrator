import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Zap,
    TrendingUp,
    TrendingDown,
    Activity,
    RefreshCw,
    ExternalLink,
    AlertCircle
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Legend
} from 'recharts';
import { API_BASE_URL } from '../config/wagmi';

interface OptimizerRecommendation {
    shouldRebalance: boolean;
    reason: string;
    confidence: number;
    recommendedAction: {
        withdrawPct: number;
        destination: string;
        range: {
            tickLower: number;
            tickUpper: number;
        };
    };
    metrics: {
        volatility: number;
        volume24h: number;
        priceChange24h: number;
        slippageEstimate: number;
    };
}

// Mock comparison data
const comparisonData = [
    { name: 'Fees Earned', withAI: 156, noAI: 120, unit: '$' },
    { name: 'IL Incurred', withAI: 45, noAI: 89, unit: '$' },
    { name: 'Net PnL', withAI: 111, noAI: 31, unit: '$' },
    { name: 'Avg Slippage', withAI: 0.7, noAI: 1.2, unit: '%' },
];

// Mock slippage chart data
const slippageData = [
    { tradeSize: '1K', withAI: 0.3, noAI: 0.5 },
    { tradeSize: '5K', withAI: 0.5, noAI: 0.8 },
    { tradeSize: '10K', withAI: 0.7, noAI: 1.2 },
    { tradeSize: '25K', withAI: 1.0, noAI: 1.8 },
    { tradeSize: '50K', withAI: 1.5, noAI: 2.5 },
    { tradeSize: '100K', withAI: 2.0, noAI: 3.5 },
];

export default function VaultDetail() {
    const { vaultId } = useParams();
    const [recommendation, setRecommendation] = useState<OptimizerRecommendation | null>(null);
    const [loading, setLoading] = useState(true);
    const [rebalancing, setRebalancing] = useState(false);

    useEffect(() => {
        fetchRecommendation();
    }, [vaultId]);

    const fetchRecommendation = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/optimizer/score`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vaultId: parseInt(vaultId || '1') }),
            });

            if (response.ok) {
                const data = await response.json();
                setRecommendation(data);
            }
        } catch (error) {
            console.error('Failed to fetch recommendation:', error);
            // Use mock data
            setRecommendation({
                shouldRebalance: true,
                reason: 'volatility_spike',
                confidence: 0.85,
                recommendedAction: {
                    withdrawPct: 30,
                    destination: 'stable_pool',
                    range: { tickLower: -887340, tickUpper: 887340 },
                },
                metrics: {
                    volatility: 0.065,
                    volume24h: 2500000,
                    priceChange24h: -0.032,
                    slippageEstimate: 0.008,
                },
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRebalance = async () => {
        setRebalancing(true);

        try {
            // Simulate rebalance
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Refresh recommendation
            await fetchRecommendation();
        } catch (error) {
            console.error('Rebalance failed:', error);
        } finally {
            setRebalancing(false);
        }
    };

    const getReasonLabel = (reason: string) => {
        const labels: Record<string, string> = {
            volatility_spike: 'High Volatility Detected',
            price_increase_shift: 'Price Moving Up',
            price_decrease_shift: 'Price Moving Down',
            high_slippage: 'High Slippage Risk',
            no_action_needed: 'Position Optimal',
            cooldown_not_passed: 'Cooling Down',
        };
        return labels[reason] || reason;
    };

    return (
        <div className="min-h-screen px-4 py-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">
                            WBNB/USDT Vault <span className="text-muted-foreground">#{vaultId}</span>
                        </h1>
                        <p className="text-muted-foreground">AI-Managed Liquidity Position</p>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Column - Stats & Position */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Stats Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'TVL', value: '$6,234', icon: TrendingUp },
                                { label: 'APR', value: '+24.5%', icon: Activity, positive: true },
                                { label: 'Fees (24h)', value: '$12.45', icon: TrendingUp, positive: true },
                                { label: 'IL', value: '-$8.20', icon: TrendingDown, negative: true },
                            ].map((stat) => (
                                <div key={stat.label} className="stat-card">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-muted-foreground text-sm">{stat.label}</span>
                                        <stat.icon className={`w-4 h-4 ${stat.positive ? 'text-accent-green' :
                                            stat.negative ? 'text-accent-red' : 'text-muted-foreground'
                                            }`} />
                                    </div>
                                    <div className={`text-xl font-bold ${stat.positive ? 'text-accent-green' :
                                        stat.negative ? 'text-accent-red' : 'text-foreground'
                                        }`}>
                                        {stat.value}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Slippage Comparison Chart */}
                        <div className="card">
                            <h3 className="text-lg font-semibold mb-4">
                                Slippage vs Trade Size
                            </h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={slippageData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#2e3038" />
                                        <XAxis dataKey="tradeSize" stroke="#5a606d" fontSize={12} />
                                        <YAxis stroke="#5a606d" fontSize={12} tickFormatter={(v) => `${v}%`} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1e1f25',
                                                border: '1px solid #3f434c',
                                                borderRadius: '12px',
                                                color: '#fff',
                                            }}
                                            formatter={(value: number) => [`${value}%`, '']}
                                        />
                                        <Legend />
                                        <Bar dataKey="withAI" name="With AI" fill="#F0B90B" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="noAI" name="Without AI" fill="#5a606d" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Performance Comparison */}
                        <div className="card">
                            <h3 className="text-lg font-semibold mb-4">
                                Performance Comparison (7 days)
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {comparisonData.map((item) => {
                                    const improvement = ((item.withAI - item.noAI) / item.noAI) * 100;
                                    const isPositive = item.name === 'IL Incurred' ? improvement < 0 : improvement > 0;

                                    return (
                                        <div key={item.name} className="p-4 rounded-xl bg-muted/50">
                                            <div className="text-sm text-muted-foreground mb-2">{item.name}</div>
                                            <div className="flex items-end gap-2">
                                                <div className="text-xl font-bold">
                                                    {item.unit === '$' ? `$${item.withAI}` : `${item.withAI}%`}
                                                </div>
                                                <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-accent-green' : 'text-accent-red'}`}>
                                                    {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />} {Math.abs(improvement).toFixed(0)}%
                                                </div>
                                            </div>
                                            <div className="text-sm text-muted-foreground mt-1">
                                                vs {item.unit === '$' ? `$${item.noAI}` : `${item.noAI}%`} without AI
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - AI Recommendation */}
                    <div className="space-y-6">
                        {/* AI Recommendation Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`card border-2 ${recommendation?.shouldRebalance
                                ? 'border-primary/50 bg-primary/5'
                                : 'border-border'
                                }`}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-2 rounded-xl ${recommendation?.shouldRebalance
                                    ? 'bg-primary/20'
                                    : 'bg-muted'
                                    }`}>
                                    <Zap className={`w-5 h-5 ${recommendation?.shouldRebalance
                                        ? 'text-primary'
                                        : 'text-muted-foreground'
                                        }`} />
                                </div>
                                <div>
                                    <h3 className="font-semibold">AI Recommendation</h3>
                                    <p className="text-sm text-muted-foreground">Updated just now</p>
                                </div>
                            </div>

                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                                </div>
                            ) : recommendation ? (
                                <div className="space-y-4">
                                    {/* Status */}
                                    <div className={`p-3 rounded-xl ${recommendation.shouldRebalance
                                        ? 'bg-primary/10 border border-primary/30'
                                        : 'bg-green-500/10 border border-green-500/30'
                                        }`}>
                                        <div className="flex items-center gap-2">
                                            {recommendation.shouldRebalance ? (
                                                <AlertCircle className="w-5 h-5 text-primary" />
                                            ) : (
                                                <Activity className="w-5 h-5 text-green-500" />
                                            )}
                                            <span className={`font-medium ${recommendation.shouldRebalance
                                                ? 'text-primary'
                                                : 'text-green-400'
                                                }`}>
                                                {getReasonLabel(recommendation.reason)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Confidence */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-muted-foreground">Confidence</span>
                                            <span className="text-sm font-medium">
                                                {(recommendation.confidence * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary rounded-full transition-all"
                                                style={{ width: `${recommendation.confidence * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Metrics */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between py-2 border-b border-border">
                                            <span className="text-muted-foreground">Volatility</span>
                                            <span className="font-medium">
                                                {(recommendation.metrics.volatility * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between py-2 border-b border-border">
                                            <span className="text-muted-foreground">24h Volume</span>
                                            <span className="font-medium">
                                                ${(recommendation.metrics.volume24h / 1000000).toFixed(1)}M
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between py-2 border-b border-border">
                                            <span className="text-muted-foreground">Price Change</span>
                                            <span className={`font-medium ${recommendation.metrics.priceChange24h >= 0
                                                ? 'text-accent-green'
                                                : 'text-accent-red'
                                                }`}>
                                                {(recommendation.metrics.priceChange24h * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between py-2">
                                            <span className="text-muted-foreground">Est. Slippage</span>
                                            <span className="font-medium">
                                                {(recommendation.metrics.slippageEstimate * 100).toFixed(2)}%
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action */}
                                    {recommendation.shouldRebalance && (
                                        <div className="pt-4 border-t border-border">
                                            <div className="text-sm text-muted-foreground mb-2">Recommended Action</div>
                                            <div className="p-3 rounded-xl bg-muted/50 text-sm">
                                                <div className="text-foreground mb-1">
                                                    Move <span className="text-primary font-semibold">
                                                        {recommendation.recommendedAction.withdrawPct}%
                                                    </span> to {recommendation.recommendedAction.destination}
                                                </div>
                                                <div className="text-muted-foreground">
                                                    Widen range by 20% to reduce out-of-range risk
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Rebalance Button */}
                                    {recommendation.shouldRebalance && (
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleRebalance}
                                            disabled={rebalancing}
                                            className="btn-primary w-full flex items-center justify-center gap-2"
                                        >
                                            {rebalancing ? (
                                                <>
                                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                                    Rebalancing...
                                                </>
                                            ) : (
                                                <>
                                                    <Zap className="w-5 h-5" />
                                                    Execute Rebalance
                                                </>
                                            )}
                                        </motion.button>
                                    )}

                                    <button
                                        onClick={fetchRecommendation}
                                        className="btn-secondary w-full flex items-center justify-center gap-2"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Refresh
                                    </button>
                                </div>
                            ) : null}
                        </motion.div>

                        {/* Position Info */}
                        <div className="card">
                            <h3 className="font-semibold mb-4">Current Position</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Token A</span>
                                    <span className="font-medium">10.0 WBNB</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Token B</span>
                                    <span className="font-medium">6,000 USDT</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Share Balance</span>
                                    <span className="font-medium">244.94</span>
                                </div>
                                <div className="pt-3 border-t border-border">
                                    <a
                                        href={`https://opbnb-testnet.bscscan.com/address/0x1234`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm"
                                    >
                                        View on opBNBScan
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
