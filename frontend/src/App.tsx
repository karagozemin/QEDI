import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import ThemeToggle from './components/ThemeToggle';

// Import pages
import Home from './pages/Home';
import Explore from './pages/Explore';
import Create from './pages/Create';
import AuthCallback from './pages/AuthCallback';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
            {/* Professional Navbar */}
            <nav className="absolute top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
              <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                  {/* Logo */}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">QEDI</span>
                  </div>

                  {/* Navigation */}
                  <div className="hidden md:flex items-center gap-8">
                    <a href="/" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                      Home
                    </a>
                    <a href="/explore" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                      Explore
                    </a>
                    <a href="/create" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                      Create
                    </a>
                  </div>

                  {/* Right Section */}
                  <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <button className="hidden sm:block px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                      Sign In
                    </button>
                    <button className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200">
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
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;