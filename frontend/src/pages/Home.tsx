import { useParams } from 'react-router-dom';
import DarkVeil from '../components/DarkVeil';
import Profile from './Profile';
import DashboardLayout from '../components/Layouts/DashboardLayout';

export default function Home() {
  const { username } = useParams<{ username: string }>();

  // If username parameter exists, show Profile component
  if (username) {
    return <Profile />;
  }

  return (
    <DashboardLayout>
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900">
      {/* DarkVeil Background - Fixed to cover entire page */}
      <div className="fixed inset-0 opacity-30 pointer-events-none z-0">
        <DarkVeil speed={0.3} />
      </div>
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20"></div>
        </div>
        
        <div className="container mx-auto px-4 py-32">
          <div className="text-center max-w-5xl mx-auto">
            {/* Main Heading */}
            <h1 className="text-6xl md:text-8xl font-bold mb-12 text-white tracking-tight leading-tight mt-16">
              Your Links,
              <br />
              On-Chain Forever
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-300 mb-16 max-w-3xl mx-auto leading-relaxed">
              Create your decentralized profile on Sui blockchain. All your social links in one permanent, 
              censorship-resistant location.
            </p>

            {/* CTA Section */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24">
              <a
                href="/create"
                className="group px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40 transform hover:-translate-y-1 transition-all duration-1000 ease-out hover:scale-102"
              >
                <span className="flex items-center gap-3">
                  Create Your Profile
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-1000 ease-out" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </a>
              
              <a
                href="/my-profiles"
                className="px-10 py-4 bg-gray-800/50 backdrop-blur-sm text-gray-200 font-semibold rounded-2xl border border-gray-600/50 hover:border-blue-400/50 hover:bg-gray-700/50 hover:text-white transform hover:-translate-y-1 transition-all duration-1000 ease-out hover:scale-102 shadow-lg"
              >
                My Profiles
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-12 max-w-3xl mx-auto mb-24">
              <div className="text-center group cursor-pointer">
                <div className="text-4xl font-bold text-white mb-2 group-hover:scale-105 transition-all duration-1000 ease-out">100%</div>
                <div className="text-sm text-gray-400 font-medium uppercase tracking-wider group-hover:text-gray-300 transition-all duration-1000 ease-out">Decentralized</div>
              </div>
              <div className="text-center group cursor-pointer">
                <div className="text-4xl font-bold text-white mb-2 group-hover:scale-105 transition-all duration-1000 ease-out">$0</div>
                <div className="text-sm text-gray-400 font-medium uppercase tracking-wider group-hover:text-gray-300 transition-all duration-1000 ease-out">Gas Fees</div>
              </div>
              <div className="text-center group cursor-pointer">
                <div className="text-4xl font-bold text-white mb-2 group-hover:scale-105 transition-all duration-1000 ease-out">∞</div>
                <div className="text-sm text-gray-400 font-medium uppercase tracking-wider group-hover:text-gray-300 transition-all duration-1000 ease-out">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-32 bg-gradient-to-b from-gray-800/60 to-gray-900/60">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-white mb-6">
              Why Choose QEDI?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Built with cutting-edge blockchain technology for the next generation of digital identity.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 max-w-7xl mx-auto">
            {/* Feature 1 */}
            <div className="group p-10 rounded-3xl bg-gradient-to-br from-gray-800/50 to-gray-700/30 backdrop-blur-sm border border-gray-600/30 hover:border-blue-400/30 hover:shadow-2xl hover:shadow-blue-500/10 transform hover:-translate-y-2 transition-all duration-1000 ease-out">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-105 group-hover:rotate-1 transition-all duration-1000 ease-out shadow-lg shadow-blue-500/25">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-6 text-white">
                Permanent & Secure
              </h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                Your profile lives on Sui blockchain forever. No servers to fail, no companies to shut down, no data to lose.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-10 rounded-3xl bg-gradient-to-br from-gray-800/50 to-gray-700/30 backdrop-blur-sm border border-gray-600/30 hover:border-blue-400/30 hover:shadow-2xl hover:shadow-blue-500/10 transform hover:-translate-y-2 transition-all duration-1000 ease-out">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-105 group-hover:rotate-1 transition-all duration-1000 ease-out shadow-lg shadow-blue-500/25">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-6 text-white">
                Zero Gas Fees
              </h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                Create and update your profile without paying transaction fees. Powered by sponsored transactions on Sui.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-10 rounded-3xl bg-gradient-to-br from-gray-800/50 to-gray-700/30 backdrop-blur-sm border border-gray-600/30 hover:border-blue-400/30 hover:shadow-2xl hover:shadow-blue-500/10 transform hover:-translate-y-2 transition-all duration-1000 ease-out">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-105 group-hover:rotate-1 transition-all duration-1000 ease-out shadow-lg shadow-blue-500/25">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-6 text-white">
                Simple & Powerful
              </h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                Google login, drag-and-drop interface, and instant updates. Web3 technology with Web2 simplicity.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-32 bg-gradient-to-b from-gray-900/20 via-blue-800/10 to-blue-600/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-5xl font-bold text-white mb-8">
            Ready to Build Your On-Chain Identity?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join the future of decentralized profiles. Your links, your data, your control.
          </p>
          <button className="px-12 py-5 bg-white text-blue-600 font-bold rounded-2xl hover:bg-gray-50 transform hover:-translate-y-1 transition-all duration-1000 ease-out hover:scale-102 shadow-2xl hover:shadow-white/25 text-lg">
            Get Notified When Ready
          </button>
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
}