import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { session, login, isLoading } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      await login('google');
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></span>
            Powered by Sui Blockchain
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
            Your Links,
            <br />
            On-Chain Forever
          </h1>

          {/* Description */}
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto">
            QEDI brings all your social media and web links together in one decentralized profile.
            Censorship-resistant, permanent, and truly yours.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            {session ? (
              <Link
                to="/create"
                className="px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-xl hover:shadow-xl hover:scale-105 transition-all"
              >
                Create Your Profile
              </Link>
            ) : (
              <>
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-xl hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  {isLoading ? 'Signing in...' : 'Sign in with Google'}
                </button>
                
                <Link
                  to="/explore"
                  className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-violet-600 hover:text-violet-600 transition-all"
                >
                  Explore Profiles
                </Link>
              </>
            )}
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="p-6 rounded-2xl bg-white/50 backdrop-blur border border-white">
              <div className="text-4xl mb-4">🔐</div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">
                Secure & Decentralized
              </h3>
              <p className="text-gray-600">
                Your data lives on Sui blockchain. No one can delete or modify it.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/50 backdrop-blur border border-white">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">
                Zero Gas Fees
              </h3>
              <p className="text-gray-600">
                Use sponsored transactions - no need to pay gas fees ever.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/50 backdrop-blur border border-white">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">
                Fully Customizable
              </h3>
              <p className="text-gray-600">
                Choose from multiple themes and customize your profile style.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}