// Sui Network
export const NETWORK = (import.meta.env.VITE_NETWORK || 'testnet') as 'testnet' | 'mainnet';

// Smart Contract IDs (will be filled after deployment)
export const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID || '';
export const REGISTRY_ID = import.meta.env.VITE_REGISTRY_ID || '';

// Enoki Configuration
export const ENOKI_API_KEY = import.meta.env.VITE_ENOKI_API_KEY || '';
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Walrus Configuration
export const WALRUS_AGGREGATOR = 'https://aggregator.walrus-testnet.walrus.space/v1';
export const WALRUS_PUBLISHER = 'https://publisher.walrus-testnet.walrus.space';

// App Configuration
export const APP_NAME = 'QEDI';
export const APP_URL = window.location.origin;

