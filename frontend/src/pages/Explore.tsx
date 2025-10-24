export default function Explore() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 pt-20">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Community Profiles
          </div>
          <h1 className="text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            Explore 
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> QEDI Profiles</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover amazing profiles created by our community. Get inspired for your own on-chain identity.
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-16 text-center">
              {/* Illustration */}
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>

              {/* Content */}
              <h3 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                Profiles Coming Soon
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                Once our smart contracts are deployed, this space will showcase incredible profiles created by our community. 
                Be among the first to create your on-chain identity.
              </p>

              {/* Preview Cards */}
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mx-auto"></div>
                </div>
                <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mx-auto"></div>
                </div>
                <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mx-auto"></div>
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/create" 
                  className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Be the First to Create
                </a>
                <button className="px-8 py-4 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200">
                  Get Notified
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}