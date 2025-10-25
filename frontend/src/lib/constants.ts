// Sui Network
export const NETWORK = (import.meta.env.VITE_NETWORK || 'testnet') as 'testnet' | 'mainnet';

// Smart Contract IDs (deployed to testnet - v3 - Registry bug fixed)
export const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID || '0xb2db4954abaaf4731c9559f35f42181546f9dce8a773ef8cd81c4e29889827d5';
export const REGISTRY_ID = import.meta.env.VITE_REGISTRY_ID || '0xe8cc8979e3c2254e2442d9e3292934a6d4d2caf5a0e71046e6248469e6a0c8bd';
export const ADMIN_CAP_ID = '0xf5a0e1d42dc949ab3d8d49221f9f920b6b237ad749be831ac8b2d1f7c0ae959a';

// Enoki Configuration
export const ENOKI_API_KEY = import.meta.env.VITE_ENOKI_API_KEY || '';
export const ENOKI_PRIVATE_KEY = import.meta.env.VITE_ENOKI_PRIVATE_KEY || '';
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Walrus Configuration
export const WALRUS_AGGREGATOR = 'https://aggregator.walrus-testnet.walrus.space/v1';
export const WALRUS_PUBLISHER = 'https://publisher.walrus-testnet.walrus.space';

// App Configuration
export const APP_NAME = 'QEDI';
export const APP_URL = import.meta.env.VITE_APP_URL || window.location.origin;
export const BACKEND_URL = 'https://qedi.onrender.com';

// zkLogin Configuration
export const ZKLOGIN_DEVNET_URL = import.meta.env.VITE_ZKLOGIN_DEVNET_URL || 'https://zklogin-api.testnet.sui.io';
export const ZKLOGIN_REDIRECT_URI = import.meta.env.VITE_ZKLOGIN_REDIRECT_URI || 'https://qedi.trwal.app/auth/callback';

// Sui RPC Configuration
export const SUI_RPC_URL = import.meta.env.VITE_SUI_RPC_URL || 'https://fullnode.testnet.sui.io:443';

// Optional Configuration
export const ENOKI_PROJECT_ID = import.meta.env.VITE_ENOKI_PROJECT_ID || '';
export const IPFS_GATEWAY = import.meta.env.VITE_IPFS_GATEWAY || 'https://ipfs.io/ipfs/';
export const NODE_ENV = import.meta.env.VITE_NODE_ENV || 'development';

