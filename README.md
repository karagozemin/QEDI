# QEDI - Complete On-Chain LinkTree Platform

> A fully-featured, decentralized LinkTree alternative built on Sui blockchain and hosted on Walrus Sites. This is a production-ready application with advanced features including zkLogin authentication, sponsored transactions, and comprehensive profile management.

## 🚀 Complete Feature Set

### Core Features (Production Ready)
- **zkLogin Authentication** - Seamless login with Google, Facebook, and Twitch
- **Sponsored Transactions** - Zero gas fees for users via Enoki SDK
- **On-Chain Profile Management** - Fully decentralized profile storage
- **Walrus Decentralized Storage** - Avatar and asset storage on Walrus network
- **SuiNS Domain Integration** - Custom .sui domains for profiles
- **Dynamic Username Registry** - Human-readable profile URLs

### Advanced Features (Full Implementation)
- **Multi-Theme System** - 6 professionally designed themes (Classic, Dark, Gradient, Minimal, Cyberpunk, Nature)
- **Drag & Drop Link Management** - Intuitive link reordering interface
- **Real-time Profile Preview** - Live preview while editing
- **QR Code Generation** - Automatic QR codes for profile sharing
- **Social Media Integration** - Dedicated social link categories
- **Mobile-Responsive Design** - Optimized for all devices
- **Profile Analytics** - On-chain event tracking
- **Bulk Operations** - Mass link management capabilities

### Technical Excellence
- **Smart Contract Architecture** - Modular Move contracts with comprehensive testing
- **Modern Frontend Stack** - React 18, TypeScript, Vite, TailwindCSS
- **Professional UI Components** - shadcn/ui integration
- **State Management** - Zustand for optimal performance
- **Error Handling** - Comprehensive error boundaries and user feedback
- **Loading States** - Skeleton loaders and optimistic updates

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

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Sui CLI
- Walrus CLI
- Git

### Installation
```bash
# Clone repository
git clone https://github.com/karagozemin/QEDI-.git
cd QEDI

# Install frontend dependencies
cd frontend
npm install

# Start development server
npm run dev
```

### Environment Setup
```bash
# Copy environment template
cp frontend/env.local.example frontend/.env.local

# Configure your API keys
VITE_ENOKI_API_KEY=your_enoki_api_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### Smart Contract Deployment
```bash
# Build and deploy contracts
cd move
sui move build
sui client publish --gas-budget 100000000
```

## 🌐 Live Demo

- **Walrus Sites URL**: `https://[site-id].trwal.app/`
- **Custom Domain**: `https://qedi.trwal.app/` (via SuiNS)
- **Testnet Explorer**: View contracts on Sui testnet explorer

## 📊 Project Statistics

- **Smart Contracts**: 2 Move modules with comprehensive functionality
- **Frontend Components**: 15+ reusable React components
- **Pages**: 6 fully functional pages
- **Themes**: 6 professionally designed themes
- **Test Coverage**: Comprehensive Move contract testing
- **Documentation**: Complete setup and API documentation

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