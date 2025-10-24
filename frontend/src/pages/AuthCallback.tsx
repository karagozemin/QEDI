import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const processCallback = async () => {
      try {
        const authCode = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(`Authentication failed: ${error}`);
        }

        if (!authCode) {
          throw new Error('No authorization code received');
        }

        // TODO: Complete zkLogin process when AuthContext is ready
        console.log('Auth code received:', authCode);
        
        setStatus('success');
        
        // Redirect to create profile page after successful login
        setTimeout(() => {
          navigate('/create');
        }, 2000);

      } catch (err) {
        console.error('Auth callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setStatus('error');
        
        // Redirect to home after error
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    };

    processCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-white mb-4">Processing Authentication...</h2>
            <p className="text-gray-300">Please wait while we complete your login.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Login Successful!</h2>
            <p className="text-gray-300">Redirecting you to create your profile...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Authentication Failed</h2>
            <p className="text-gray-300 mb-4">{error}</p>
            <p className="text-gray-400 text-sm">Redirecting you back to home...</p>
          </>
        )}
      </div>
    </div>
  );
}