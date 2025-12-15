import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { ThirdwebProvider } from "thirdweb/react";
import '@rainbow-me/rainbowkit/styles.css';
import { config } from './config/wagmi';
import App from './App';
import './index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <ThirdwebProvider>
                    <RainbowKitProvider
                        theme={darkTheme({
                            accentColor: '#F97316', // Updated to Orange
                            accentColorForeground: '#1e1f25',
                            borderRadius: 'large',
                            fontStack: 'system',
                        })}
                    >
                        <BrowserRouter>
                            <App />
                        </BrowserRouter>
                    </RainbowKitProvider>
                </ThirdwebProvider>
            </QueryClientProvider>
        </WagmiProvider>
    </React.StrictMode>
);
