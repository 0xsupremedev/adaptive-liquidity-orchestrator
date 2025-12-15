import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    Zap,
    TrendingUp,
    Shield,
    BarChart3,
    Sparkles,
    Github,
    Twitter,
    CheckCircle2,
    Clock,
    Activity,
    Lock,
    PauseCircle,
    FileCode,
    Cpu
} from 'lucide-react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { cn } from '../lib/utils';
import { LineShadowText } from '../components/ui/line-shadow-text';
import { ShimmerButton } from '../components/ui/shimmer-button';
import { useState, useEffect } from 'react';

// Animation variants
const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
};



export default function Landing() {
    const { isConnected } = useAccount();

    // Live counter simulation
    const [rebalanceCount, setRebalanceCount] = useState(1248);
    useEffect(() => {
        const interval = setInterval(() => {
            setRebalanceCount(prev => prev + 1);
        }, 5000); // Increment every 5 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative min-h-screen bg-transparent overflow-hidden selection:bg-orange-500/20">

            {/* 2️⃣ Hero Section */}
            {/* 2️⃣ Hero Section */}
            <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden bg-transparent">
                <div className="relative z-10 text-center px-4 max-w-6xl mx-auto mt-[-50px]">
                    <div className="mb-12 flex justify-center">
                        <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2">
                            <Sparkles className="w-4 h-4 text-orange-500 mr-2" />
                            <span className="text-white text-sm font-medium">Built on opBNB • Hackathon 2025</span>
                        </div>
                    </div>

                    <h1 className="text-white text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-8 text-balance">
                        Adaptive Liquidity
                        <br />
                        <LineShadowText className="italic font-light" shadowColor="white">
                            Orchestrator
                        </LineShadowText>
                    </h1>

                    <p className="text-white/70 text-lg md:text-2xl mb-12 max-w-3xl mx-auto text-pretty leading-relaxed">
                        AI-Driven Liquidity Rebalancing on opBNB.
                        <br className="hidden sm:block" />
                        Protecting LPs from impermanent loss with automated strategies.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                        {isConnected ? (
                            <Link to="/dashboard">
                                <ShimmerButton className="bg-orange-500 hover:bg-orange-600 shadow-xl shadow-orange-500/20 text-lg py-3 px-8 rounded-2xl">
                                    Launch App <ArrowRight className="ml-2 w-5 h-5" />
                                </ShimmerButton>
                            </Link>
                        ) : (
                            <div className="[&_button]:!h-14 [&_button]:!px-8 [&_button]:!rounded-2xl [&_button]:!font-bold [&_button]:!bg-orange-500 [&_button]:!text-white hover:[&_button]:!bg-orange-600">
                                <ConnectButton label="Connect Wallet" />
                            </div>
                        )}
                        <a href="#how-it-works" className="text-white/70 hover:text-white transition-colors text-lg font-medium">
                            How It Works
                        </a>
                    </div>
                </div>
            </section>

            {/* 3️⃣ Problem Section */}
            <section id="problem" className="py-24 bg-card/50">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <motion.h2
                        {...fadeInUp}
                        className="text-3xl md:text-5xl font-bold mb-16"
                    >
                        Liquidity Providers Are <span className="text-destructive">Losing Money</span>
                    </motion.h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: TrendingUp,
                                title: "Impermanent Loss",
                                desc: "Static LP positions bleed value during volatile price swings as assets rebalance unfavorably.",
                                color: "text-red-500"
                            },
                            {
                                icon: Activity,
                                title: "High Slippage",
                                desc: "Thin liquidity causes traders to suffer poor execution, reducing volume and fees.",
                                color: "text-orange-500"
                            },
                            {
                                icon: Clock,
                                title: "Manual Management",
                                desc: "LPs must rebalance constantly to stay in range — impossible to do manually at scale.",
                                color: "text-yellow-500"
                            }
                        ].map((card, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-8 rounded-3xl bg-background border hover:border-primary/50 transition-colors"
                            >
                                <card.icon className={cn("w-12 h-12 mb-6 mx-auto", card.color)} />
                                <h3 className="text-xl font-bold mb-3">{card.title}</h3>
                                <p className="text-muted-foreground">{card.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4️⃣ Solution Section */}
            <section id="solution" className="py-24 px-4 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div {...fadeInUp}>
                            <h2 className="text-3xl md:text-5xl font-bold mb-6">
                                Meet <span className="text-primary">Adaptive Liquidity</span>
                            </h2>
                            <p className="text-xl text-muted-foreground mb-8">
                                The first AI-orchestrated liquidity manager built specifically for opBNB's high-performance environment.
                            </p>

                            <ul className="space-y-6">
                                {[
                                    { title: "AI-Driven Signals", desc: "Analyzes volume, volatility, and price impact in real-time." },
                                    { title: "Automatic Rebalancing", desc: "Moves liquidity across ranges & pools without manual intervention." },
                                    { title: "opBNB Execution", desc: "Leverages ultra-low gas costs for frequent, optimal rebalances." },
                                    { title: "Non-Custodial", desc: "You retain full ownership of your funds at all times." }
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-4">
                                        <div className="mt-1 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="w-4 h-4 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg">{item.title}</h4>
                                            <p className="text-muted-foreground">{item.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            {/* Diagram Simulation */}
                            <div className="aspect-square relative rounded-3xl bg-gradient-to-br from-card to-background border p-8 flex items-center justify-center">
                                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
                                <div className="relative z-10 grid gap-8 w-full max-w-sm">
                                    <div className="bg-background border p-4 rounded-xl text-center shadow-lg">
                                        <BarChart3 className="w-8 h-8 text-primary mx-auto mb-2" />
                                        <div className="font-mono text-xs text-muted-foreground">Market Data Source</div>
                                    </div>
                                    <div className="h-12 w-0.5 bg-gradient-to-b from-border to-primary mx-auto" />
                                    <div className="bg-primary/10 border border-primary p-6 rounded-2xl text-center backdrop-blur-sm relative">
                                        <Sparkles className="w-6 h-6 text-primary absolute -top-3 -right-3 animate-pulse" />
                                        <div className="font-bold text-primary mb-1">AI Engine</div>
                                        <div className="text-xs">Optimizing Strategy...</div>
                                    </div>
                                    <div className="h-12 w-0.5 bg-gradient-to-b from-primary to-border mx-auto" />
                                    <div className="flex justify-between gap-4">
                                        <div className="bg-background border p-4 rounded-xl text-center flex-1">
                                            <div className="font-bold text-green-500">+15%</div>
                                            <div className="text-xs text-muted-foreground">Fees</div>
                                        </div>
                                        <div className="bg-background border p-4 rounded-xl text-center flex-1">
                                            <div className="font-bold text-blue-500">-30%</div>
                                            <div className="text-xs text-muted-foreground">IL Risk</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 6️⃣ Live Metrics */}
            <section className="py-20 bg-primary/5 border-y border-primary/10">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { label: "Slippage Reduced", value: "20-30%", color: "text-blue-500" },
                            { label: "LP Fees Increased", value: "+15%", color: "text-green-500" },
                            { label: "Rebalances Executed", value: rebalanceCount.toLocaleString(), color: "text-primary" },
                            { label: "Avg Gas Cost", value: "< $0.01", color: "text-purple-500" }
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.5 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="text-center"
                            >
                                <div className={cn("text-4xl md:text-5xl font-black mb-2", stat.color)}>{stat.value}</div>
                                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5️⃣ How It Works */}
            <section id="how-it-works" className="py-24 px-4">
                <div className="max-w-7xl mx-auto">
                    <motion.div className="text-center mb-16" {...fadeInUp}>
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">How It Works</h2>
                        <p className="text-muted-foreground">Fully automated, from deposit to profit.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { step: "01", title: "Deposit", desc: "User deposits assets into a vault (BNB/USDT, ETH/USDC)." },
                            { step: "02", title: "Monitor", desc: "AI continuously tracks liquidity, volatility, and volume." },
                            { step: "03", title: "Decide", desc: "When inefficiencies appear, AI monitors generate a strategy." },
                            { step: "04", title: "Execute", desc: "Signed strategy triggers on-chain rebalance on opBNB." }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                className="relative pt-8 group"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.2 }}
                            >
                                <div className="absolute top-0 left-0 text-6xl font-black text-primary/10 group-hover:text-primary/20 transition-colors">
                                    {item.step}
                                </div>
                                <h3 className="text-xl font-bold mb-3 relative z-10">{item.title}</h3>
                                <p className="text-sm text-muted-foreground relative z-10">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 9️⃣ Vaults Section (Preview) */}
            <section id="vaults" className="py-24 bg-card/50 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">Active Vaults</h2>
                            <p className="text-muted-foreground">Select a strategy to start earning.</p>
                        </div>
                        <Link to="/dashboard" className="text-primary hover:underline font-medium">View All &rarr;</Link>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { pair: "BNB / USDT", apr: "18%", risk: "Medium", badge: "Hot" },
                            { pair: "ETH / USDC", apr: "14%", risk: "Low", badge: "Stable" },
                            { pair: "Cake / BNB", apr: "22%", risk: "High", badge: "New" }
                        ].map((vault, i) => (
                            <motion.div
                                key={i}
                                className="bg-background border rounded-2xl p-6 hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group"
                                whileHover={{ y: -5 }}
                            >
                                <div className="flex justify-between items-start mb-8">
                                    <div className="flex -space-x-2">
                                        <div className="w-10 h-10 rounded-full bg-gray-700 border-2 border-background" />
                                        <div className="w-10 h-10 rounded-full bg-gray-600 border-2 border-background" />
                                    </div>
                                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">{vault.badge}</span>
                                </div>
                                <h3 className="text-xl font-bold mb-1">{vault.pair}</h3>
                                <div className="flex justify-between items-end mt-4">
                                    <div>
                                        <div className="text-sm text-muted-foreground">Target APR</div>
                                        <div className="text-2xl font-bold text-green-500">{vault.apr}</div>
                                    </div>
                                    <button className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-sm font-medium transition-colors">
                                        Deposit
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 8️⃣ Security Section */}
            <section id="security" className="py-24 px-4 overflow-hidden relative">
                <div className="absolute inset-0 bg-primary/5 skew-y-3 transform origin-top-left -z-10" />
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Enterprise-Grade Security</h2>
                        <p className="text-muted-foreground">Trust is our foundation. Built for hackathon safety and production capability.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div className="p-6 bg-background rounded-2xl border shadow-sm">
                            <Shield className="w-10 h-10 text-primary mx-auto mb-4" />
                            <h3 className="text-lg font-bold mb-2">Non-Custodial</h3>
                            <p className="text-sm text-muted-foreground">Users always retain ownership. Funds are never locked by the strategy manager.</p>
                        </div>
                        <div className="p-6 bg-background rounded-2xl border shadow-sm">
                            <FileCode className="w-10 h-10 text-primary mx-auto mb-4" />
                            <h3 className="text-lg font-bold mb-2">Verified Contracts</h3>
                            <p className="text-sm text-muted-foreground">All smart contracts are open source and verified on opBNBScan.</p>
                        </div>
                        <div className="p-6 bg-background rounded-2xl border shadow-sm">
                            <PauseCircle className="w-10 h-10 text-primary mx-auto mb-4" />
                            <h3 className="text-lg font-bold mb-2">Emergency Pause</h3>
                            <p className="text-sm text-muted-foreground">Multisig-controlled emergency break to protect funds in extreme volatility.</p>
                        </div>
                    </div>
                </div>
            </section>


            {/* 🔟 Roadmap & Community */}
            <section id="roadmap" className="py-24 bg-card px-4 border-t">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16">
                    <div>
                        <h2 className="text-3xl font-bold mb-8">Roadmap</h2>
                        <div className="space-y-8 pl-8 border-l-2 border-primary/20">
                            {[
                                { q: "Q1 2025", title: "Hackathon MVP", items: ["opBNB Integration", "Basic AI Model", "PancakeSwap V3"] },
                                { q: "Q2 2025", title: "Expansion", items: ["Multi-DEX Support", "Advanced Heuristics", "Public Dashboard"], active: false },
                                { q: "Q3 2025", title: "Mainnet Launch", items: ["Governance Token", "Kickstart Program", "Security Audit"], active: false }
                            ].map((phase, i) => (
                                <div key={i} className="relative">
                                    <div className={cn("absolute -left-[39px] w-5 h-5 rounded-full border-4 border-card", i === 0 ? "bg-primary" : "bg-muted-foreground")} />
                                    <h3 className="text-xl font-bold flex items-center gap-3">
                                        {phase.q} <span className="text-sm font-normal text-muted-foreground">{phase.title}</span>
                                    </h3>
                                    <ul className="mt-2 space-y-1">
                                        {phase.items.map(item => (
                                            <li key={item} className="text-sm text-muted-foreground">• {item}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card p-8 rounded-3xl text-center flex flex-col items-center justify-center">
                        <Github className="w-16 h-16 text-primary mb-6" />
                        <h2 className="text-3xl font-bold mb-4">Fully Open Source</h2>
                        <p className="text-muted-foreground mb-8 max-w-md">
                            We believe in transparency. Adaptive Liquidity Orchestrator is built in public for the BNB Chain community.
                        </p>
                        <div className="flex gap-4">
                            <a href="https://github.com/adaptive-liquidity" className="btn-secondary px-6 py-2 rounded-full flex items-center gap-2 border hover:bg-muted font-bold">
                                <Github className="w-4 h-4" /> Star on GitHub
                            </a>
                            <a href="#" className="btn-secondary px-6 py-2 rounded-full flex items-center gap-2 border hover:bg-muted font-bold text-blue-400">
                                <Twitter className="w-4 h-4" /> Follow
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* 1️⃣2️⃣ Footer */}
            <footer className="py-12 border-t px-4 bg-background">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <Zap className="w-6 h-6 text-primary" />
                        <span className="font-bold text-lg">Adaptive Liquidity</span>
                    </div>

                    <div className="flex gap-8 text-sm text-muted-foreground font-medium">
                        <a href="#" className="hover:text-primary transition-colors">Docs</a>
                        <a href="#security" className="hover:text-primary transition-colors">Security</a>
                        <a href="#" className="hover:text-primary transition-colors">GitHub</a>
                        <a href="#roadmap" className="hover:text-primary transition-colors">Roadmap</a>
                    </div>

                    <div className="text-xs text-muted-foreground text-center md:text-right">
                        © 2025 Adaptive Liquidity Orchestrator.<br />
                        Built for BNB Chain.
                    </div>
                </div>
            </footer>
        </div>
    );
}

