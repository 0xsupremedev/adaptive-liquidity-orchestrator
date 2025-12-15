import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Plus,
    TrendingUp,
    TrendingDown,
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

    const formatAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
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
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">
                            <LineShadowText className="text-foreground" shadowColor="white">
                                Dashboard
                            </LineShadowText>
                        </h1>
                        <p className="text-muted-foreground">
                            {isConnected
                                ? `Connected: ${formatAddress(address!)}`
                                : 'Connect your wallet to view your vaults'}
                        </p>
                    </div>

                    <Link to="/vaults/create">
                        <ShimmerButton className="bg-orange-500 hover:bg-orange-600 shadow-lg px-6 py-2">
                            <Plus className="w-5 h-5 mr-2" />
                            Create Vault
                        </ShimmerButton>
                    </Link>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total TVL', value: '$12,450', change: '+5.2%', icon: Wallet, positive: true },
                        { label: 'Fees Earned', value: '$156.80', change: '+12.3%', icon: TrendingUp, positive: true },
                        { label: 'IL Saved', value: '$89.20', change: '-2.1%', icon: TrendingDown, positive: true },
                        { label: 'Rebalances', value: '7', change: 'This week', icon: Activity, positive: null },
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="stat-card"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-muted-foreground text-sm">{stat.label}</span>
                                <stat.icon className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <div className={`text-sm mt-1 ${stat.positive === true ? 'text-accent-green' :
                                stat.positive === false ? 'text-accent-red' : 'text-dark-400'
                                }`}>
                                {stat.change}
                            </div>
                        </motion.div>
                    ))}
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
