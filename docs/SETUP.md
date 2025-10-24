# QEDI - Setup Guide

## Prerequisites

- Node.js 18+ and npm
- Sui CLI (https://docs.sui.io/guides/developer/getting-started/sui-install)
- Walrus CLI (https://docs.wal.app/usage/setup.html)
- Git

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/karagozemin/QEDI-.git
cd QEDI
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

### 3. Environment Variables

Create `.env.local` file:

```bash
cp env.local.example .env.local
```

Fill in the following values:

#### Get Enoki API Key

1. Visit https://getenoki.com/
2. Sign up / Sign in
3. Create API Key
4. Paste into `VITE_ENOKI_API_KEY`

#### Get Google OAuth Client ID

1. Visit https://console.cloud.google.com/
2. Create new project
3. Go to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth 2.0 Client ID"
5. Application type: "Web application"
6. Authorized redirect URIs: 
   - `http://localhost:5173/auth/callback`
   - `https://yourdomain.com/auth/callback`
7. Copy Client ID
8. Paste into `VITE_GOOGLE_CLIENT_ID`

### 4. Development Server

```bash
npm run dev
```

Frontend: http://localhost:5173

## Move Contract Deployment

### 1. Sui Wallet Setup

```bash
# Initialize Sui client
sui client

# Switch to testnet
sui client switch --env testnet

# Show active address
sui client active-address

# Get tokens from faucet
curl --location --request POST 'https://faucet.testnet.sui.io/gas' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "FixedAmountRequest": {
      "recipient": "YOUR_ADDRESS_HERE"
    }
  }'
```

### 2. Contract Build & Deploy

```bash
cd move
sui move build
sui client publish --gas-budget 100000000
```

Save `Package ID` and `Registry Object ID` from deploy output.

### 3. Update Frontend Config

Update `.env.local` file:

```
VITE_PACKAGE_ID=0x...
VITE_REGISTRY_ID=0x...
```

## Testing

```bash
# Frontend tests
cd frontend
npm run test

# Move tests
cd move
sui move test
```

## Production Build

```bash
cd frontend
npm run build
```

Build files are created in `dist/` folder.

## Walrus Sites Deployment

```bash
# Install site builder
# https://docs.wal.app/walrus-sites/tutorial-install.html

# Deploy
site-builder deploy ./frontend/dist --epochs 10
```

## SuiNS Domain

1. Visit https://testnet.suins.io/
2. Purchase your desired `.sui` domain
3. Point domain to Walrus Site object ID

## Troubleshooting

### "Module not found" error

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Wallet not connecting

- Make sure Sui Wallet extension is installed
- Check that network is set to testnet

### zkLogin not working

- Verify Enoki API key is correct
- Check Google OAuth redirect URIs are correct

## More Information

- [Sui Documentation](https://docs.sui.io/)
- [Walrus Documentation](https://docs.wal.app/)
- [Enoki Documentation](https://docs.enoki.mystenlabs.com/)
- [dApp Kit Documentation](https://sdk.mystenlabs.com/dapp-kit)