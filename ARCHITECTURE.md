# QEDI Architecture - DATA SECURITY & PRIVACY Track

## 🎯 Track Alignment: DATA SECURITY & PRIVACY

QEDI is built with **data security and privacy as core principles**, implementing cutting-edge cryptographic technologies and privacy-preserving mechanisms throughout the entire stack. This document details how QEDI addresses each requirement of the DATA SECURITY & PRIVACY track.

---

## 🏗 System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    QEDI - Privacy-First Architecture            │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Frontend   │      │   Backend    │      │  Blockchain  │
│  (Walrus)    │◄────►│  (Render)    │◄────►│    (Sui)      │
└──────────────┘      └──────────────┘      └──────────────┘
      │                     │                      │
      │                     │                      │
      ▼                     ▼                      ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  zkLogin     │      │  Seal SDK    │      │  Move Smart  │
│  (Enoki)     │      │  Encryption  │      │  Contracts   │
└──────────────┘      └──────────────┘      └──────────────┘
      │                     │                      │
      │                     │                      │
      ▼                     ▼                      ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  Verifiable  │      │  Fraud       │      │  Privacy     │
│  Storage     │      │  Detection   │      │  Controls    │
│  (Walrus)    │      │  System      │      │  (On-Chain)  │
└──────────────┘      └──────────────┘      └──────────────┘
```

---

## 🔐 Track Requirements Implementation

### 1. ✅ **Walrus - Verifiable Storage**

**Implementation:**
- **Avatar Storage**: All user avatars are uploaded to Walrus decentralized storage
- **Hash Verification**: SHA-256 hashes are calculated and stored on-chain for integrity verification
- **Immutable Blobs**: Content-addressed storage ensures data cannot be tampered with
- **Verifiable Retrieval**: Any user can verify avatar authenticity using on-chain hash

**Code Location:**
- `backend/src/walrus-upload.ts` - Upload service with hash calculation
- `move/sources/linktree.move` - `walrus_avatar_hash` field in profile struct

**Key Features:**
```typescript
// Hash calculation before upload
const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

// On-chain storage of hash
walrus_avatar_hash: String  // Stored in LinkTreeProfile
```

**Privacy Benefits:**
- Users can verify their avatar hasn't been modified
- Decentralized storage prevents single point of failure
- Content-addressed storage enables censorship resistance

---

### 2. ✅ **Seal SDK - Homomorphic Encryption**

**Implementation:**
- **Homomorphic Encryption**: Bio data encrypted using Microsoft SEAL (BFV scheme)
- **Zero-Knowledge Operations**: Encrypted data can be processed without decryption
- **Backward Compatibility**: Automatic fallback to AES-256-CBC for legacy data
- **Format Detection**: Smart decryption automatically detects Seal vs AES format

**Code Location:**
- `backend/src/privacy.ts` - Complete Seal encryption/decryption implementation

**Key Features:**
```typescript
// Seal encryption (homomorphic)
async function encryptWithSeal(data: string): Promise<string>
async function decryptWithSeal(encryptedData: string): Promise<string>

// Automatic format detection
if (isSealEncrypted(encryptedData)) {
  return await decryptWithSeal(encryptedData);
} else {
  return decryptAES(encryptedData); // Legacy support
}
```

**Privacy Benefits:**
- Bio data encrypted with homomorphic encryption (industry-leading security)
- Enables future privacy-preserving computations on encrypted data
- Backward compatible with existing AES-encrypted data

**Configuration:**
- Environment variable: `USE_SEAL=true` (default) to enable Seal encryption
- Lazy initialization for performance optimization

---

### 3. ✅ **Fraud Detection & Prevention**

**Implementation:**
- **Spam Link Detection**: Pattern matching against known spam URL patterns
- **Suspicious Keyword Detection**: Real-time analysis of URLs and content
- **Fraud Scoring**: Multi-factor fraud risk calculation (0-100 scale)
- **URL Validation**: Comprehensive validation including protocol, hostname, and security checks

**Code Location:**
- `backend/src/fraud-detection.ts` - Complete fraud detection system

**Key Features:**
```typescript
// Spam detection
detectSpamLink(url: string): boolean

// URL validation
validateLink(url: string): { valid: boolean; reason?: string }

// Fraud scoring
calculateFraudScore(profile: any): number  // 0-100 scale

// Review flagging
shouldFlagForReview(fraudScore: number): boolean  // Threshold: 30
```

**Detection Patterns:**
- URL shorteners (bit.ly, tinyurl.com, etc.)
- Affiliate links and tracking parameters
- Suspicious keywords (spam, scam, phishing, etc.)
- Local/internal IP addresses (security risk)
- Invalid protocols

**Privacy Benefits:**
- Protects users from malicious links
- Prevents spam and phishing attacks
- Maintains platform integrity without compromising user privacy

---

### 4. ✅ **Zero-Knowledge Proofs (zkLogin)**

**Implementation:**
- **zkLogin Integration**: Google OAuth authentication via Enoki SDK
- **Zero-Knowledge Authentication**: Users prove identity without revealing private keys
- **Privacy-Preserving Sign-In**: No wallet installation required, no key storage
- **Sponsored Transactions**: Gas fees sponsored by backend (zero cost to users)

**Code Location:**
- `frontend/src/lib/sui-client.ts` - zkLogin integration
- `backend/src/server.ts` - Sponsored transaction handling

**Key Features:**
```typescript
// zkLogin authentication
const enokiWallet = new EnokiWallet({
  apiKey: VITE_ENOKI_API_KEY,
  privateKey: VITE_ENOKI_PRIVATE_KEY,
});

