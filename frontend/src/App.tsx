import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import pages
import Home from './pages/Home';
import Explore from './pages/Explore';
import Create from './pages/Create';
import AuthCallback from './pages/AuthCallback';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-900">
          {/* Professional Navbar */}
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
                  <button className="hidden sm:block px-4 py-2 text-gray-300 hover:text-white font-medium transition-all duration-500 ease-out">
                    Sign In
                  </button>
                  <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-blue-500/25 transform hover:-translate-y-1 transition-all duration-500 ease-out hover:scale-105">
                    Connect Wallet
                  </button>
                </div>
              </div>
            </div>
          </nav>

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/create" element={<Create />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;