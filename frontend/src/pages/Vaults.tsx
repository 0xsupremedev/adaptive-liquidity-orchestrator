import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Search,
    Filter,
    ArrowUpRight,
    Wallet,
    TrendingUp,
    Shield,
    Zap,
    Plus
} from 'lucide-react';
import { LineShadowText } from '../components/ui/line-shadow-text';
import { ShimmerButton } from '../components/ui/shimmer-button';
import { useAccount } from 'wagmi';

// Mock data (replace with API call later)
const MOCK_VAULTS = [
    {
        id: 1,
        pair: 'WBNB/USDT',
        tvl: 6234,
        apr: 24.5,
        lastRebalance: Date.now() - 3600000,
        strategy: 'moderate',
        risk: 'Medium',
        status: 'active'
    },
    {
        id: 2,
        pair: 'WBNB/ETH',
        tvl: 12500,
        apr: 18.2,
        lastRebalance: Date.now() - 86400000,
        strategy: 'conservative',
        risk: 'Low',
        status: 'active'
    },
    {
        id: 3,
        pair: 'CAKE/WBNB',
        tvl: 3400,
        apr: 45.8,
        lastRebalance: Date.now() - 172800000,
        strategy: 'aggressive',
        risk: 'High',
        status: 'active'
    }
];

export default function Vaults() {
    const { isConnected } = useAccount();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStrategy, setFilterStrategy] = useState('all');
    const [filteredVaults, setFilteredVaults] = useState(MOCK_VAULTS);

    useEffect(() => {
        let result = MOCK_VAULTS;

        if (searchTerm) {
            result = result.filter(v => v.pair.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        if (filterStrategy !== 'all') {
            result = result.filter(v => v.strategy === filterStrategy);
        }

        setFilteredVaults(result);
    }, [searchTerm, filterStrategy]);

    return (
        <div className="min-h-screen px-4 py-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">
                            <LineShadowText className="text-foreground" shadowColor="white">
                                All Vaults
                            </LineShadowText>
                        </h1>
                        <p className="text-muted-foreground">
                            Explore and manage AI-optimized liquidity positions
                        </p>
                    </div>
                    <Link to="/vaults/create">
                        <ShimmerButton className="bg-orange-500 hover:bg-orange-600 shadow-lg px-6 py-2">
                            <Plus className="w-5 h-5 mr-2" />
                            Create New Vault
                        </ShimmerButton>
                    </Link>
                </div>

                {/* Filters */}
                <div className="card mb-8 p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search by token pair (e.g. WBNB)..."
                                className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-muted-foreground" />
                            <select
                                className="bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                value={filterStrategy}
                                onChange={(e) => setFilterStrategy(e.target.value)}
                            >
                                <option value="all">All Strategies</option>
                                <option value="conservative">Conservative</option>
                                <option value="moderate">Moderate</option>
                                <option value="aggressive">Aggressive</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Vaults List */}
                <div className="space-y-4">
                    {filteredVaults.map((vault) => (
                        <motion.div
                            key={vault.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="card group hover:border-primary/50 transition-all cursor-pointer"
                        >
                            <Link to={`/vaults/${vault.id}`} className="block">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                    {/* Pair Info */}
                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <Wallet className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-lg">{vault.pair}</div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <span className={`px-2 py-0.5 rounded text-xs border ${vault.strategy === 'aggressive' ? 'border-red-500/30 text-red-500' :
                                                        vault.strategy === 'conservative' ? 'border-blue-500/30 text-blue-500' :
                                                            'border-orange-500/30 text-orange-500'
                                                    }`}>
                                                    {vault.strategy.toUpperCase()}
                                                </span>
                                                <span>•</span>
                                                <span>Vault #{vault.id}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full md:w-auto flex-1 md:justify-end">
                                        <div>
                                            <div className="text-sm text-muted-foreground mb-1">TVL</div>
                                            <div className="font-bold font-mono">${vault.tvl.toLocaleString()}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-muted-foreground mb-1">APR</div>
                                            <div className="font-bold font-mono text-accent-green">+{vault.apr}%</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-muted-foreground mb-1">Risk Level</div>
                                            <div className="flex items-center gap-1 font-medium">
                                                <Shield className="w-3 h-3" />
                                                {vault.risk}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-muted-foreground mb-1">Last Rebalance</div>
                                            <div className="font-medium text-xs text-muted-foreground">
                                                {new Date(vault.lastRebalance).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action */}
                                    <div className="w-full md:w-auto flex justify-end">
                                        <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary group-hover:text-white transition-colors">
                                            <ArrowUpRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}

                    {filteredVaults.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            No vaults found matching your filters.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
