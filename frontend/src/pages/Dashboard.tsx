import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Plus,
    TrendingUp,
    Wallet,
    Activity,
    Zap,
    ArrowUpRight
} from 'lucide-react';
import { LineShadowText } from '../components/ui/line-shadow-text';
import { ShimmerButton } from '../components/ui/shimmer-button';
import { useAccount } from 'wagmi';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { API_BASE_URL } from '../config/wagmi';

interface Vault {
    vaultId: number;
    owner: string;
    tokenA: string;
    tokenB: string;
    totalShares: string;
    totalTokenA: string;
    totalTokenB: string;
    lastRebalance: number;
    isActive: boolean;
}

// Mock chart data
const performanceData = [
    { name: 'Day 1', withAI: 100, noAI: 100 },
    { name: 'Day 2', withAI: 102, noAI: 99 },
    { name: 'Day 3', withAI: 105, noAI: 97 },
    { name: 'Day 4', withAI: 103, noAI: 94 },
    { name: 'Day 5', withAI: 108, noAI: 92 },
    { name: 'Day 6', withAI: 112, noAI: 90 },
    { name: 'Day 7', withAI: 115, noAI: 88 },
];

export default function Dashboard() {
    const { address, isConnected } = useAccount();
    const [vaults, setVaults] = useState<Vault[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVaults();
    }, [address]);

    const fetchVaults = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/vaults${address ? `?owner=${address}` : ''}`);
            if (response.ok) {
                const data = await response.json();
                setVaults(data);
            }
        } catch (error) {
            console.error('Failed to fetch vaults:', error);
            // Use mock data for demo
            setVaults([{
                vaultId: 1,
                owner: address || '0x1234...5678',
                tokenA: '0x4200000000000000000000000000000000000006',
                tokenB: '0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3',
                totalShares: '1000000000000000000',
                totalTokenA: '10000000000000000000',
                totalTokenB: '6000000000',
                lastRebalance: Math.floor(Date.now() / 1000) - 3600,
                isActive: true,
            }]);
        } finally {
            setLoading(false);
        }
    };



    const getTokenSymbol = (address: string) => {
        if (address.toLowerCase().includes('4200')) return 'WBNB';
        if (address.toLowerCase().includes('9e5aac')) return 'USDT';
        return 'TOKEN';
    };

    return (
        <div className="min-h-screen px-4 py-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">
                            <LineShadowText className="text-foreground" shadowColor="white">
                                Dashboard
                            </LineShadowText>
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link to="/vaults/create">
                            <ShimmerButton className="bg-orange-500 hover:bg-orange-600 shadow-lg px-6 py-2">
                                <Plus className="w-5 h-5 mr-2" />
                                Create Vault
                            </ShimmerButton>
                        </Link>
                    </div>
                </div>

                {/* Wallet & Stats Header */}
                <div className="grid lg:grid-cols-3 gap-6 mb-8">
                    {/* Left: Wallet & Balances */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="card p-6 bg-gradient-to-br from-card to-background border border-border/50">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <Wallet className="w-5 h-5 text-primary" />
                                        Portfolio Overview
                                    </h2>
                                    <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
                                        {isConnected ? (
                                            <>
                                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                Live on opBNB Testnet
                                            </>
                                        ) : (
                                            'Connect wallet to view portfolio'
                                        )}
                                    </p>
                                </div>
                                {isConnected && (
                                    <div className="text-right">
                                        <div className="text-sm text-muted-foreground">Total Balance</div>
                                        <div className="text-2xl font-bold font-mono">$12,450.00</div>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {[
                                    { symbol: 'BNB', balance: '1.24', value: '$744', color: 'bg-[#F0B90B]/10 text-[#F0B90B]' },
                                    { symbol: 'USDT', balance: '5,230', value: '$5,230', color: 'bg-green-500/10 text-green-500' },
                                    { symbol: 'WBNB', balance: '10.5', value: '$6,300', color: 'bg-blue-500/10 text-blue-500' },
                                    { symbol: 'CAKE', balance: '150', value: '$225', color: 'bg-pink-500/10 text-pink-500' }
                                ].map((token) => (
                                    <div key={token.symbol} className="p-3 rounded-lg bg-background/50 border border-border hover:border-border/80 transition-colors">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${token.color}`}>
                                                {token.symbol}
                                            </span>
                                        </div>
                                        <div className="font-mono font-medium">{token.balance}</div>
                                        <div className="text-xs text-muted-foreground">{token.value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Key Metrics */}
                    <div className="space-y-4">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="stat-card"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-muted-foreground text-sm">Total Value Locked</span>
                                <Activity className="w-4 h-4 text-primary" />
                            </div>
                            <div className="text-2xl font-bold">$12,450</div>
                            <div className="text-sm text-accent-green flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                +5.2% (24h)
                            </div>
                        </motion.div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-card border border-border">
                                <div className="text-sm text-muted-foreground mb-1">Fees (24h)</div>
                                <div className="text-lg font-bold text-accent-green">$156.80</div>
                            </div>
                            <div className="p-4 rounded-xl bg-card border border-border">
                                <div className="text-sm text-muted-foreground mb-1">Active Vaults</div>
                                <div className="text-lg font-bold">3</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Performance Chart */}
                <div className="card mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-semibold text-white">Performance Comparison</h2>
                            <p className="text-dark-400 text-sm">AI-Managed vs Static LP (7 days)</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-primary" />
                                <span className="text-muted-foreground">With AI</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                                <span className="text-muted-foreground">Without AI</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={performanceData}>
                                <defs>
                                    <linearGradient id="colorWithAI" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorNoAI" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#5a606d" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#5a606d" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="name"
                                    stroke="#5a606d"
                                    fontSize={12}
                                    tickLine={false}
                                />
                                <YAxis
                                    stroke="#5a606d"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    domain={[85, 120]}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e1f25',
                                        border: '1px solid #3f434c',
                                        borderRadius: '12px',
                                        color: '#fff',
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="withAI"
                                    stroke="#F97316"
                                    fillOpacity={1}
                                    fill="url(#colorWithAI)"
                                    strokeWidth={2}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="noAI"
                                    stroke="#5a606d"
                                    fillOpacity={1}
                                    fill="url(#colorNoAI)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Vaults List */}
                <div className="card">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold">Your Vaults</h2>
                        <span className="text-muted-foreground text-sm">{vaults.length} vault(s)</span>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                        </div>
                    ) : vaults.length === 0 ? (
                        <div className="text-center py-12">
                            <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground mb-4">No vaults found. Create your first vault to get started!</p>
                            <Link to="/vaults/create">
                                <button className="btn-secondary">Create Vault</button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {vaults.map((vault) => (
                                <Link
                                    key={vault.vaultId}
                                    to={`/vaults/${vault.vaultId}`}
                                    className="block"
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.01 }}
                                        className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all cursor-pointer"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="flex -space-x-2">
                                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm border-2 border-background">
                                                        {getTokenSymbol(vault.tokenA).slice(0, 1)}
                                                    </div>
                                                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm border-2 border-background">
                                                        {getTokenSymbol(vault.tokenB).slice(0, 1)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-white">
                                                        {getTokenSymbol(vault.tokenA)}/{getTokenSymbol(vault.tokenB)}
                                                    </div>
                                                    <div className="text-sm text-dark-400">
                                                        Vault #{vault.vaultId}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-8">
                                                <div className="text-right">
                                                    <div className="text-sm text-muted-foreground">TVL</div>
                                                    <div className="font-semibold">$6,234</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm text-dark-400">APR</div>
                                                    <div className="font-semibold text-accent-green">+24.5%</div>
                                                </div>
                                                <div className="text-right hidden md:block">
                                                    <div className="text-sm text-muted-foreground">Last Rebalance</div>
                                                    <div className="font-semibold">
                                                        {new Date(vault.lastRebalance * 1000).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <ArrowUpRight className="w-5 h-5 text-muted-foreground" />
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
