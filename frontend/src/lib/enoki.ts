import { ENOKI_API_KEY } from './constants';

// Enoki configuration
const ENOKI_API_URL = 'https://api.enoki.mystenlabs.com';

// Helper function to make Enoki API calls
async function enokiApiCall(endpoint: string, data: any) {
  const response = await fetch(`${ENOKI_API_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ENOKI_API_KEY}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Enoki API error: ${response.statusText}`);
  }

  return response.json();
}

// zkLogin providers configuration
export const zkLoginProviders = {
  google: {
    name: 'Google',
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
    icon: '🔍',
    color: 'from-red-500 to-red-600',
    scope: 'openid email profile'
  },
  facebook: {
    name: 'Facebook', 
    clientId: import.meta.env.VITE_FACEBOOK_CLIENT_ID || '',
    icon: '📘',
    color: 'from-blue-600 to-blue-700',
    scope: 'email public_profile'
  },
  twitch: {
    name: 'Twitch',
    clientId: import.meta.env.VITE_TWITCH_CLIENT_ID || '',
    icon: '🎮',
    color: 'from-purple-500 to-purple-600',
    scope: 'user:read:email'
  }
};

// Get auth URL for zkLogin
export async function getAuthUrl(provider: keyof typeof zkLoginProviders) {
  const redirectUrl = `${window.location.origin}/auth/callback`;
  const config = zkLoginProviders[provider];
  
  if (!config.clientId) {
    throw new Error(`${config.name} client ID not configured`);
  }
  
  try {
    const result = await enokiApiCall('/v1/zklogin/auth-url', {
      provider,
      clientId: config.clientId,
      redirectUrl,
      scope: config.scope,
      network: 'testnet'
    });
    
    return result.authUrl;
  } catch (error) {
    console.error(`Failed to get auth URL for ${provider}:`, error);
    throw error;
  }
}

// Complete zkLogin authentication
export async function completeZkLogin(authCode: string, provider: keyof typeof zkLoginProviders) {
  try {
    const result = await enokiApiCall('/v1/zklogin/callback', {
      authorizationCode: authCode,
      provider,
      network: 'testnet'
    });

    return {
      address: result.address,
      zkProof: result.zkProof,
      userInfo: result.userInfo
    };
  } catch (error) {
    console.error('Failed to complete zkLogin:', error);
    throw error;
  }
}

// Create sponsored transaction
export async function createSponsoredTransaction(transactionData: any) {
  try {
    const result = await enokiApiCall('/v1/sponsor-transaction', {
      transactionKindBytes: transactionData,
      network: 'testnet'
    });

    return result;
  } catch (error) {
    console.error('Failed to create sponsored transaction:', error);
    throw error;
  }
}

