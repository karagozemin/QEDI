# QEDI - On-Chain LinkTree Platform

<div align="center">
  <img src="frontend/public/logo.png" alt="QEDI Logo" width="120" height="120" />
</div>

**The Web3 LinkTree with Web2 Simplicity**

A production-ready full-stack decentralized application for creating and managing LinkTree profiles on Sui blockchain. Features zkLogin authentication (Google sign-in), sponsored transactions (zero gas fees), batch operations (PTB), and decentralized hosting on Walrus Sites.

## ✨ Key Features

### 🔐 Authentication & User Experience
- **zkLogin Integration**: Sign in with Google - no wallet setup required
- **Zero Gas Fees**: All transactions sponsored by backend via Enoki
- **Batch Operations**: Add 10 links in 1 transaction using PTB (Programmable Transaction Blocks)
- **Beautiful UI**: Animated DarkVeil background with WebGL effects
- **Mobile-First**: Fully responsive design optimized for all devices

### 🎨 Profile Management
- **Custom Profiles**: Username, display name, bio, avatar, theme
- **Batch Link Addition**: Add multiple social/web links at once (1 transaction)
- **On-Chain Storage**: Permanent, censorship-resistant data on Sui
- **Click Analytics**: Track link performance on-chain
- **Username Registry**: Human-readable profile URLs

### 🚀 Technical Excellence
- **Walrus Sites Hosting**: Decentralized frontend deployment
- **Smart Contract**: Production-ready Move contract on Sui
- **Backend API**: Node.js backend handling sponsored transactions
- **Full TypeScript**: Type-safe codebase throughout

### 🎯 What Makes QEDI Different
1. **Web2 UX, Web3 Security**: Google sign-in instead of complex wallet setup
2. **Truly Gasless**: Users pay $0 - backend sponsors everything via Enoki
3. **Batch Efficiency**: PTB technology enables multiple operations in single transaction
4. **Production-Ready**: Deployed and working on testnet with Walrus Sites

## 🏗 Architecture

```
QEDI/
├── frontend/                      # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/           # UI components (DarkVeil, Galaxy, etc.)
│   │   ├── pages/                # Home, Create, EditProfile, MyProfiles, Profile
│   │   ├── lib/                  # Sui client, Enoki integration, constants
│   │   └── App.tsx               # Main app with navbar and routing
│   └── public/                   # Logo and static assets
├── backend/                       # Node.js + Express
│   └── src/
│       └── server.ts             # Sponsored transaction endpoints
├── move/                          # Sui Move Smart Contracts
│   └── sources/
│       └── linktree.move         # Profile, Link, Registry structs
└── docs/                          # Documentation
    ├── SETUP.md
    ├── TASKS.md
    └── CURRENT_STATUS.md
```

### Smart Contract
**Module**: `qedi::linktree`
- `LinkTreeProfile`: username, display_name, bio, avatar_url, links[], theme
- `Link`: title, url, icon, click_count
- `UsernameRegistry`: Global username → profile_id mapping

**Key Functions**:
- `create_profile`: Create new profile with username
- `add_link`: Add link to profile (supports batching via PTB)
- `update_profile`: Update profile metadata
- `click_link`: Track link clicks on-chain

## 🚀 Live Deployment

### Frontend - Walrus Sites
- **Status**: ✅ Live on Walrus testnet
- **Hosting**: Decentralized, censorship-resistant
- **Performance**: Global CDN via Walrus network
- **Updates**: Immutable blob storage with versioning

### Backend - Sponsored Transactions
- **Status**: ✅ Running on testnet
- **Endpoints**: 
  - `/api/create-profile` - Sponsored profile creation
  - `/api/add-link` - Sponsored single link
  - `/api/add-multiple-links` - Sponsored batch links (NEW)
  - `/api/execute-transaction` - Execute signed transaction
- **Gas Sponsorship**: Powered by Enoki SDK

### Smart Contract
- **Network**: Sui Testnet
- **Package ID**: `0xb2d7a68d8711ceac4a5ee6c7fbec61456083d6ff20858b6d38f86c9922d02673`
- **Registry ID**: `0x6b879e03c806815ea844dcebcd44447250c8b9cdc9c7553d3443dfb00cc2ce77`
- **Status**: ✅ Deployed and verified

## 🛠 Technology Stack

### Blockchain & Infrastructure
- **Sui Blockchain** - High-performance L1 with Move language
- **Walrus Sites** - Decentralized hosting for frontend
- **Enoki SDK** - zkLogin authentication + sponsored transactions
- **PTB (Programmable Transaction Blocks)** - Batch operations

