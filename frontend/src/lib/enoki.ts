import { EnokiFlowConfig, EnokiFlow } from '@mysten/enoki/react';
import { ENOKI_API_KEY } from './constants';

// Enoki Flow Configuration
const enokiFlowConfig: EnokiFlowConfig = {
  apiUrl: 'https://api.enoki.mystenlabs.com',
  apiKey: ENOKI_API_KEY,
};

// Initialize Enoki Flow
export const enokiFlow = new EnokiFlow(enokiFlowConfig);

// Get auth URL for zkLogin
export async function getAuthUrl(provider: 'google' | 'facebook' | 'twitch') {
  const redirectUrl = `${window.location.origin}/auth/callback`;
  
  return await enokiFlow.createAuthorizationURL({
    provider,
    clientId: getClientId(provider),
    redirectUrl,
    network: 'testnet',
  });
}

// Get OAuth client IDs
function getClientId(provider: 'google' | 'facebook' | 'twitch'): string {
  const clientIds = {
    google: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
    facebook: import.meta.env.VITE_FACEBOOK_CLIENT_ID || '',
    twitch: import.meta.env.VITE_TWITCH_CLIENT_ID || '',
  };
  
  return clientIds[provider];
}

