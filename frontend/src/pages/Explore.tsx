export default function Explore() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 pt-24">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-indigo-500/10 border border-indigo-400/20 backdrop-blur-sm text-indigo-300 text-sm font-medium mb-10">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Profile Discovery
            </div>
            <h1 className="text-6xl font-bold mb-8 text-white leading-tight">
              Explore On-Chain Profiles
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Discover amazing profiles built on Sui blockchain. Find creators, developers, and innovators in the Web3 space.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-16">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search profiles by username or .sui domain..."
                className="w-full pl-16 pr-6 py-5 bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-lg"
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-600/30 overflow-hidden">
            <div className="p-16">
              <div className="text-center max-w-3xl mx-auto">
                {/* Icon */}
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-12 shadow-2xl shadow-indigo-500/25 hover:scale-110 transition-all duration-700 ease-out hover:rotate-3">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>

                {/* Status */}
                <h3 className="text-4xl font-bold mb-8 text-white">
                  Profiles Coming Soon
                </h3>
                <p className="text-lg text-gray-300 mb-12 leading-relaxed max-w-2xl mx-auto">
                  Once our smart contracts are deployed, you'll be able to explore and discover 
                  amazing on-chain profiles created by the community.
                </p>

                {/* Features Preview */}
                <div className="grid md:grid-cols-3 gap-6 mb-16">
                  {[
                    { 
                      icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z", 
                      title: "Search Profiles",
                      desc: "Find by username or .sui domain"
                    },
                    { 
                      icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z", 
                      title: "Browse Categories",
                      desc: "Creators, developers, artists"
                    },
                    { 
                      icon: "M13 10V3L4 14h7v7l9-11h-7z", 
                      title: "Trending Profiles",
                      desc: "Most visited and popular"
                    }
                  ].map((feature, index) => (
                    <div key={index} className="p-8 bg-gray-700/30 backdrop-blur-sm rounded-2xl border border-gray-600/30 hover:border-indigo-400/30 transition-all duration-700 ease-out group hover:-translate-y-2">
                      <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-700 ease-out group-hover:rotate-3">
                        <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                        </svg>
                      </div>
                      <h4 className="text-xl font-bold text-white mb-3">{feature.title}</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">{feature.desc}</p>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <button className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-2xl shadow-xl shadow-indigo-500/25 hover:shadow-2xl hover:shadow-indigo-500/40 transform hover:-translate-y-2 transition-all duration-700 ease-out hover:scale-105">
                    Get Notified When Ready
                  </button>
                  <a
                    href="/create"
                    className="px-10 py-4 bg-gray-700/50 backdrop-blur-sm text-gray-200 font-semibold rounded-2xl border border-gray-600/50 hover:border-indigo-400/50 hover:bg-gray-600/50 hover:text-white transform hover:-translate-y-1 transition-all duration-700 ease-out hover:scale-105 inline-block text-center"
                  >
                    Create Your Profile
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}