### Frontend
- **React 18** + **TypeScript** - Modern, type-safe development
- **Vite** - Lightning-fast build and HMR
- **TailwindCSS** - Utility-first styling
- **@mysten/dapp-kit** - Sui wallet integration
- **OGL (WebGL)** - DarkVeil animated backgrounds
- **React Router** - Client-side routing

### Backend
- **Node.js** + **Express** - Sponsored transaction server
- **TypeScript** - Type-safe backend code
- **@mysten/sui** - Sui SDK for transaction building
- **Enoki** - Gas sponsorship via Enoki API

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+ 
- **npm** or **yarn**
- **Enoki Account** (for zkLogin + sponsorship)
- **Google OAuth** credentials (for zkLogin)

### 1. Clone & Install

```bash
git clone <repository-url>
cd QEDI

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Configure Environment

**Frontend** (`frontend/.env.local`):
```env
# Enoki API Keys
VITE_ENOKI_API_KEY=your_public_key
VITE_ENOKI_PRIVATE_KEY=your_private_key

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# Smart Contract (already deployed)
VITE_PACKAGE_ID=0xb2d7a68d8711ceac4a5ee6c7fbec61456083d6ff20858b6d38f86c9922d02673
VITE_REGISTRY_ID=0x6b879e03c806815ea844dcebcd44447250c8b9cdc9c7553d3443dfb00cc2ce77

# Backend URL
VITE_BACKEND_URL=http://localhost:3001
```

**Backend** (`backend/.env`):
```env
# Enoki Keys
ENOKI_API_KEY=your_private_key

# Smart Contract
PACKAGE_ID=0xb2d7a68d8711ceac4a5ee6c7fbec61456083d6ff20858b6d38f86c9922d02673

# Network
SUI_NETWORK=testnet
PORT=3001
```

### 3. Run Development Servers

**Terminal 1 - Backend**:
```bash
cd backend
npm run build
node dist/server.js
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
```

Open http://localhost:5173 🎉

## 💡 How It Works

### User Flow

1. **Sign In**
   - Click "Sign In" → Choose Google
   - zkLogin creates Sui address from Google OAuth
   - No wallet installation needed

2. **Create Profile**
   - Enter username, bio, avatar
   - Click "Create Profile"
   - Backend sponsors transaction (user pays $0)
   - Profile stored on Sui blockchain

3. **Add Links (Batch Mode)**
   - Click "+ Add to List" for each link (Twitter, Instagram, etc.)
   - Links stored locally until ready
   - Click "Save All X Links (1 Transaction)"
   - Backend creates PTB with multiple `add_link` calls
   - Single sponsored transaction adds all links

4. **View & Share**
   - Profile accessible at custom URL
   - On-chain click tracking
   - Permanent, censorship-resistant

## 📱 Features Walkthrough

### Authentication
- **zkLogin (Google)**: One-click sign-in, no wallet needed
- **Regular Wallet**: Sui Wallet, Suiet, Ethos support
- Seamless switching between auth methods

### Profile Creation
- Multi-step wizard (Basic Info → Links → Review)
- Username uniqueness check
- Avatar upload or URL
- Custom themes
- Real-time validation

### Batch Link Management (NEW!)
- Add multiple links before saving
- Visual pending list with remove option
- "Save All" button creates single PTB transaction
- Works with both regular wallets AND zkLogin (sponsored)
- 10x more efficient than individual transactions

### UI/UX
- **DarkVeil Background**: WebGL-powered animated gradient
- **Responsive Design**: Mobile-first, works on all devices
- **Custom Logo**: Unique cat chain logo throughout
- **Clean Navbar**: Centered navigation, minimal clutter
- **Toast Notifications**: Success/error feedback

### Backend API Endpoints

```typescript
// Create profile (sponsored)
POST /api/create-profile
{
  sender: "0x...",
  username: "john",
  displayName: "John Doe",
  bio: "My bio",
  avatarUrl: "https://...",
  theme: "default"
}

// Add single link (sponsored)
POST /api/add-link
{
  profileId: "0x...",
  title: "Twitter",
  url: "https://twitter.com/john",
  icon: "twitter",
  sender: "0x..."
}

// Add multiple links (sponsored batch - NEW!)
POST /api/add-multiple-links
{
  profileId: "0x...",
  links: [
    { title: "Twitter", url: "...", icon: "twitter" },
    { title: "Instagram", url: "...", icon: "instagram" },
    { title: "Website", url: "...", icon: "website" }
  ],
  sender: "0x..."
}

