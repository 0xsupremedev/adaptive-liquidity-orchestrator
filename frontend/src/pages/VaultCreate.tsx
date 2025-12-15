import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    ArrowRight,
    Zap,
    Shield,
    TrendingUp,
    Check
} from 'lucide-react';
import { ShimmerButton } from '../components/ui/shimmer-button';
import { LineShadowText } from '../components/ui/line-shadow-text';
import { useAccount } from 'wagmi';

const tokens = [
    { address: '0x4200000000000000000000000000000000000006', symbol: 'WBNB', name: 'Wrapped BNB', icon: '🔶' },
    { address: '0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3', symbol: 'USDT', name: 'Tether USD', icon: '💵' },
    { address: '0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f4', symbol: 'USDC', name: 'USD Coin', icon: '💰' },
    { address: '0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f5', symbol: 'ETH', name: 'Ethereum', icon: '💎' },
];

const strategies = [
    {
        id: 'conservative',
        name: 'Conservative',
        icon: Shield,
        description: 'Wide range, fewer rebalances. Best for volatile pairs.',
        features: ['Lower gas costs', 'Stable returns', 'Max IL protection'],
        color: 'blue',
        volatilityThreshold: 8,
        rebalanceFreq: 'Weekly',
    },
    {
        id: 'moderate',
        name: 'Moderate',
        icon: Zap,
        description: 'Balanced approach with dynamic adjustments.',
        features: ['Balanced fees', 'Auto-ranging', 'Adaptive rebalance'],
        color: 'primary',
        volatilityThreshold: 5,
        rebalanceFreq: 'Daily',
    },
    {
        id: 'aggressive',
        name: 'Aggressive',
        icon: TrendingUp,
        description: 'Tight range, frequent rebalances. Maximum fee capture.',
        features: ['Highest APR', 'Active management', 'Best for stable pairs'],
        color: 'green',
        volatilityThreshold: 3,
        rebalanceFreq: 'Hourly',
    },
];

