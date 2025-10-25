// Sui Network
export const NETWORK = (import.meta.env.VITE_NETWORK || 'testnet') as 'testnet' | 'mainnet';

// Smart Contract IDs (deployed to testnet - v2)
export const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID || '0xb2d7a68d8711ceac4a5ee6c7fbec61456083d6ff20858b6d38f86c9922d02673';
export const REGISTRY_ID = import.meta.env.VITE_REGISTRY_ID || '0x6b879e03c806815ea844dcebcd44447250c8b9cdc9c7553d3443dfb00cc2ce77';
export const ADMIN_CAP_ID = '0xd560ca8e5f66bf6331e123c53313500ecafb752c40c77b3f510a96975b34adbe';

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

// zkLogin Configuration
export const ZKLOGIN_DEVNET_URL = import.meta.env.VITE_ZKLOGIN_DEVNET_URL || 'https://zklogin-api.testnet.sui.io';
export const ZKLOGIN_REDIRECT_URI = import.meta.env.VITE_ZKLOGIN_REDIRECT_URI || 'http://localhost:5173/auth/callback';

// Sui RPC Configuration
export const SUI_RPC_URL = import.meta.env.VITE_SUI_RPC_URL || 'https://fullnode.testnet.sui.io:443';

// Optional Configuration
export const ENOKI_PROJECT_ID = import.meta.env.VITE_ENOKI_PROJECT_ID || '';
export const IPFS_GATEWAY = import.meta.env.VITE_IPFS_GATEWAY || 'https://ipfs.io/ipfs/';
export const NODE_ENV = import.meta.env.VITE_NODE_ENV || 'development';

