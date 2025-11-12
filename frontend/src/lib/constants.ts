// Sui Network
export const NETWORK = (import.meta.env.VITE_NETWORK || 'testnet') as 'testnet' | 'mainnet';

// Smart Contract IDs (deployed to testnet - v4 - Working deployment)
export const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID || '0x80290a4621d25a18c7d37cbc83dae3e85f05460ad13649b9f689100a2967e03a';
export const REGISTRY_ID = import.meta.env.VITE_REGISTRY_ID || '0x73ea10e7cfde7d60cfc5d712e4883f7845a7783a55c9be6183782cf971ae87de';
export const ADMIN_CAP_ID = '0xed84ec0007b0bd9cbb07bb21cf85209315d785683ffdcfb0b73c69cf23cfb514';

// Previous package versions for backward compatibility
export const OLD_PACKAGE_IDS = [
  '0xb2db4954abaaf4731c9559f35f42181546f9dce8a773ef8cd81c4e29889827d5', // v3
];

// Previous registry IDs for backward compatibility (to find old usernames)
export const OLD_REGISTRY_IDS = [
  '0xe8cc8979e3c2254e2442d9e3292934a6d4d2caf5a0e71046e6248469e6a0c8bd', // Old v4 registry (46 usernames)
];

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
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://qedi.onrender.com';

// zkLogin Configuration
export const ZKLOGIN_DEVNET_URL = import.meta.env.VITE_ZKLOGIN_DEVNET_URL || 'https://zklogin-api.testnet.sui.io';
export const ZKLOGIN_REDIRECT_URI = import.meta.env.VITE_ZKLOGIN_REDIRECT_URI || 'https://qedi.trwal.app/auth/callback';

// Sui RPC Configuration
export const SUI_RPC_URL = import.meta.env.VITE_SUI_RPC_URL || 'https://fullnode.testnet.sui.io:443';

// Optional Configuration
export const ENOKI_PROJECT_ID = import.meta.env.VITE_ENOKI_PROJECT_ID || '';
export const IPFS_GATEWAY = import.meta.env.VITE_IPFS_GATEWAY || 'https://ipfs.io/ipfs/';
export const NODE_ENV = import.meta.env.VITE_NODE_ENV || 'development';

