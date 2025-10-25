#QEDI - On-Chain LinkTree Platform (zkLogin + Sponsored Gas dApp)

A comprehensive full-stack decentralized application for creating, managing, and sharing LinkTree profiles on the Sui blockchain. This platform features sponsored transactions powered by Enoki, providing gasless interactions for users with zkLogin authentication and Passkey support.

## What's Inside

This platform consists of three main components:

### Smart Contract (Sui Move)
**Module:** `qedi_linktree::linktree`
**Structs:**
- `LinkTreeProfile`: On-chain profile with username, display_name, bio, avatar_url, links, theme
- `Link`: Individual link with title, url, icon, click tracking
- `UsernameRegistry`: Global registry for username → profile mapping

**Functions:** 
- `create_profile` — Create new LinkTree profile
- `add_link` — Add social/web links to profile  
- `update_profile` — Update profile information
- `click_link` — Track link clicks on-chain

### Frontend (React + TypeScript + Vite)
Modern React application with comprehensive LinkTree functionality
- **Enoki wallet integration** with zkLogin and Passkey support
- **Real-time profile management** with link creation and editing
- **Sponsored transactions** for gasless user experience
- **Mobile-responsive design** with dark mode theme

**Components:**
- Profile creation form with multi-step wizard
- Link management with drag-and-drop reordering
- Social media integration with custom icons
- Profile viewing with click tracking
- Wallet connection with multiple auth methods

### Key Features
- **zkLogin Authentication** - Google, Facebook, Twitch, and Passkey support
- **Sponsored Transactions** - Zero gas fees via Enoki SDK
- **On-Chain Profile Storage** - Fully decentralized data
- **Username Registry** - Human-readable profile URLs
- **Link Click Tracking** - On-chain analytics
- **Mobile-First Design** - Optimized for all devices

## 🏗 Architecture Overview

```
QEDI/
├── frontend/                    # React Application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/             # Route components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── contexts/          # React contexts
│   │   ├── lib/               # Utility functions
│   │   └── types/             # TypeScript definitions
├── move/                       # Smart Contracts
│   ├── sources/
│   │   ├── linktree.move      # Main profile contract
│   │   └── registry.move      # Username registry
│   └── tests/                 # Contract tests
├── scripts/                    # Automation
│   ├── deploy.sh              # Deployment automation
│   └── setup.sh               # Environment setup
└── docs/                       # Documentation
    ├── SETUP.md               # Setup instructions
    └── API.md                 # API documentation
```

## 🎯 Production Deployment

### Walrus Sites Integration
- **Decentralized Hosting** - Frontend deployed as Walrus Sites
- **Custom Domain** - SuiNS integration for branded URLs
- **Global CDN** - Fast worldwide access via Walrus network
- **Permanent Storage** - Immutable deployment on blockchain

### Smart Contract Deployment
- **Testnet Ready** - Deployed and tested on Sui testnet
- **Gas Optimized** - Efficient Move code with minimal transaction costs
- **Upgradeable** - Modular architecture for future enhancements
- **Audited Logic** - Comprehensive testing and validation

## 🛠 Technology Stack

### Blockchain Layer
- **Sui Network** - High-performance blockchain platform
- **Move Language** - Smart contract development
- **Walrus Protocol** - Decentralized storage network
- **SuiNS** - Sui Name Service integration

### Frontend Layer
- **React 18** - Modern React with concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first styling
- **shadcn/ui** - Professional component library

### Authentication & Transactions
- **Enoki SDK** - zkLogin and sponsored transactions
- **@mysten/dapp-kit** - Sui wallet integration
- **@mysten/sui** - Sui blockchain interactions
- **React Query** - Server state management

## Prerequisites
- Node.js (v18+ recommended)
- npm or yarn package manager
- Enoki account with API keys (private + public)
- zkLogin credentials for wallet authentication
- Deployed LinkTree smart contract package ID

## Setup Instructions

### 1. Frontend Setup
Navigate to the frontend directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Copy and configure environment variables:
```bash
cp env.local.example .env.local
```

Edit `.env.local` file with your credentials:
```env
# Enoki API keys for sponsored transactions and zkLogin
VITE_ENOKI_API_KEY=your_enoki_public_key_here
VITE_ENOKI_PRIVATE_KEY=your_enoki_private_key_here

# OAuth Provider Client IDs for zkLogin
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_FACEBOOK_CLIENT_ID=your_facebook_client_id_here
VITE_TWITCH_CLIENT_ID=your_twitch_client_id_here

# Deployed smart contract package IDs
VITE_PACKAGE_ID=0xb2d7a68d8711ceac4a5ee6c7fbec61456083d6ff20858b6d38f86c9922d02673
VITE_REGISTRY_ID=0x6b879e03c806815ea844dcebcd44447250c8b9cdc9c7553d3443dfb00cc2ce77

# Walrus configuration for decentralized storage
VITE_WALRUS_PUBLISHER_URL=https://publisher.walrus-testnet.walrus.space
VITE_WALRUS_AGGREGATOR_URL=https://aggregator.walrus-testnet.walrus.space
```

