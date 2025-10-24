import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { enokiFlow } from '../lib/enoki';
import { AuthMethod, LoginProvider, UserSession } from '../types/profile';

interface AuthContextType {
  session: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (method: 'wallet' | LoginProvider) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const currentAccount = useCurrentAccount();
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing zkLogin session on mount
  useEffect(() => {
    checkExistingSession();
  }, []);

  // Update session when wallet connects
  useEffect(() => {
    if (currentAccount?.address) {
      setSession({
        address: currentAccount.address,
        authMethod: 'wallet',
      });
    } else if (!session?.authMethod || session.authMethod === 'wallet') {
      setSession(null);
    }
  }, [currentAccount]);

  async function checkExistingSession() {
    setIsLoading(true);
    try {
      // Check if there's a zkLogin session in localStorage
      const storedSession = localStorage.getItem('qedi_session');
      if (storedSession) {
        const parsedSession = JSON.parse(storedSession);
        setSession(parsedSession);
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(method: 'wallet' | LoginProvider) {
    if (method === 'wallet') {
      // Wallet login is handled by dApp Kit's ConnectButton
      // Session will be set via the currentAccount useEffect
      return;
    }

    // zkLogin with social provider
    try {
      setIsLoading(true);
      
      const authUrl = await enokiFlow.createAuthorizationURL({
        provider: method,
        clientId: getClientId(method),
        redirectUrl: `${window.location.origin}/auth/callback`,
        network: 'testnet',
      });

      // Redirect to OAuth provider
      window.location.href = authUrl;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      throw error;
    }
  }

  function logout() {
    // Clear zkLogin session
    localStorage.removeItem('qedi_session');
    setSession(null);
    
    // Note: Wallet disconnection is handled by dApp Kit
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        isAuthenticated: !!session,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Helper to get OAuth client IDs
function getClientId(provider: LoginProvider): string {
  const clientIds = {
    google: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
    facebook: import.meta.env.VITE_FACEBOOK_CLIENT_ID || '',
    twitch: import.meta.env.VITE_TWITCH_CLIENT_ID || '',
  };
  
  return clientIds[provider];
}

