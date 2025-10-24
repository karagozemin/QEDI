# QEDİ - Setup Guide

## 📋 Prerequisites

- Node.js 18+ ve npm
- Sui CLI (https://docs.sui.io/guides/developer/getting-started/sui-install)
- Walrus CLI (https://docs.wal.app/usage/setup.html)
- Git

## 🚀 Kurulum

### 1. Projeyi Klonlayın

```bash
git clone https://github.com/yourusername/QEDİ.git
cd QEDİ
```

### 2. Frontend Kurulumu

```bash
cd frontend
npm install
```

### 3. Environment Variables

`.env.local` dosyası oluşturun:

```bash
cp env.local.example .env.local
```

Aşağıdaki değerleri doldurun:

#### Enoki API Key Alma

1. https://getenoki.com/ adresine gidin
2. Kayıt olun / Giriş yapın
3. API Key oluşturun
4. `VITE_ENOKI_API_KEY` değerine yapıştırın

#### Google OAuth Client ID Alma

1. https://console.cloud.google.com/ adresine gidin
2. Yeni proje oluşturun
3. "APIs & Services" > "Credentials"
4. "Create Credentials" > "OAuth 2.0 Client ID"
5. Application type: "Web application"
6. Authorized redirect URIs: 
   - `http://localhost:5173/auth/callback`
   - `https://yourdomain.com/auth/callback`
7. Client ID'yi kopyalayın
8. `VITE_GOOGLE_CLIENT_ID` değerine yapıştırın

### 4. Development Server

```bash
npm run dev
```

Frontend: http://localhost:5173

## 🏗️ Move Contract Deployment

### 1. Sui Wallet Setup

```bash
# Sui client başlat
sui client

# Testnet'e geç
sui client switch --env testnet

# Aktif adresi göster
sui client active-address

# Faucet'ten token al
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

Deploy çıktısından `Package ID` ve `Registry Object ID`'yi kaydedin.

### 3. Update Frontend Config

`.env.local` dosyasını güncelleyin:

```
VITE_PACKAGE_ID=0x...
VITE_REGISTRY_ID=0x...
```

## 🧪 Test

```bash
# Frontend testleri
cd frontend
npm run test

# Move testleri
cd move
sui move test
```

## 📦 Production Build

```bash
cd frontend
npm run build
```

Build dosyaları `dist/` klasöründe oluşur.

## 🌐 Walrus Sites Deployment

```bash
# Site builder kur
# https://docs.wal.app/walrus-sites/tutorial-install.html

# Deploy
site-builder deploy ./frontend/dist --epochs 10
```

## 🔗 SuiNS Domain

1. https://testnet.suins.io/ adresine gidin
2. İstediğiniz `.sui` domainini alın
3. Domain'i Walrus Site object ID'ye yönlendirin

## 🐛 Troubleshooting

### "Module not found" hatası

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Wallet bağlanmıyor

- Sui Wallet extension'ı yüklü olduğundan emin olun
- Network'ün testnet olduğunu kontrol edin

### zkLogin çalışmıyor

- Enoki API key'in doğru olduğundan emin olun
- Google OAuth redirect URI'lerinin doğru olduğunu kontrol edin

## 📚 Daha Fazla Bilgi

- [Sui Documentation](https://docs.sui.io/)
- [Walrus Documentation](https://docs.wal.app/)
- [Enoki Documentation](https://docs.enoki.mystenlabs.com/)
- [dApp Kit Documentation](https://sdk.mystenlabs.com/dapp-kit)

