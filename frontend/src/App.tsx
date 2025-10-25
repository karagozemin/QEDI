import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SuiClientProvider, WalletProvider, ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
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
import Profile from './pages/Profile';
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

// Custom Enoki login buttons using useConnectWallet
import { useConnectWallet, useWallets } from '@mysten/dapp-kit';
import { isEnokiWallet, type EnokiWallet, type AuthProvider } from '@mysten/enoki';

function EnokiLoginButtons({ onClose }: { onClose: () => void }) {
  const { mutate: connectWallet } = useConnectWallet();
  const wallets = useWallets().filter(isEnokiWallet);
  
  const walletsByProvider = wallets.reduce(
    (map, wallet) => map.set(wallet.provider, wallet),
    new Map<AuthProvider, EnokiWallet>(),
  );

  const googleWallet = walletsByProvider.get('google');
  const facebookWallet = walletsByProvider.get('facebook');
  const twitchWallet = walletsByProvider.get('twitch');

  const handleConnect = (wallet: EnokiWallet, providerName: string) => {
    try {
      connectWallet({ wallet });
      onClose();
    } catch (error) {
      console.error(`${providerName} login failed:`, error);
      alert(`${providerName} login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-xs text-gray-400 text-center mb-3">Sign in with zkLogin</div>
      
      <div className="space-y-2">
        {googleWallet && (
          <button
            onClick={() => handleConnect(googleWallet, 'Google')}
            className="w-full flex items-center gap-3 px-4 py-2.5 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors duration-300"
          >
            <span>🔍</span>
            <div className="flex-1 text-left">
              <div>Google</div>
              <div className="text-xs text-gray-300">Sign in with Google account</div>
            </div>
          </button>
        )}
        
        {facebookWallet && (
          <button
            onClick={() => handleConnect(facebookWallet, 'Facebook')}
            className="w-full flex items-center gap-3 px-4 py-2.5 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors duration-300"
          >
            <span>📘</span>
            <div className="flex-1 text-left">
              <div>Facebook</div>
              <div className="text-xs text-gray-300">Sign in with Facebook account</div>
            </div>
          </button>
        )}
        
        {twitchWallet && (
          <button
            onClick={() => handleConnect(twitchWallet, 'Twitch')}
            className="w-full flex items-center gap-3 px-4 py-2.5 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors duration-300"
          >
            <span>🎮</span>
            <div className="flex-1 text-left">
              <div>Twitch</div>
              <div className="text-xs text-gray-300">Sign in with Twitch account</div>
            </div>
          </button>
        )}
        
        {!googleWallet && !facebookWallet && !twitchWallet && (
          <div className="text-center py-4 text-gray-400">
            <p>No Enoki wallets available</p>
            <p className="text-xs">Check your API configuration</p>
          </div>
        )}
      </div>

      <button 
        onClick={onClose}
        className="w-full mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
      >
        Cancel
      </button>
    </div>
  );
}

function NavbarContent() {
  const currentAccount = useCurrentAccount();
  const [showZkLogin, setShowZkLogin] = useState(false);

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur-xl border-b border-gray-700/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-300">
            <img 
              src="/logo.png" 
              alt="QEDI Logo" 
              className="w-10 h-10 rounded-xl object-cover shadow-lg"
            />
            <span className="text-2xl font-bold text-white">QEDI</span>
          </a>

          {/* Navigation - Centered */}
                  <div className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
                    <a href="/" className="text-gray-300 hover:text-white font-medium transition-all duration-500 ease-out hover:scale-105 relative group">
                      Home
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 group-hover:w-full transition-all duration-500 ease-out"></span>
                    </a>
                    <a href="/create" className="text-gray-300 hover:text-white font-medium transition-all duration-500 ease-out hover:scale-105 relative group">
                      Create
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 group-hover:w-full transition-all duration-500 ease-out"></span>
                    </a>
                    <a href="/my-profiles" className="text-gray-300 hover:text-white font-medium transition-all duration-500 ease-out hover:scale-105 relative group">
                      My Profiles
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 group-hover:w-full transition-all duration-500 ease-out"></span>
                    </a>
                  </div>

              {/* Right Section */}
              <div className="flex items-center gap-4">
                {currentAccount ? (
                  <ConnectButton />
                ) : (
                  <>
                    <div className="relative">
                      <button 
                        onClick={() => setShowZkLogin(!showZkLogin)}
                        className="hidden sm:block px-4 py-2 text-gray-300 hover:text-white font-medium transition-all duration-500 ease-out"
                      >
                        Sign In
                      </button>
                      
                      {/* zkLogin Dropdown */}
                      {showZkLogin && (
                        <div className="absolute right-0 top-full mt-2 w-64 bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-600/30 p-4 z-50">
                          <h3 className="text-white font-semibold mb-3">Sign in with</h3>
                          <EnokiLoginButtons onClose={() => setShowZkLogin(false)} />
                        </div>
                      )}
                    </div>
                    <ConnectButton />
                  </>
                )}
              </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          <BrowserRouter>
            <div className="min-h-screen bg-gray-900">
              <NavbarContent />
              
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/create" element={<Create />} />
                    <Route path="/my-profiles" element={<MyProfiles />} />
                    <Route path="/edit-profile" element={<EditProfile />} />
                    <Route path="/profile/:username" element={<Profile />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="/login/callback" element={<AuthCallback />} />
                  </Routes>
            </div>
          </BrowserRouter>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

export default App;