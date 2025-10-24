// Sui Network
export const NETWORK = (import.meta.env.VITE_NETWORK || 'testnet') as 'testnet' | 'mainnet';

// Smart Contract IDs (deployed to testnet)
export const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID || '0x11b5d881867910ab05483669ee6ca32536b36ff5a35c8568d806a25447fe2888';
export const REGISTRY_ID = import.meta.env.VITE_REGISTRY_ID || '0xe37ab0f291b0b0b5e91fcfb3cefd655bb6666036fbef1062a96247dd7cd995a1';
export const ADMIN_CAP_ID = '0xd81ef476851b5b2473423a3752b845116ce5fedf3ce60df168cd8450cc485948';

// Enoki Configuration
export const ENOKI_API_KEY = import.meta.env.VITE_ENOKI_API_KEY || '';
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Walrus Configuration
export const WALRUS_AGGREGATOR = 'https://aggregator.walrus-testnet.walrus.space/v1';
export const WALRUS_PUBLISHER = 'https://publisher.walrus-testnet.walrus.space';

// App Configuration
export const APP_NAME = 'QEDI';
export const APP_URL = window.location.origin;