// Execute signed transaction
POST /api/execute-transaction
{
  digest: "...",
  signature: "..."
}
```

## 📊 Project Stats

- **Lines of Code**: ~5,000+ (Move + TypeScript)
- **Smart Contract**: 447 lines of Move code
- **Frontend Components**: 8 React components + 6 pages
- **Backend Endpoints**: 4 sponsored transaction APIs
- **Supported Auth**: zkLogin (Google) + Regular Wallets
- **Deployment**: Walrus Sites (decentralized)
- **Gas Fees**: $0 for all users

## 🎯 Innovation Highlights

### 1. Batch Link Addition with Sponsorship
First LinkTree platform to combine:
- **PTB (Programmable Transaction Blocks)** for batching
- **Enoki sponsorship** for zero gas
- Works with **zkLogin** seamlessly

Example: Add 10 links → 1 transaction → $0 gas → 5 seconds

### 2. zkLogin + Sponsored TX at Scale
- Create profile: sponsored ✅
- Add single link: sponsored ✅  
- Add multiple links: sponsored ✅ (NEW!)
- All via Google login, no wallet setup

### 3. Full-Stack Decentralization
- Frontend: Walrus Sites (decentralized storage)
- Smart Contract: Sui blockchain (on-chain data)
- Backend: Node.js (can be decentralized with serverless)

### 4. Production-Ready UX
- WebGL animated backgrounds (DarkVeil)
- Mobile-responsive design
- Real-time validation
- Toast notifications
- Loading states
- Error handling

## 🔧 Development

### Build for Production

**Frontend**:
```bash
cd frontend
npm run build
# Output: frontend/dist/
```

**Backend**:
```bash
cd backend
npm run build
# Output: backend/dist/
```

### Deploy to Walrus Sites

```bash
cd frontend

# Build first
npm run build

# Update routes in dist/ws-resources.json
# Then upload to Walrus
./site-builder update --epochs 1 ./dist <SITE_OBJECT_ID>
```

### Testing

```bash
# Frontend linting
cd frontend
npm run lint

# Backend linting
cd backend
npm run lint

# Move contract tests
cd move
sui move test
```

## 🎨 Design & UX

### Visual Design
- **Logo**: Custom cat chain logo (unique branding)
- **Color Scheme**: Dark theme with blue/purple accents
- **Animations**: DarkVeil WebGL background (performance optimized)
- **Typography**: Inter font family, clean and modern
- **Icons**: Social media icons, custom SVGs

### User Experience
- **Onboarding**: 3-step profile creation wizard
- **Feedback**: Toast notifications for all actions
- **Loading States**: Spinners and progress indicators
- **Error Handling**: User-friendly error messages
- **Responsive**: Mobile-first, tablet, desktop optimized

### Accessibility
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- High contrast text

## 📈 Roadmap

### ✅ Completed (Phase 1 - Testnet)
- [x] Smart contract (Move) with username registry
- [x] zkLogin authentication (Google OAuth)
- [x] Sponsored transactions (create profile, add link)
- [x] Batch link addition (PTB + sponsorship)
- [x] Frontend deployed on Walrus Sites
- [x] Backend sponsorship server
- [x] DarkVeil animated backgrounds
- [x] Mobile-responsive design
- [x] Custom logo integration

### 🚧 In Progress (Phase 2)
- [ ] Mainnet deployment
- [ ] Gas fee optimization
- [ ] Enhanced analytics dashboard
- [ ] Profile themes (multiple options)

### 🔮 Future (Phase 3)
- [ ] SuiNS integration (.sui domains)
- [ ] NFT profile pictures
- [ ] Custom domain support (BYOD)
- [ ] Link monetization (payment gates)
- [ ] QR code generation
- [ ] Social sharing features
- [ ] Profile discovery/explore page

## 🔒 Security

- **Smart Contract**: Audited Move code with ownership checks
- **zkLogin**: Google OAuth via Enoki (no private keys stored)
- **Sponsored TX**: Backend validates sender before sponsoring
- **On-Chain Data**: Immutable, tamper-proof profiles
- **No Central DB**: All data on Sui blockchain

## 📝 License

MIT License - Open source and free to use

## 🙏 Acknowledgments

- **Sui Foundation** - For the amazing blockchain infrastructure
- **Mysten Labs** - For Sui SDK and tooling
- **Walrus Team** - For decentralized storage solution
- **Enoki** - For zkLogin and sponsorship capabilities

---

## 🚀 Quick Links

- **Live Demo**: Contact for testnet portal URL
- **Smart Contract**: [View on Sui Explorer](https://suiexplorer.com/object/0xb2d7a68d8711ceac4a5ee6c7fbec61456083d6ff20858b6d38f86c9922d02673?network=testnet)
- **Documentation**: See `/docs` folder
- **Support**: Open an issue on GitHub

---

**QEDI** - Making Web3 as easy as Web2, one profile at a time. 🐱⛓️