# QEDİ - İş Bölümü ve Görevler

## 🎯 Proje Durumu

### ✅ Tamamlanan Görevler

- [x] Proje yapısı oluşturuldu
- [x] React + Vite + TypeScript kurulumu
- [x] Enoki SDK entegrasyonu (zkLogin)
- [x] Auth Context ve Login sistemi
- [x] Sui dApp Kit kurulumu
- [x] Temel layout (Navbar) ve routing
- [x] Landing sayfası
- [x] Auth callback sayfası

### 🔄 Devam Eden Görevler

#### Öncelik 1: Smart Contract (Kritik)
- [ ] Move contract: LinkTreeProfile struct ve fonksiyonlar
- [ ] Move contract: Registry (username mapping)
- [ ] Contract testleri
- [ ] Testnet'e deploy

#### Öncelik 2: Core Features
- [ ] Profil oluşturma sayfası ve transaction
- [ ] Profil görüntüleme sayfası
- [ ] Profil düzenleme sayfası
- [ ] Walrus entegrasyonu (avatar upload)

#### Öncelik 3: Extra Features
- [ ] Tema sistemi (6 tema)
- [ ] Explore sayfası (profil listesi)
- [ ] QR kod generator
- [ ] Share butonu

#### Öncelik 4: Deployment
- [ ] Walrus Sites deployment
- [ ] SuiNS domain bağlantısı
- [ ] Test ve polish

---

## 👥 İş Bölümü

### 🔵 SENIN GÖREVLERİN (Ana Geliştirici)

**Smart Contract (Kritik - %100 Öncelik)**
- LinkTreeProfile ve Link struct'ları
- create_profile, update_profile fonksiyonları
- add_link, remove_link, update_avatar fonksiyonları
- Registry modülü (dynamic fields)
- Deploy ve test

**Frontend Core Features**
- Profil oluşturma sayfası
- Profil görüntüleme sayfası
- Profil düzenleme sayfası
- Transaction builder'lar
- Blockchain entegrasyonu

**Deployment**
- Walrus Sites deployment
- SuiNS konfigürasyonu
- Production build

### 🟢 ARKADAŞININ GÖREVLERİ (Backend/Tools)

**Move Öğrenme & Testing**
- Move Book oku (https://move-book.com/move-basics/)
- Contract testleri yaz
- CLI test komutları dokümante et

**Backend Tooling**
- Walrus upload service (Node.js)
- Image optimization script
- Bulk avatar upload tool
- Deploy automation script

**Optional Frontend Support**
- Tema CSS dosyaları
- Explore sayfası geliştirme
- QR kod özelliği

---

## 📅 Zaman Çizelgesi (7 Gün)

### Gün 1-2: Foundation ✅ (Tamamlandı!)
- [x] Proje setup
- [x] Auth sistemi
- [x] Landing sayfası

### Gün 3: Smart Contract
- [ ] Move contract yaz
- [ ] Deploy et
- [ ] Test et

### Gün 4: Profile Creation
- [ ] Profil oluşturma UI
- [ ] Transaction builder
- [ ] Walrus avatar upload

### Gün 5: Profile Display & Edit
- [ ] Profil görüntüleme
- [ ] Profil düzenleme
- [ ] Tema sistemi

### Gün 6: Polish & Testing
- [ ] Explore sayfası
- [ ] Bug fix
- [ ] Mobile responsive

### Gün 7: Deployment
- [ ] Walrus Sites
- [ ] SuiNS
- [ ] Demo video

---

## 🔗 Önemli Linkler

**Sui & Move**
- https://move-book.com/
- https://docs.sui.io/guides/developer/sui-101
- https://docs.sui.io/guides/developer/getting-started/hello-world

**Walrus**
- https://docs.wal.app/
- https://docs.wal.app/walrus-sites/tutorial-publish.html

**Enoki (zkLogin)**
- https://docs.enoki.mystenlabs.com/
- https://github.com/MystenLabs/sui-move-community-modules/tree/main/module_5

**dApp Kit**
- https://sdk.mystenlabs.com/dapp-kit
- https://sdk.mystenlabs.com/dapp-kit/create-dapp

**SuiNS**
- https://docs.suins.io/
- https://testnet.suins.io/

---

## 🎮 Nasıl Çalışıyoruz?

### Git Workflow

```bash
# Ana branch: main
# Senin branch'in: feature/core
# Arkadaşının branch'i: feature/backend-tools

# Günlük workflow
git checkout feature/core
git pull origin main
# ... kod yaz ...
git add .
git commit -m "feat: add profile creation page"
git push origin feature/core
```

### İletişim
- Her gün Discord/WhatsApp'ta güncelleme
- Büyük değişikliklerden önce haber ver
- Merge'den önce bildir

### Code Review
- Pull request aç
- En az 1 review al
- Konfliktleri çöz
- Merge et

---

## 🚨 Acil Durumlar

**Contract deploy edilemezse:**
1. Faucet'ten token al
2. Gas budget'i artır
3. Syntax hatalarını kontrol et

**Frontend çalışmazsa:**
1. `npm install` yap
2. `.env.local` dosyasını kontrol et
3. Node_modules'u sil ve tekrar kur

**zkLogin çalışmazsa:**
1. Enoki API key kontrol et
2. Google OAuth redirect URI kontrol et
3. Console'da hataları incele

---

## ✅ Definition of Done

Bir görev bitmiş sayılır:
- [ ] Kod yazıldı ve çalışıyor
- [ ] Test edildi (manuel veya otomatik)
- [ ] Dokümante edildi
- [ ] Git'e push edildi
- [ ] Takım arkadaşına haber verildi

---

**Son Güncelleme:** 24 Ekim 2025  
**Proje Durumu:** 🟢 İlk aşama tamamlandı, smart contract'a geçildi

