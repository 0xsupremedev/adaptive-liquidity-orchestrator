import { Link } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { createThirdwebClient } from "thirdweb";
import { ConnectButton as ThirdwebConnectButton } from "thirdweb/react";
import { inAppWallet, createWallet } from "thirdweb/wallets";

import { Zap, TrendingUp, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';

const client = createThirdwebClient({
    clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID || "....",
});

const wallets = [
    inAppWallet({
        auth: {
            options: [
                "google",
                "discord",
                "telegram",
                "farcaster",
                "email",
                "x",
                "passkey",
                "phone",
            ],
        },
    }),
    createWallet("io.metamask"),
    createWallet("com.coinbase.wallet"),
    createWallet("me.rainbow"),
    createWallet("io.rabby"),
    createWallet("io.zerion.wallet"),
];

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleTheme = () => {
        setIsDark(!isDark);
        document.documentElement.classList.toggle('dark');
    };

    const navLinks = [
        { label: 'Product', href: '#product' },
        { label: 'How It Works', href: '#how-it-works' },
        { label: 'Vaults', href: '/dashboard' },
        { label: 'Security', href: '#security' },
        { label: 'Docs', href: '#' },
        { label: 'Roadmap', href: '#roadmap' },
    ];

    return (
        <nav className={cn(
            "sticky top-0 z-50 transition-all duration-300 border-b border-transparent",
            scrolled ? "bg-background/80 backdrop-blur-md border-border" : "bg-transparent"
        )}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="relative flex items-center justify-center w-10 h-10 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                            <Zap className="w-5 h-5 text-primary absolute" />
                            <TrendingUp className="w-3 h-3 text-primary absolute top-2 right-2 opacity-50" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-lg leading-none tracking-tight">
                                Adaptive<span className="text-primary">Liquidity</span>
                            </span>
                            <span className="text-[10px] text-muted-foreground font-medium">AI Orchestrator</span>
                        </div>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden lg:flex items-center gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.label}
                                to={link.href.startsWith('/') ? link.href : `/${link.href}`}
                                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-muted transition-colors"
                        >
                            {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        </button>

                        <div className="hidden sm:block mr-2">
                            <ThirdwebConnectButton
                                client={client}
                                connectModal={{ size: "compact" }}
                                wallets={wallets}
                                connectButton={{ label: "Login" }}
                            />
                        </div>
                        <div className="hidden sm:block">
                            <ConnectButton
                                chainStatus="icon"
                                showBalance={false}
                                accountStatus="avatar"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
