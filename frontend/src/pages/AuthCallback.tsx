import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { enokiFlow } from '../lib/enoki';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    handleCallback();
  }, []);

  async function handleCallback() {
    try {
      const code = searchParams.get('code');
      const state = searchParams.get('state');

      if (!code || !state) {
        throw new Error('Invalid callback parameters');
      }

      // Exchange code for zkProof
      const zkProof = await enokiFlow.handleAuthCallback({
        code,
        state,
      });

      // Get address from zkProof
      const address = await enokiFlow.getAddress({
        jwt: zkProof.jwt,
      });

      // Store session
      const session = {
        address,
        authMethod: 'zklogin' as const,
        zkProof,
      };

      localStorage.setItem('qedi_session', JSON.stringify(session));

      setStatus('success');
      
      // Redirect to create profile or dashboard
      setTimeout(() => {
        navigate('/create');
      }, 1500);
    } catch (err) {
      console.error('Auth callback error:', err);
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Authentication failed');
      
      // Redirect to home after error
      setTimeout(() => {
        navigate('/');
      }, 3000);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-fuchsia-50">
      <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Giriş yapılıyor...
            </h2>
            <p className="text-gray-600">
              Lütfen bekleyin, kimliğiniz doğrulanıyor.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Giriş Başarılı!
            </h2>
            <p className="text-gray-600">
              Yönlendiriliyorsunuz...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Giriş Başarısız
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">
              Ana sayfaya yönlendiriliyorsunuz...
            </p>
          </>
        )}
      </div>
    </div>
  );
}

