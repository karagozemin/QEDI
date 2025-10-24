export default function AuthCallback() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center p-8 bg-white border border-gray-200 rounded-lg shadow-sm max-w-md">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Processing Authentication
        </h2>
        <p className="text-gray-600">
          zkLogin authentication will be implemented here once smart contracts are ready.
        </p>
      </div>
    </div>
  );
}