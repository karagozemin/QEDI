import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { networkConfig } from './config/networks';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AuthCallback from './pages/AuthCallback';
import Create from './pages/Create';
import Explore from './pages/Explore';

import '@mysten/dapp-kit/dist/index.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider>
          <AuthProvider>
            <BrowserRouter>
              <div className="min-h-screen bg-gray-50">
                <Navbar />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/create" element={<Create />} />
                  <Route path="/explore" element={<Explore />} />
                </Routes>
              </div>
            </BrowserRouter>
          </AuthProvider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

export default App;