// Sponsored transactions
const sponsored = await enokiClient.createSponsoredTransaction({
  transaction: txBytes,
  sender: senderAddress,
});
```

**Privacy Benefits:**
- Users authenticate without exposing private keys
- No wallet installation required (Web2 UX, Web3 security)
- Identity verification without revealing personal information
- Gas sponsorship ensures privacy (no transaction history linking)

---

### 5. ✅ **Verifiable Storage (Walrus Integration)**

**Implementation:**
- **Decentralized Storage**: All avatars stored on Walrus network
- **Hash Verification**: SHA-256 hashes stored on-chain for integrity
- **Content Addressing**: Immutable blob storage with versioning
- **Global CDN**: Fast retrieval via Walrus network

**Code Location:**
- `backend/src/walrus-upload.ts` - Upload and verification service
- `move/sources/linktree.move` - On-chain hash storage

**Verification Flow:**
```
1. User uploads avatar → Backend calculates SHA-256 hash
2. Avatar uploaded to Walrus → Returns blob ID
3. Hash + blob ID stored on-chain in profile
4. Any user can verify: Download from Walrus → Calculate hash → Compare with on-chain hash
```

**Privacy Benefits:**
- Immutable storage prevents tampering
- Decentralized network prevents censorship
- Hash verification ensures data integrity
- No single point of failure

---

### 6. ✅ **Privacy Solutions & GDPR Compliance**

**Implementation:**
- **Granular Privacy Controls**: Per-profile privacy settings
- **Encrypted Bio**: Optional bio encryption using Seal SDK
- **Private Profiles**: Profiles can be set to private with access control
- **GDPR Compliance**: Profile deletion endpoint for data removal requests
- **Access Control**: Viewer-based data filtering

**Code Location:**
- `backend/src/privacy.ts` - Privacy access control and filtering
- `backend/src/server.ts` - GDPR deletion endpoint
- `move/sources/linktree.move` - Privacy settings in smart contract

**Privacy Settings:**
```move
struct PrivacySettings {
    is_private: bool,           // Profile visibility
    show_bio: bool,             // Bio visibility
    show_links: bool,           // Links visibility
    allow_anonymous: bool,      // Anonymous viewing
}
```

**GDPR Features:**
- `/api/delete-profile-data` - Profile deletion endpoint
- Privacy settings update on-chain
- Sensitive data filtering based on viewer permissions
- Owner-only access to encrypted data

**Privacy Benefits:**
- Users control their data visibility
- Encrypted sensitive information (bio)
- GDPR-compliant data deletion
- Fine-grained access control

---

## 🏛 Architecture Layers

### Layer 1: Frontend (Privacy-Preserving Client)

**Technology Stack:**
- React 18 + TypeScript
- @mysten/dapp-kit (Sui wallet integration)
- Enoki SDK (zkLogin)
- Walrus Sites (decentralized hosting)

**Privacy Features:**
- zkLogin authentication (no private keys)
- Client-side validation
- No data storage in browser
- Direct blockchain interaction

**Files:**
```
frontend/
├── src/
│   ├── lib/
│   │   ├── sui-client.ts      # zkLogin + Sui client
│   │   └── constants.ts       # Configuration
│   ├── pages/
│   │   ├── Profile.tsx        # Profile display with privacy controls
│   │   └── Create.tsx         # Profile creation
│   └── components/
│       └── DonationModal.tsx  # Privacy-aware donation
```

---

### Layer 2: Backend (Security & Privacy Service)

**Technology Stack:**
- Node.js + Express
- Seal SDK (homomorphic encryption)
- Enoki SDK (sponsored transactions)
- Walrus API (verifiable storage)

**Privacy Services:**
- `privacy.ts` - Encryption, decryption, access control
- `fraud-detection.ts` - Spam detection, fraud scoring
- `walrus-upload.ts` - Verifiable storage uploads
- `server.ts` - API endpoints with privacy controls

**Key Endpoints:**
```
POST /api/encrypt-bio          # Seal encryption
POST /api/check-fraud          # Fraud detection
POST /api/upload-avatar        # Walrus upload with hash
DELETE /api/delete-profile-data # GDPR compliance
```

---

### Layer 3: Blockchain (On-Chain Privacy)

**Technology Stack:**
- Sui Move smart contracts
- On-chain privacy settings
- Hash storage for verification

**Privacy Features:**
```move
struct LinkTreeProfile {
    // Public fields
    id: UID,
    username: String,
    display_name: String,
    
    // Privacy-controlled fields
    bio: String,                    // Can be encrypted
    encrypted_bio: String,          // Seal-encrypted
    is_private: bool,               // Privacy flag
    privacy_settings: PrivacySettings,
    
