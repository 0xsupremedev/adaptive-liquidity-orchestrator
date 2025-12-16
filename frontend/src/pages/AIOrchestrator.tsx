import { motion } from 'framer-motion';
import {
    Brain,
    Activity,
    GitBranch,
    History,
    CheckCircle2,
    AlertTriangle,
    Play,
    LineChart
} from 'lucide-react';
import { LineShadowText } from '../components/ui/line-shadow-text';
import { ShimmerButton } from '../components/ui/shimmer-button';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Mock Data
const LIVE_SIGNALS = [
    {
        id: 1,
        vaultId: 1,
        pair: 'WBNB/USDT',
        type: 'Rebalance',
        action: 'Close & Re-open',
        confidence: 94,
        reason: 'Volatility Spike > 5%',
        timestamp: Date.now() - 300000 // 5 mins ago
    },
    {
        id: 2,
        vaultId: 3,
        pair: 'CAKE/WBNB',
        type: 'Hold',
        action: 'Maintain Range',
        confidence: 88,
        reason: 'Price within optimal zone',
        timestamp: Date.now() - 900000 // 15 mins ago
    }
];

const BACKTEST_DATA = [
    { name: 'Jan', static: 100, ai: 100 },
    { name: 'Feb', static: 98, ai: 105 },
    { name: 'Mar', static: 95, ai: 112 },
    { name: 'Apr', static: 92, ai: 118 },
    { name: 'May', static: 88, ai: 124 },
    { name: 'Jun', static: 85, ai: 132 },
];

const STRATEGIES = [
    {
        id: 'conservative',
        name: 'Conservative Guard',
        description: 'Minimizes IL by wide ranges and slow rebalancing.',
        risk: 'Low',
        active: true
    },
    {
        id: 'moderate',
        name: 'Balanced Flow',
        description: 'Standard market making strategy for reduced volatility pairs.',
        risk: 'Medium',
        active: false
    },
    {
        id: 'aggressive',
        name: 'Yield Hunter',
        description: 'Tight ranges to maximize swap fees. High rebalance frequency.',
        risk: 'High',
        active: false
    }
];

export default function AIOrchestrator() {
    return (
        <div className="min-h-screen px-4 py-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
                        <Brain className="w-10 h-10 text-primary" />
                        <LineShadowText className="text-foreground" shadowColor="white">
                            AI Orchestrator
                        </LineShadowText>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl">
                        Monitor the real-time decision engine driving your liquidity positions.
                        View probability scores, execute rebalances, and manage strategy profiles.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column: Metrics & Strategies */}
                    <div className="space-y-8">
                        {/* Live Signals */}
                        <div className="card">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-accent-green" />
                                    Live Signals
                                </h2>
                                <span className="flex h-2 w-2 rounded-full bg-accent-green animate-pulse" />
                            </div>
                            <div className="space-y-4">
                                {LIVE_SIGNALS.map((signal) => (
                                    <div key={signal.id} className="p-4 rounded-xl bg-background/50 border border-border">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-sm">{signal.pair}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded ${signal.type === 'Rebalance' ? 'bg-orange-500/20 text-orange-500' : 'bg-blue-500/20 text-blue-500'}`}>
                                                {signal.type}
                                            </span>
                                        </div>
                                        <div className="text-sm font-medium mb-1">{signal.action}</div>
                                        <div className="text-xs text-muted-foreground mb-3">{signal.reason}</div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-accent-green">Confidence: {signal.confidence}%</span>
                                            <span className="text-muted-foreground">5 min ago</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Strategies */}
                        <div className="card">
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                                <GitBranch className="w-5 h-5 text-primary" />
                                Active Strategies
                            </h2>
                            <div className="space-y-4">
                                {STRATEGIES.map((strategy) => (
                                    <div key={strategy.id} className={`p-4 rounded-xl border transition-all ${strategy.active ? 'bg-primary/5 border-primary' : 'bg-background/50 border-border opacity-70 hover:opacity-100'}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-bold">{strategy.name}</h3>
                                            {strategy.active && <CheckCircle2 className="w-4 h-4 text-primary" />}
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-3">{strategy.description}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                                                Risk: {strategy.risk}
                                            </span>
                                            {!strategy.active && (
                                                <button className="text-xs text-primary hover:underline">Activate</button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Visualization */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Backtest Chart */}
                        <div className="card h-[400px] flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <History className="w-5 h-5 text-primary" />
                                    <h2 className="text-xl font-bold">Performance Backtest</h2>
                                </div>
                                <div className="flex gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-primary" />
                                        <span>AI Orchestrator</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                                        <span>Static LP</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 w-full min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={BACKTEST_DATA}>
                                        <defs>
                                            <linearGradient id="colorAi" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" stroke="#5a606d" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#5a606d" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1e1f25',
                                                border: '1px solid #3f434c',
                                                borderRadius: '12px',
                                                color: '#fff',
                                            }}
                                        />
                                        <Area type="monotone" dataKey="ai" stroke="#F97316" strokeWidth={3} fillOpacity={1} fill="url(#colorAi)" />
                                        <Area type="monotone" dataKey="static" stroke="#5a606d" strokeWidth={2} fillOpacity={0} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Execution Log */}
                        <div className="card">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <LineChart className="w-5 h-5 text-primary" />
                                    Execution Log
                                </h2>
                                <ShimmerButton className="bg-secondary hover:bg-secondary/80 text-background px-4 py-1.5 text-xs">
                                    Export CSV
                                </ShimmerButton>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-muted-foreground border-b border-border">
                                        <tr>
                                            <th className="pb-3 pl-2">Time</th>
                                            <th className="pb-3">Action</th>
                                            <th className="pb-3">Vault</th>
                                            <th className="pb-3">Profit/Loss</th>
                                            <th className="pb-3 text-right pr-2">Tx Hash</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {[1, 2, 3].map((i) => (
                                            <tr key={i} className="hover:bg-muted/10 transition-colors">
                                                <td className="py-3 pl-2 text-muted-foreground">2 hours ago</td>
                                                <td className="py-3 font-medium text-accent-green">Rebalance</td>
                                                <td className="py-3">WBNB-USDT #4</td>
                                                <td className="py-3 text-accent-green">+$12.50</td>
                                                <td className="py-3 text-right pr-2 font-mono text-xs text-primary">0x3a...8f21</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
