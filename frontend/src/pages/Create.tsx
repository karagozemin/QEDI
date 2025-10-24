export default function Create() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 pt-24">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-blue-500/10 border border-blue-400/20 backdrop-blur-sm text-blue-300 text-sm font-medium mb-10">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
              Profile Builder
            </div>
            <h1 className="text-6xl font-bold mb-8 text-white leading-tight">
              Create Your On-Chain Profile
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Build your decentralized LinkTree profile on Sui blockchain. No servers, no downtime, no censorship.
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-600/30 overflow-hidden">
            {/* Progress Bar */}
            <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/50"></div>
            
            <div className="p-16">
              <div className="text-center max-w-3xl mx-auto">
                {/* Icon */}
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-12 shadow-2xl shadow-blue-500/25 hover:scale-110 transition-all duration-700 ease-out hover:rotate-3">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
                  </svg>
                </div>

                {/* Status */}
                <h3 className="text-4xl font-bold mb-8 text-white">
                  Smart Contracts in Development
                </h3>
                <p className="text-lg text-gray-300 mb-12 leading-relaxed max-w-2xl mx-auto">
                  Our Move smart contracts are being developed and tested on Sui testnet. 
                  Profile creation will be available once deployment is complete.
                </p>

                {/* Features Preview */}
                <div className="grid md:grid-cols-2 gap-6 mb-16">
                  {[
                    { icon: "M5 13l4 4L19 7", text: "Google Login" },
                    { icon: "M5 13l4 4L19 7", text: "Zero Gas Fees" },
                    { icon: "M5 13l4 4L19 7", text: "Custom Themes" },
                    { icon: "M5 13l4 4L19 7", text: "Drag & Drop Links" }
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-4 p-6 bg-gray-700/30 backdrop-blur-sm rounded-2xl border border-gray-600/30 hover:border-blue-400/30 transition-all duration-700 ease-out group hover:-translate-y-1">
                      <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-700 ease-out group-hover:rotate-3">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                        </svg>
                      </div>
                      <span className="text-gray-200 font-medium text-lg">{feature.text}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <button className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40 transform hover:-translate-y-2 transition-all duration-700 ease-out hover:scale-105">
                    Get Notified When Ready
                  </button>
                  <button className="px-10 py-4 bg-gray-700/50 backdrop-blur-sm text-gray-200 font-semibold rounded-2xl border border-gray-600/50 hover:border-blue-400/50 hover:bg-gray-600/50 hover:text-white transform hover:-translate-y-1 transition-all duration-700 ease-out hover:scale-105">
                    Connect Wallet
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}