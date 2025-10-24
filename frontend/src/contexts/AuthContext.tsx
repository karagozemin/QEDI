import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { enokiFlow, zkLoginProviders, getAuthUrl, completeZkLogin } from '../lib/enoki';
import { AuthMethod, LoginProvider, UserSession } from '../types/profile';

interface AuthContextType {
  session: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (method: 'wallet' | LoginProvider) => Promise<void>;
  logout: () => void;
  handleZkLoginCallback: (authCode: string) => Promise<UserSession>;
  zkLoginProviders: typeof zkLoginProviders;
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
      
      const authUrl = await getAuthUrl(method);
      
      // Store the provider for callback handling
      localStorage.setItem('qedi_auth_provider', method);

      // Redirect to OAuth provider
      window.location.href = authUrl;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      throw error;
    }
  }

  // Handle zkLogin callback
  async function handleZkLoginCallback(authCode: string) {
    try {
      setIsLoading(true);
      
      const provider = localStorage.getItem('qedi_auth_provider') as LoginProvider;
      if (!provider) {
        throw new Error('No auth provider found');
      }

      const result = await completeZkLogin(authCode, provider);
      
      const newSession: UserSession = {
        address: result.address,
        authMethod: provider,
        zkProof: result.zkProof,
        userInfo: result.userInfo,
      };

      setSession(newSession);
      localStorage.setItem('qedi_session', JSON.stringify(newSession));
      localStorage.removeItem('qedi_auth_provider');
      
      return newSession;
    } catch (error) {
      console.error('zkLogin callback error:', error);
      throw error;
    } finally {
      setIsLoading(false);
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
        handleZkLoginCallback,
        zkLoginProviders,
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

