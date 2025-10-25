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

        // Complete zkLogin process
        console.log('=== AUTH CALLBACK DEBUG ===');
        console.log('Auth code received:', authCode);
        console.log('URL params:', new URLSearchParams(window.location.search));
        console.log('Full URL:', window.location.href);
        
        const provider = localStorage.getItem('qedi_auth_provider');
        console.log('Stored provider:', provider);
        
        if (!provider) {
          throw new Error('No auth provider found');
        }

        console.log('Completing zkLogin for provider:', provider);
        
        // Import and use zkLogin completion
        const { completeZkLogin } = await import('../lib/enoki');
        const result = await completeZkLogin(authCode, provider as any);
        
        console.log('zkLogin completed:', result);
        
        // Store session
        const session = {
          address: result.address,
          authMethod: provider,
          zkProof: result.zkProof,
          userInfo: result.userInfo,
        };
        
        localStorage.setItem('qedi_session', JSON.stringify(session));
        localStorage.removeItem('qedi_auth_provider');
        
        console.log('Session stored:', session);
        
        // Trigger storage event manually for same-window updates
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'qedi_session',
          newValue: JSON.stringify(session),
          storageArea: localStorage
        }));
        
        setStatus('success');
        
        // Redirect to home page after successful login
        setTimeout(() => {
          navigate('/');
        }, 1500);

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