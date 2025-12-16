import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import VaultCreate from './pages/VaultCreate';
import VaultDetail from './pages/VaultDetail';
import Vaults from './pages/Vaults';
import AIOrchestrator from './pages/AIOrchestrator';

import { HeroBackground } from './components/HeroBackground';

function App() {
    return (
        <div className="relative min-h-screen bg-black text-foreground antialiased selection:bg-orange-500/20 font-sans">
            <HeroBackground />
            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow">
                    <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/vaults/create" element={<VaultCreate />} />
                        <Route path="/vaults/:vaultId" element={<VaultDetail />} />
                        <Route path="/vaults" element={<Vaults />} />
                        <Route path="/ai" element={<AIOrchestrator />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
}

export default App;