    // Verifiable storage
    walrus_avatar_hash: String,     // Hash for verification
    
    // zkLogin fields (private)
    zklogin_provider: String,
    zklogin_sub: String,
}
```

**Privacy Functions:**
- `set_privacy_settings()` - Update privacy controls
- `update_profile()` - Update with privacy checks
- On-chain access control enforcement

---

## 🔒 Security Architecture

### Encryption Flow

```
User Input (Bio)
    │
    ▼
┌─────────────────┐
│  Seal SDK       │  ← Homomorphic Encryption
│  (BFV Scheme)   │
└─────────────────┘
    │
    ▼
Encrypted Data (seal:base64...)
    │
    ▼
┌─────────────────┐
│  On-Chain       │  ← Stored in Move contract
│  Storage        │
└─────────────────┘
    │
    ▼
Decryption (Owner Only)
    │
    ▼
Original Bio
```

### Fraud Detection Flow

```
User Submits Link
    │
    ▼
┌─────────────────┐
│  URL Validation │  ← Protocol, hostname checks
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  Spam Detection │  ← Pattern matching
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  Fraud Scoring  │  ← Multi-factor analysis
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  Review Flag    │  ← Threshold: 30/100
└─────────────────┘
```

### Verifiable Storage Flow

```
Avatar Upload
    │
    ▼
┌─────────────────┐
│  Hash Calculation│  ← SHA-256
│  (SHA-256)      │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  Walrus Upload  │  ← Decentralized storage
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  On-Chain Hash  │  ← Stored in profile
└─────────────────┘
    │
    ▼
Verification (Any User)
    │
    ▼
Hash Match = Authentic ✅
```

---

## 🛡 Privacy by Design Principles

### 1. **Data Minimization**
- Only collect necessary data (username, display name, bio, links)
- Optional fields (bio encryption, privacy settings)
- No tracking or analytics without consent

### 2. **Encryption at Rest**
- Bio data encrypted with Seal SDK (homomorphic)
- On-chain storage of encrypted data
- Keys managed securely in backend

### 3. **Access Control**
- Granular privacy settings per profile
- Owner-only access to encrypted data
- Viewer-based data filtering

### 4. **Verifiable Integrity**
- Walrus hash verification for avatars
- On-chain hash storage
- Immutable blockchain records

### 5. **Zero-Knowledge Authentication**
- zkLogin for privacy-preserving sign-in
- No private key storage
- Sponsored transactions (no transaction linking)

### 6. **Fraud Prevention**
- Real-time spam detection
- Fraud scoring system
- URL validation and security checks

### 7. **GDPR Compliance**
- Profile deletion endpoint
- Privacy settings update
- Data minimization principles

---

## 📊 Track Requirements Checklist

| Requirement | Status | Implementation |
|------------|--------|----------------|
| **Walrus** | ✅ | Avatar uploads with hash verification |
| **Seal SDK** | ✅ | Homomorphic encryption for bio data |
| **Fraud Detection** | ✅ | Spam detection, fraud scoring system |
| **Zero-Knowledge Proofs** | ✅ | zkLogin authentication via Enoki |
| **Verifiable Storage** | ✅ | Walrus integration with on-chain hashes |
| **Privacy Solutions** | ✅ | Granular privacy controls, GDPR compliance |
| **Sui Stack** | ✅ | Move smart contracts, Sui blockchain |

---

## 🚀 Deployment Architecture

### Frontend (Walrus Sites)
- **Hosting**: Decentralized Walrus network
- **URL**: `https://qedi.trwal.app`
- **Features**: Immutable blob storage, global CDN
- **Privacy**: No server-side tracking, client-side only

### Backend (Render)
- **Hosting**: Render cloud platform
- **URL**: `https://qedi.onrender.com`
- **Features**: Sponsored transactions, encryption services
- **Privacy**: Encrypted data handling, no user data storage

### Blockchain (Sui Testnet)
- **Network**: Sui Testnet
- **Package ID**: `0x80290a4621d25a18c7d37cbc83dae3e85f05460ad13649b9f689100a2967e03a`
- **Registry ID**: `0x73ea10e7cfde7d60cfc5d712e4883f7845a7783a55c9be6183782cf971ae87de`
- **Privacy**: On-chain privacy settings, encrypted data storage

---

## 🔐 Security Best Practices

1. **Encryption**: Seal SDK for sensitive data (homomorphic)
2. **Verification**: SHA-256 hashes for data integrity
3. **Access Control**: Granular privacy settings
4. **Fraud Prevention**: Real-time detection and scoring
5. **Zero-Knowledge**: zkLogin for authentication
6. **Decentralization**: Walrus for censorship resistance
7. **GDPR Compliance**: Data deletion and privacy controls

---

## 📈 Future Privacy Enhancements

- [ ] Multi-party computation for encrypted data analysis
- [ ] Differential privacy for analytics
- [ ] Private link click tracking
- [ ] Encrypted profile sharing
- [ ] Zero-knowledge profile verification
- [ ] Privacy-preserving profile discovery

---

**QEDI** - Privacy by design, security by default. 🔒

