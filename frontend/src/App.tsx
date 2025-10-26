import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { registerEnokiWallets } from '@mysten/enoki';
import { SuiClient } from '@mysten/sui/client';
import { networkConfig } from './config/networks';
import { ENOKI_API_KEY } from './lib/constants';
import '@mysten/dapp-kit/dist/index.css';

// Import pages
import Home from './pages/Home';
import Create from './pages/Create';
import MyProfiles from './pages/MyProfiles';
import EditProfile from './pages/EditProfile';
import AuthCallback from './pages/AuthCallback';

const queryClient = new QueryClient();

// Initialize Sui client for Enoki
const suiClient = new SuiClient({
  url: 'https://fullnode.testnet.sui.io:443'
});

// Register Enoki wallets
registerEnokiWallets({
  apiKey: ENOKI_API_KEY,
  client: suiClient,
  network: 'testnet',
  providers: {
    google: {
      clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '704942782239-4hvbm0ff4s4rfc8455ikacse6k45rrj9.apps.googleusercontent.com',
    },
    // facebook: {
    //   clientId: import.meta.env.VITE_FACEBOOK_CLIENT_ID || '',
    // },
    // twitch: {
    //   clientId: import.meta.env.VITE_TWITCH_CLIENT_ID || '',
    // },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          <BrowserRouter>
            <Routes>
              {/* Profile route without navbar - clean view */}
              
              {/* All other routes with navbar */}
              <Route path="*" element={
                <div className="min-h-screen bg-gray-900">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/create" element={<Create />} />
                    <Route path="/my-profiles" element={<MyProfiles />} />
                    <Route path="/edit-profile" element={<EditProfile />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="/login/callback" element={<AuthCallback />} />
                    <Route path="/:username" element={<Home />} />

                  </Routes>
                </div>
              } />
            </Routes>
          </BrowserRouter>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

export default App;