import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SuiClientProvider, WalletProvider, ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { networkConfig } from './config/networks';
import '@mysten/dapp-kit/dist/index.css';

// Import pages
import Home from './pages/Home';
import Create from './pages/Create';
import MyProfiles from './pages/MyProfiles';
import EditProfile from './pages/EditProfile';
import Profile from './pages/Profile';
import AuthCallback from './pages/AuthCallback';

const queryClient = new QueryClient();

// zkLogin buttons with Passkey support
function ZkLoginButtons({ onClose }: { onClose: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleLogin = async (provider: string) => {
    setIsLoading(true);
    setLoadingProvider(provider);
    
    try {
      if (provider === 'passkey') {
        // Handle Passkey authentication directly
        const { authenticateWithPasskey } = await import('./lib/enoki');
        const result = await authenticateWithPasskey();
        console.log('Passkey authentication successful:', result);
        
        // Store session
        const session = {
          address: result.address,
          authMethod: 'passkey',
          zkProof: result.zkProof,
          userInfo: result.userInfo,
        };
        localStorage.setItem('qedi_session', JSON.stringify(session));
        
        // Close dropdown and refresh
        onClose();
        window.location.reload();
      } else {
        // Handle OAuth providers
        const { getAuthUrl } = await import('./lib/enoki');
        const authUrl = await getAuthUrl(provider as any);
        
        // Store provider for callback
        localStorage.setItem('qedi_auth_provider', provider);
        
        // Redirect to OAuth
        window.location.href = authUrl as string;
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  // Device info function removed since Passkey is temporarily disabled

  return (
    <div className="space-y-3">
      {/* Passkey Button - Temporarily disabled */}
      <div className="w-full flex items-center gap-3 px-4 py-3 bg-gray-600 text-gray-400 font-medium rounded-xl opacity-50 cursor-not-allowed">
        <span className="text-lg">🔐</span>
        <div className="flex-1 text-left">
          <div className="font-semibold">Passkey Authentication</div>
          <div className="text-xs text-gray-500">Coming soon - API integration in progress</div>
        </div>
      </div>

      {/* OAuth Providers */}
      <div className="border-t border-gray-600 pt-3">
        <div className="text-xs text-gray-400 text-center mb-3">Continue with</div>
        
        <div className="space-y-2">
          <button
            onClick={() => handleLogin('google')}
            disabled={isLoading}
            className="w-full flex items-center gap-3 px-4 py-2.5 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingProvider === 'google' ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>🔍</span>
            )}
            <div className="flex-1 text-left">
              <div>Google</div>
              <div className="text-xs text-gray-300">Sign in with Google account</div>
            </div>
          </button>
          
          <div className="w-full flex items-center gap-3 px-4 py-2.5 bg-gray-600 text-gray-400 font-medium rounded-lg opacity-50 cursor-not-allowed">
            <span>📘</span>
            <div className="flex-1 text-left">
              <div>Facebook OAuth</div>
              <div className="text-xs text-gray-500">Setup required</div>
            </div>
          </div>
          
          <div className="w-full flex items-center gap-3 px-4 py-2.5 bg-gray-600 text-gray-400 font-medium rounded-lg opacity-50 cursor-not-allowed">
            <span>🎮</span>
            <div className="flex-1 text-left">
              <div>Twitch OAuth</div>
              <div className="text-xs text-gray-500">Setup required</div>
            </div>
          </div>
        </div>
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
  const [zkLoginSession, setZkLoginSession] = useState<any>(null);

  // Check for zkLogin session on mount
  useEffect(() => {
    const checkSession = () => {
      try {
        const storedSession = localStorage.getItem('qedi_session');
        if (storedSession) {
          const session = JSON.parse(storedSession);
          setZkLoginSession(session);
          console.log('zkLogin session found:', session);
        }
      } catch (error) {
        console.error('Error checking zkLogin session:', error);
      }
    };

    checkSession();
    
    // Listen for storage changes (when session is updated)
    window.addEventListener('storage', checkSession);
    return () => window.removeEventListener('storage', checkSession);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('qedi_session');
    setZkLoginSession(null);
    console.log('zkLogin session cleared');
  };

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
            {currentAccount || zkLoginSession ? (
              <div className="flex items-center gap-3">
                <span className="hidden sm:block text-gray-300 text-sm">
                  {currentAccount 
                    ? `${currentAccount.address.slice(0, 6)}...${currentAccount.address.slice(-4)}`
                    : zkLoginSession 
                    ? `zkLogin: ${zkLoginSession.address.slice(0, 6)}...${zkLoginSession.address.slice(-4)}`
                    : ''
                  }
                </span>
                {zkLoginSession && (
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Logout
                  </button>
                )}
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