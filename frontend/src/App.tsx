import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SuiClientProvider, WalletProvider, ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { networkConfig } from './config/networks';
import '@mysten/dapp-kit/dist/index.css';

// Import pages
import Home from './pages/Home';
import Explore from './pages/Explore';
import Create from './pages/Create';
import AuthCallback from './pages/AuthCallback';

const queryClient = new QueryClient();

// Temporarily disable zkLogin buttons to fix the white screen
function ZkLoginButtons({ onClose }: { onClose: () => void }) {
  return (
    <div className="space-y-2">
      <div className="p-4 text-center text-gray-300">
        <p>zkLogin integration in progress...</p>
        <button 
          onClick={onClose}
          className="mt-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Close
        </button>
      </div>
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
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white">QEDI</span>
          </div>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-8 ml-12">
            <a href="/" className="text-gray-300 hover:text-white font-medium transition-all duration-500 ease-out hover:scale-105 relative group">
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 group-hover:w-full transition-all duration-500 ease-out"></span>
            </a>
            <a href="/explore" className="text-gray-300 hover:text-white font-medium transition-all duration-500 ease-out hover:scale-105 relative group">
              Explore
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 group-hover:w-full transition-all duration-500 ease-out"></span>
            </a>
            <a href="/create" className="text-gray-300 hover:text-white font-medium transition-all duration-500 ease-out hover:scale-105 relative group">
              Create
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 group-hover:w-full transition-all duration-500 ease-out"></span>
            </a>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {currentAccount ? (
              <div className="flex items-center gap-3">
                <span className="hidden sm:block text-gray-300 text-sm">
                  {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}
                </span>
                <ConnectButton />
              </div>
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
                      <ZkLoginButtons onClose={() => setShowZkLogin(false)} />
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
                <Route path="/explore" element={<Explore />} />
                <Route path="/create" element={<Create />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
              </Routes>
            </div>
          </BrowserRouter>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

export default App;