export default function VaultCreate() {
    const navigate = useNavigate();
    const { isConnected } = useAccount();
    const [step, setStep] = useState(1);
    const [tokenA, setTokenA] = useState('');
    const [tokenB, setTokenB] = useState('');
    const [strategy, setStrategy] = useState('moderate');

    const handleCreate = () => {
        // In production, this would trigger the on-chain transaction
        console.log('Creating vault:', { tokenA, tokenB, strategy });

        // Navigate to dashboard after "creation"
        navigate('/dashboard');
    };

    const getTokenByAddress = (addr: string) => tokens.find(t => t.address === addr);

    return (
        <div className="min-h-screen px-4 py-8">
            <div className="max-w-3xl mx-auto">
                {/* Back button */}
                <button
                    onClick={() => step > 1 ? setStep(step - 1) : navigate('/dashboard')}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {step > 1 ? 'Back' : 'Dashboard'}
                </button>

                {/* Progress indicator */}
                <div className="flex items-center justify-between mb-8">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${s < step ? 'bg-primary text-primary-foreground' :
                                s === step ? 'bg-primary/20 text-primary border-2 border-primary' :
                                    'bg-muted text-muted-foreground'
                                }`}>
                                {s < step ? <Check className="w-5 h-5" /> : s}
                            </div>
                            {s < 3 && (
                                <div className={`flex-1 h-0.5 mx-2 transition-colors ${s < step ? 'bg-primary' : 'bg-muted'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step content */}
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Step 1: Select Token Pair */}
                    {step === 1 && (
                        <div className="card">
                            <h2 className="text-2xl font-bold mb-2">
                                <LineShadowText className="text-foreground" shadowColor="white">
                                    Select Token Pair
                                </LineShadowText>
                            </h2>
                            <p className="text-muted-foreground mb-8">Choose the tokens for your liquidity vault</p>

                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-2">Token A</label>
                                    <div className="space-y-2">
                                        {tokens.map((token) => (
                                            <button
                                                key={token.address}
                                                onClick={() => setTokenA(token.address)}
                                                disabled={token.address === tokenB}
                                                className={`w-full p-4 rounded-xl flex items-center gap-3 transition-all ${tokenA === token.address
                                                    ? 'bg-primary/10 border-2 border-primary'
                                                    : token.address === tokenB
                                                        ? 'bg-muted/50 border border-border opacity-50 cursor-not-allowed'
                                                        : 'bg-muted/30 border border-border hover:border-primary/50'
                                                    }`}
                                            >
                                                <span className="text-2xl">{token.icon}</span>
                                                <div className="text-left">
                                                    <div className="font-semibold text-foreground">{token.symbol}</div>
                                                    <div className="text-sm text-muted-foreground">{token.name}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-2">Token B</label>
                                    <div className="space-y-2">
                                        {tokens.map((token) => (
                                            <button
                                                key={token.address}
                                                onClick={() => setTokenB(token.address)}
                                                disabled={token.address === tokenA}
                                                className={`w-full p-4 rounded-xl flex items-center gap-3 transition-all ${tokenB === token.address
                                                    ? 'bg-primary/10 border-2 border-primary'
                                                    : token.address === tokenA
                                                        ? 'bg-muted/50 border border-border opacity-50 cursor-not-allowed'
                                                        : 'bg-muted/30 border border-border hover:border-primary/50'
                                                    }`}
                                            >
                                                <span className="text-2xl">{token.icon}</span>
                                                <div className="text-left">
                                                    <div className="font-semibold text-foreground">{token.symbol}</div>
                                                    <div className="text-sm text-muted-foreground">{token.name}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                disabled={!tokenA || !tokenB}
                                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Continue
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {/* Step 2: Select Strategy */}
                    {step === 2 && (
                        <div className="card">
                            <h2 className="text-2xl font-bold mb-2">
                                <LineShadowText className="text-foreground" shadowColor="white">
                                    Select Strategy
                                </LineShadowText>
                            </h2>
                            <p className="text-muted-foreground mb-8">Choose how the AI should manage your liquidity</p>

                            <div className="space-y-4 mb-8">
                                {strategies.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => setStrategy(s.id)}
                                        className={`w-full p-6 rounded-xl text-left transition-all ${strategy === s.id
                                            ? 'bg-primary/10 border-2 border-primary'
                                            : 'bg-muted/30 border border-border hover:border-primary/50'
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 rounded-xl ${s.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                                                s.color === 'green' ? 'bg-green-500/20 text-green-400' :
                                                    'bg-primary/20 text-primary'
                                                }`}>
                                                <s.icon className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h3 className="text-lg font-semibold text-foreground">{s.name}</h3>
                                                    <span className="text-sm text-muted-foreground">Rebalance: {s.rebalanceFreq}</span>
                                                </div>
                                                <p className="text-muted-foreground text-sm mb-3">{s.description}</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {s.features.map((f) => (
                                                        <span
                                                            key={f}
                                                            className="px-2 py-1 text-xs rounded-lg bg-muted text-muted-foreground"
                                                        >
                                                            {f}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setStep(3)}
                                className="btn-primary w-full flex items-center justify-center gap-2"
                            >
                                Continue
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {/* Step 3: Review & Create */}
                    {step === 3 && (
                        <div className="card">
                            <h2 className="text-2xl font-bold mb-2">
                                <LineShadowText className="text-foreground" shadowColor="white">
                                    Review & Create
                                </LineShadowText>
                            </h2>
                            <p className="text-muted-foreground mb-8">Confirm your vault configuration</p>

                            <div className="space-y-6 mb-8">
                                {/* Token Pair */}
                                <div className="p-4 rounded-xl bg-muted/30 border border-border">
                                    <div className="text-sm text-muted-foreground mb-2">Token Pair</div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{getTokenByAddress(tokenA)?.icon}</span>
                                        <span className="font-semibold text-foreground">{getTokenByAddress(tokenA)?.symbol}</span>
                                        <span className="text-muted-foreground">/</span>
                                        <span className="text-2xl">{getTokenByAddress(tokenB)?.icon}</span>
                                        <span className="font-semibold text-foreground">{getTokenByAddress(tokenB)?.symbol}</span>
                                    </div>
                                </div>

                                {/* Strategy */}
                                <div className="p-4 rounded-xl bg-muted/30 border border-border">
                                    <div className="text-sm text-muted-foreground mb-2">Strategy</div>
                                    <div className="font-semibold text-foreground">
                                        {strategies.find(s => s.id === strategy)?.name}
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-1">
                                        {strategies.find(s => s.id === strategy)?.description}
                                    </div>
                                </div>

                                {/* Parameters */}
                                <div className="p-4 rounded-xl bg-muted/30 border border-border">
                                    <div className="text-sm text-muted-foreground mb-3">Parameters</div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-muted-foreground text-sm">Volatility Threshold</div>
                                            <div className="font-semibold text-foreground">
                                                {strategies.find(s => s.id === strategy)?.volatilityThreshold}%
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-muted-foreground text-sm">Rebalance Frequency</div>
                                            <div className="font-semibold text-foreground">
                                                {strategies.find(s => s.id === strategy)?.rebalanceFreq}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-muted-foreground text-sm">Protocol Fee</div>
                                            <div className="font-semibold text-foreground">0.5%</div>
                                        </div>
                                        <div>
                                            <div className="text-muted-foreground text-sm">Network</div>
                                            <div className="font-semibold text-foreground">opBNB</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Warning */}
                                <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
                                    <div className="flex items-start gap-3">
                                        <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                        <div className="text-sm text-muted-foreground">
                                            <strong className="text-primary">Note:</strong> After creating the vault,
                                            you'll need to deposit tokens to start earning. The AI will automatically
                                            manage your position based on market conditions.
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <ShimmerButton
                                onClick={handleCreate}
                                disabled={!isConnected}
                                className="w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-orange-500 hover:bg-orange-600 shadow-xl py-3"
                            >
                                {isConnected ? (
                                    <>
                                        Create Vault
                                        <Zap className="w-5 h-5" />
                                    </>
                                ) : (
                                    'Connect Wallet to Create'
                                )}
                            </ShimmerButton>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