### 2. Smart Contract Deployment (Optional)
If you want to deploy your own contract:
```bash
cd move
sui move build
sui client publish --gas-budget 100000000
```

## Running the Application

### Start Development Server
```bash
cd frontend
npm run dev
```

The frontend will start on http://localhost:5173 with full functionality:

```
2025-10-25 03:01:00 [info]: QEDI LinkTree Platform started {
  "service": "qedi-frontend",
  "port": "5173",
  "environment": "development",
  "network": "testnet",
  "features": ["zkLogin", "sponsored-transactions", "passkey-auth"]
}
```

## Core Functionality

### Profile Management
- **Create Profile**: Multi-step wizard with username, bio, avatar, and links
- **Add Links**: Social media and custom links with click tracking
- **Update Profile**: Real-time profile editing
- **View Profile**: Public profile pages with analytics

### Authentication Methods
- **Wallet Connect**: Standard Sui wallet connection
- **zkLogin**: Google, Facebook, Twitch OAuth integration
- **Passkey**: Touch ID / Face ID biometric authentication (coming soon)

### Transaction Types
All transactions support both regular and sponsored (gasless) execution:

**Profile Operations:**
```javascript
// Create new profile
POST /api/create-profile
{
  "username": "myusername",
  "displayName": "My Display Name", 
  "bio": "My bio text",
  "avatarUrl": "https://...",
  "theme": "default"
}

// Add link to profile
POST /api/add-link
{
  "profileId": "0x...",
  "title": "My Website",
  "url": "https://mysite.com",
  "icon": "website"
}
```

## Transaction Logging

Example console output during sponsored transactions:

```
2025-10-25 03:25:15 [info]: Transaction CREATE_PROFILE initiated {
  "service": "qedi-frontend",
  "operation": "CREATE_PROFILE", 
  "sender": "0xb532...1d63",
  "status": "INITIATED",
  "sponsored": true,
  "details": {
    "username": "myusername",
    "displayName": "My Profile",
    "linksCount": 3
  }
}

2025-10-25 03:25:16 [info]: Sponsored transaction successful {
  "service": "qedi-frontend",
  "operation": "CREATE_PROFILE",
  "transactionDigest": "0x1a2b3c...",
  "gasUsed": 0,
  "status": "SUCCESS"
}
```

## Live Demo

- **Development**: http://localhost:5173
- **Testnet Explorer**: View contracts on Sui testnet explorer
- **Package ID**: `0xb2d7a68d8711ceac4a5ee6c7fbec61456083d6ff20858b6d38f86c9922d02673`

## Project Statistics

- **Smart Contracts**: 1 comprehensive Move module
- **Frontend Components**: 10+ reusable React components  
- **Pages**: 4 fully functional pages (Home, Create, My Profiles, Profile View)
- **Authentication Methods**: 4 (Wallet, Google, Facebook, Twitch, Passkey)
- **Transaction Types**: Sponsored and regular transactions
- **Mobile Responsive**: Optimized for all devices

## 🔧 Advanced Configuration

### Custom Theme Development
```typescript
// Add custom themes in src/lib/themes.ts
export const customTheme: ThemeStyles = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  textColor: '#ffffff',
  accentColor: '#FFD700',
  linkBackground: 'rgba(255, 255, 255, 0.1)',
};
```

### Smart Contract Integration
```typescript
// Profile creation with sponsored transactions
const createProfile = async (profileData: ProfileData) => {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::linktree::create_profile`,
    arguments: [
      tx.pure.string(profileData.username),
      tx.pure.string(profileData.displayName),
      tx.pure.string(profileData.bio),
    ],
  });
  return await executeSponsoredTransaction(tx);
};
```

## 🏆 Production Features

### User Experience
- **Zero-Click Authentication** - Seamless zkLogin integration
- **Gas-Free Operations** - Sponsored transactions for all users
- **Instant Updates** - Optimistic UI updates
- **Mobile-First Design** - Perfect mobile experience

### Developer Experience
- **Type Safety** - Full TypeScript coverage
- **Hot Reload** - Instant development feedback
- **Automated Testing** - Comprehensive test suites
- **CI/CD Ready** - Deployment automation

### Security & Performance
- **On-Chain Security** - Immutable profile data
- **Decentralized Storage** - Censorship-resistant hosting
- **Optimized Bundles** - Minimal loading times
- **Error Boundaries** - Graceful error handling

## 📈 Roadmap

- [x] Core LinkTree functionality
- [x] zkLogin authentication
- [x] Sponsored transactions
- [x] Multi-theme system
- [x] Walrus Sites deployment
- [x] SuiNS integration
- [x] Mobile optimization
- [x] QR code generation
- [x] Profile analytics
- [ ] NFT profile pictures
- [ ] Custom domain support
- [ ] Advanced analytics dashboard

## 🤝 Contributing

This is a complete, production-ready application. For contributions:

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add comprehensive tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

---

**QEDI** - The complete on-chain LinkTree solution. Built with modern technologies, deployed on decentralized infrastructure, and ready for production use.