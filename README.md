# QEDİ - On-Chain LinkTree on Sui

> Walrus Sites üzerinde barındırılan, Sui blockchain tabanlı merkeziyetsiz LinkTree alternatifi

## 🎯 Özellikler

- ✅ zkLogin ile kolay giriş (Google, Facebook, Twitch)
- ✅ Sponsored Transactions (gas ücreti yok!)
- ✅ On-chain profil yönetimi
- ✅ Walrus decentralized storage
- ✅ SuiNS domain desteği
- ✅ Özelleştirilebilir temalar

## 🏗️ Proje Yapısı

```
QEDİ/
├── frontend/          # React + Vite + TypeScript
├── move/             # Sui Move smart contracts
├── scripts/          # Deployment ve automation
└── docs/            # Dokümantasyon
```

## 🚀 Hızlı Başlangıç

```bash
# Frontend
cd frontend
npm install
npm run dev

# Move contract
cd move
sui move build
sui client publish --gas-budget 100000000
```

## 📦 Teknolojiler

- **Blockchain:** Sui Network (Testnet)
- **Frontend:** React 18 + Vite + TypeScript
- **Auth:** Enoki SDK (zkLogin + Sponsored Transactions)
- **Storage:** Walrus
- **Styling:** TailwindCSS + shadcn/ui
- **SDK:** @mysten/sui.js + @mysten/dapp-kit

## 📝 Lisans

MIT

