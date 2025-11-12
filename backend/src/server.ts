import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { EnokiClient } from '@mysten/enoki';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { toBase64 } from '@mysten/sui/utils';
import multer from 'multer';
import { detectSpamLink, validateLink, calculateFraudScore } from './fraud-detection';
import { encryptData, decryptData, checkPrivacyAccess, filterProfileData } from './privacy';
import { uploadAvatarToWalrus, getWalrusUrl } from './walrus-upload';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize clients
const suiClient = new SuiClient({ 
  url: getFullnodeUrl(process.env.SUI_NETWORK as 'testnet' | 'mainnet' || 'testnet') 
});

const enokiClient = new EnokiClient({
  apiKey: process.env.ENOKI_PRIVATE_KEY!
});

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:3000',
    'https://qedi.trwal.app',
    'https://qedi.sui'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'QEDI Backend API',
    network: process.env.SUI_NETWORK || 'testnet',
    packageId: process.env.PACKAGE_ID,
    registryId: process.env.REGISTRY_ID
  });
});

// Create Profile - Sponsored Transaction
app.post('/api/create-profile', async (req, res) => {
  try {
    const { 
      sender, 
      username, 
      displayName, 
      bio, 
      avatarUrl, 
      theme,
      // Privacy fields (optional, backward compatible)
      isPrivate,
      privacySettings,
      walrusAvatarHash,
      encryptedBio,
      // zkLogin fields (optional)
      zkLoginProvider,
      zkLoginSub
    } = req.body;

    console.log('Creating profile for:', sender);
    console.log('Profile data:', { username, displayName, bio, theme, isPrivate, zkLoginProvider });

    // Validate required fields
    if (!sender || !username || !displayName) {
      return res.status(400).json({ 
        error: 'Missing required fields: sender, username, displayName' 
      });
    }

    // Fraud detection on links if provided (for future batch creation)
    // This is handled separately when links are added

    // Parse privacy settings with defaults
    const isPri = isPrivate === true || isPrivate === 'true';
    const privSettings = privacySettings || {};
    const showBio = privSettings.show_bio !== false && privSettings.show_bio !== 'false';
    const showLinks = privSettings.show_links !== false && privSettings.show_links !== 'false';
    const allowAnon = privSettings.allow_anonymous !== false && privSettings.allow_anonymous !== 'false';
    const walrusHash = walrusAvatarHash || '';
    
    // Parse zkLogin fields
    const zkProvider = zkLoginProvider || '';
    const zkSub = zkLoginSub || '';

    console.log('Privacy settings:', { isPri, showBio, showLinks, allowAnon, walrusHash });
    console.log('zkLogin info:', { zkProvider, zkSub });

    // Create the transaction
    const tx = new Transaction();
    tx.moveCall({
      target: `${process.env.PACKAGE_ID}::linktree::create_profile`,
      arguments: [
        tx.object(process.env.REGISTRY_ID!),
        tx.pure.string(username),
        tx.pure.string(displayName),
        tx.pure.string(bio || ''),
        tx.pure.string(avatarUrl || ''),
        tx.pure.string(theme || 'default'),
        tx.pure.bool(isPri),
        tx.pure.bool(showBio),
        tx.pure.bool(showLinks),
        tx.pure.bool(allowAnon),
        tx.pure.string(walrusHash),
        tx.pure.string(zkProvider),
        tx.pure.string(zkSub),
        tx.object('0x6') // Clock object
      ],
    });

    // Build transaction bytes
    const txBytes = await tx.build({
      client: suiClient,
      onlyTransactionKind: true,
    });

    // Create sponsored transaction with Enoki
    const sponsored = await enokiClient.createSponsoredTransaction({
      network: process.env.SUI_NETWORK as 'testnet' | 'mainnet' || 'testnet',
      transactionKindBytes: toBase64(txBytes),
      sender,
      allowedMoveCallTargets: [`${process.env.PACKAGE_ID}::linktree::create_profile`],
      allowedAddresses: [sender],
    });

    console.log('Sponsored transaction created:', {
      digest: sponsored.digest,
      bytesLength: sponsored.bytes.length
    });

    res.json({ 
      digest: sponsored.digest,
      bytes: sponsored.bytes 
    });

  } catch (error) {
    console.error('Create profile transaction failed:', error);
    
    // Log more details for debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Log environment variables (without sensitive data)
    console.error('Environment check:', {
      hasEnokiPrivateKey: !!process.env.ENOKI_PRIVATE_KEY,
      enokiKeyLength: process.env.ENOKI_PRIVATE_KEY?.length,
      packageId: process.env.PACKAGE_ID,
      network: process.env.SUI_NETWORK,
      registryId: process.env.REGISTRY_ID
    });
    
    res.status(500).json({ 
      error: 'Failed to create sponsored transaction',
      details: error instanceof Error ? error.message : String(error),
      debug: {
        hasEnokiKey: !!process.env.ENOKI_PRIVATE_KEY,
        network: process.env.SUI_NETWORK,
        packageId: process.env.PACKAGE_ID
      }
    });
  }
});

// Create Add Link Sponsored Transaction
app.post('/api/add-link', async (req, res) => {
  try {
    const { profileId, title, url, icon, sender } = req.body;

    console.log('Creating add link sponsored transaction:', {
      profileId: `${profileId.slice(0, 8)}...${profileId.slice(-4)}`,
      title,
      url,
      icon,
      sender: `${sender.slice(0, 8)}...${sender.slice(-4)}`
    });

    // Fraud detection
    const linkValidation = validateLink(url);
    if (!linkValidation.valid) {
      return res.status(400).json({
        error: 'Invalid link',
        reason: linkValidation.reason,
        fraudDetected: detectSpamLink(url)
      });
    }

    const isSpam = detectSpamLink(url);
    if (isSpam) {
      console.warn('⚠️ Spam link detected:', url);
      // Still allow but warn (user can override)
      // In production, you might want to block or require admin approval
    }

    // Create the add link transaction
    const tx = new Transaction();
    tx.moveCall({
      target: `${process.env.PACKAGE_ID}::linktree::add_link`,
      arguments: [
        tx.object(profileId),
        tx.pure.string(title),
        tx.pure.string(url),
        tx.pure.string(icon),
        tx.object('0x6'), // Clock object ID
      ],
    });

    // Set sender for zkLogin users
    if (sender) {
      tx.setSender(sender);
    }

    // Build transaction bytes
    const txBytes = await tx.build({
      client: suiClient,
      onlyTransactionKind: true,
    });

    // Create sponsored transaction
    const sponsored = await enokiClient.createSponsoredTransaction({
      transactionKindBytes: toBase64(txBytes),
      network: (process.env.SUI_NETWORK as any) || 'testnet',
      sender: sender,
      allowedMoveCallTargets: [`${process.env.PACKAGE_ID}::linktree::add_link`],
      allowedAddresses: [sender]
    });

    console.log('Add link sponsored transaction created:', {
      digest: sponsored.digest,
      bytesLength: sponsored.bytes.length
    });

    res.json({ 
      digest: sponsored.digest,
      bytes: sponsored.bytes,
      fraudWarning: isSpam ? 'This link appears to be spam. Please verify before adding.' : undefined
    });

  } catch (error) {
    console.error('Add link transaction failed:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      profileId: req.body.profileId,
      title: req.body.title,
      url: req.body.url,
      icon: req.body.icon,
      sender: req.body.sender
    });
    
    res.status(500).json({ 
      error: 'Failed to create add link sponsored transaction',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Create Add Multiple Links Sponsored Transaction (Batch)
app.post('/api/add-multiple-links', async (req, res) => {
  try {
    const { profileId, links, sender } = req.body;

    console.log('Creating batch add links sponsored transaction:', {
      profileId: `${profileId.slice(0, 8)}...${profileId.slice(-4)}`,
      linksCount: links?.length || 0,
      sender: `${sender.slice(0, 8)}...${sender.slice(-4)}`
    });

    // Validate inputs
    if (!profileId || !links || !Array.isArray(links) || links.length === 0) {
      return res.status(400).json({ 
        error: 'Missing required fields: profileId, links (array)' 
      });
    }

    if (!sender) {
      return res.status(400).json({ 
        error: 'Missing required field: sender' 
      });
    }

    // Batch fraud detection
    const validationResults = links.map((link: { title: string; url: string; icon: string }) => ({
      title: link.title,
      url: link.url,
      validation: validateLink(link.url),
      isSpam: detectSpamLink(link.url)
    }));

    const invalidLinks = validationResults.filter(r => !r.validation.valid);
    const spamLinks = validationResults.filter(r => r.isSpam);

    if (invalidLinks.length > 0) {
      return res.status(400).json({
        error: 'Some links are invalid',
        invalidLinks: invalidLinks.map(l => ({ url: l.url, reason: l.validation.reason }))
      });
    }

    if (spamLinks.length > 0) {
      console.warn('⚠️ Spam links detected in batch:', spamLinks.map(l => l.url));
      // Warn but continue (user can override)
    }

    // Create PTB with multiple add_link calls
    const tx = new Transaction();
    
    links.forEach((link: { title: string; url: string; icon: string }) => {
      tx.moveCall({
        target: `${process.env.PACKAGE_ID}::linktree::add_link`,
        arguments: [
          tx.object(profileId),
          tx.pure.string(link.title),
          tx.pure.string(link.url),
          tx.pure.string(link.icon),
          tx.object('0x6'), // Clock object ID
        ],
      });
    });

    // Set sender for zkLogin users
    tx.setSender(sender);

    // Build transaction bytes
    const txBytes = await tx.build({
      client: suiClient,
      onlyTransactionKind: true,
    });

    // Create sponsored transaction
    const sponsored = await enokiClient.createSponsoredTransaction({
      transactionKindBytes: toBase64(txBytes),
      network: (process.env.SUI_NETWORK as any) || 'testnet',
      sender: sender,
      allowedMoveCallTargets: [`${process.env.PACKAGE_ID}::linktree::add_link`],
      allowedAddresses: [sender]
    });

    console.log('Batch add links sponsored transaction created:', {
      digest: sponsored.digest,
      bytesLength: sponsored.bytes.length,
      linksCount: links.length
    });

    res.json({ 
      digest: sponsored.digest,
      bytes: sponsored.bytes,
      validationResults,
      spamWarnings: spamLinks.length > 0 ? `Warning: ${spamLinks.length} link(s) appear to be spam.` : undefined
    });

  } catch (error) {
    console.error('Batch add links transaction failed:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      profileId: req.body.profileId,
      linksCount: req.body.links?.length,
      sender: req.body.sender
    });
    
    res.status(500).json({ 
      error: 'Failed to create batch add links sponsored transaction',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Execute Sponsored Transaction
app.post('/api/execute-transaction', async (req, res) => {
  try {
    const { digest, signature } = req.body;

    console.log('Executing sponsored transaction:', {
      digest: `${digest.slice(0, 8)}...${digest.slice(-4)}`,
      signatureLength: signature?.length
    });

    // Validate required fields
    if (!digest || !signature) {
      return res.status(400).json({ 
        error: 'Missing required fields: digest, signature' 
      });
    }

    // Execute the sponsored transaction with Enoki
    const result = await enokiClient.executeSponsoredTransaction({
      digest,
      signature,
    });

    console.log('Transaction executed successfully:', {
      digest: `${digest.slice(0, 8)}...${digest.slice(-4)}`,
      status: (result as any).effects?.status?.status
    });

    res.json({ result });

  } catch (error) {
    console.error('Execute transaction failed:', error);
    
    res.status(500).json({ 
      error: 'Failed to execute transaction',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Track Link Click
app.post('/api/track-click', async (req, res) => {
  try {
    const { profileId, linkIndex } = req.body;

    console.log('Tracking link click:', {
      profileId: `${profileId.slice(0, 8)}...${profileId.slice(-4)}`,
      linkIndex
    });

    // Create the click tracking transaction
    const tx = new Transaction();
    tx.moveCall({
      target: `${process.env.PACKAGE_ID}::linktree::click_link`,
      arguments: [
        tx.object(profileId),
        tx.pure.u64(linkIndex),
        tx.object('0x6'), // Clock object ID
      ],
    });

    // Build transaction bytes
    const txBytes = await tx.build({
      client: suiClient,
      onlyTransactionKind: true,
    });

    // Create sponsored transaction
    const sponsored = await enokiClient.createSponsoredTransaction({
      transactionKindBytes: toBase64(txBytes),
      network: (process.env.SUI_NETWORK as any) || 'testnet',
      sender: '0x0000000000000000000000000000000000000000000000000000000000000000', // System sender
      allowedMoveCallTargets: [`${process.env.PACKAGE_ID}::linktree::click_link`],
      allowedAddresses: ['0x0000000000000000000000000000000000000000000000000000000000000000']
    });

    console.log('Click tracking transaction created:', {
      digest: sponsored.digest,
      bytesLength: sponsored.bytes.length
    });

    res.json({ 
      digest: sponsored.digest,
      bytes: sponsored.bytes 
    });

  } catch (error) {
    console.error('Click tracking failed:', error);
    
    res.status(500).json({ 
      error: 'Failed to track click',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// ===== Privacy & Security Endpoints =====

// Upload Avatar to Walrus
app.post('/api/upload-avatar-walrus', upload.single('avatar'), async (req: express.Request, res: express.Response) => {
  try {
    const uploadedFile = (req as any).file;
    if (!uploadedFile) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('Uploading avatar to Walrus:', {
      filename: uploadedFile.originalname,
      size: uploadedFile.size
    });

    const result = await uploadAvatarToWalrus(uploadedFile.buffer, uploadedFile.originalname);

    res.json({
      hash: result.hash,
      blobId: result.blobId,
      url: result.url || getWalrusUrl(result.blobId)
    });

  } catch (error) {
    console.error('Walrus upload failed:', error);
    res.status(500).json({
      error: 'Failed to upload to Walrus',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Encrypt Bio
app.post('/api/encrypt-bio', async (req, res) => {
  try {
    const { bio, key } = req.body;

    if (!bio) {
      return res.status(400).json({ error: 'Missing required field: bio' });
    }

    const encrypted = encryptData(bio, key);

    res.json({ encrypted });
  } catch (error) {
    console.error('Encryption failed:', error);
    res.status(500).json({
      error: 'Failed to encrypt bio',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Check Fraud
app.post('/api/check-fraud', async (req, res) => {
  try {
    const { url, profile } = req.body;

    if (url) {
      const validation = validateLink(url);
      const isSpam = detectSpamLink(url);
      
      return res.json({
        url,
        valid: validation.valid,
        reason: validation.reason,
        isSpam,
        recommendation: isSpam ? 'Consider using a different URL' : 'URL looks safe'
      });
    }

    if (profile) {
      const fraudScore = calculateFraudScore(profile);
      const shouldFlag = fraudScore >= 30;

      return res.json({
        fraudScore,
        shouldFlag,
        riskLevel: fraudScore < 20 ? 'low' : fraudScore < 50 ? 'medium' : 'high',
        recommendation: shouldFlag ? 'Profile should be reviewed by admin' : 'Profile looks safe'
      });
    }

    return res.status(400).json({ error: 'Missing required field: url or profile' });
  } catch (error) {
    console.error('Fraud check failed:', error);
    res.status(500).json({
      error: 'Failed to check fraud',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Update Privacy Settings
app.post('/api/update-privacy', async (req, res) => {
  try {
    const { profileId, isPrivate, privacySettings, sender } = req.body;

    if (!profileId || !sender) {
      return res.status(400).json({ 
        error: 'Missing required fields: profileId, sender' 
      });
    }

    // Create transaction to update privacy settings
    const tx = new Transaction();
    tx.moveCall({
      target: `${process.env.PACKAGE_ID}::linktree::set_privacy_settings`,
      arguments: [
        tx.object(profileId),
        tx.pure.bool(isPrivate || false),
        tx.pure.bool(privacySettings?.show_bio !== false),
        tx.pure.bool(privacySettings?.show_links !== false),
        tx.pure.bool(privacySettings?.allow_anonymous !== false),
        tx.object('0x6'), // Clock object
      ],
    });

    tx.setSender(sender);

    const txBytes = await tx.build({
      client: suiClient,
      onlyTransactionKind: true,
    });

    const sponsored = await enokiClient.createSponsoredTransaction({
      transactionKindBytes: toBase64(txBytes),
      network: (process.env.SUI_NETWORK as any) || 'testnet',
      sender: sender,
      allowedMoveCallTargets: [`${process.env.PACKAGE_ID}::linktree::set_privacy_settings`],
      allowedAddresses: [sender]
    });

    res.json({
      digest: sponsored.digest,
      bytes: sponsored.bytes
    });

  } catch (error) {
    console.error('Update privacy failed:', error);
    res.status(500).json({
      error: 'Failed to update privacy settings',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Delete Profile Data (GDPR Compliance)
app.delete('/api/delete-profile-data', async (req, res) => {
  try {
    const { profileId, sender } = req.body;

    if (!profileId || !sender) {
      return res.status(400).json({ 
        error: 'Missing required fields: profileId, sender' 
      });
    }

    // Note: On-chain data cannot be truly deleted, but we can:
    // 1. Mark profile as deleted (update bio/display_name to indicate deletion)
    // 2. Clear sensitive data
    // 3. Set privacy to maximum (private, no anonymous viewing)
    
    // For now, we'll update the profile to indicate deletion
    // In production, you might want to add a `deleted` flag to the contract
    
    console.log('GDPR deletion request for profile:', profileId, 'by:', sender);

    // Update profile to indicate deletion
    const tx = new Transaction();
    tx.moveCall({
      target: `${process.env.PACKAGE_ID}::linktree::update_profile`,
      arguments: [
        tx.object(profileId),
        tx.pure.string('[Deleted]'),
        tx.pure.string(''),
        tx.pure.string(''),
        tx.pure.string('default'),
        tx.object('0x6'),
      ],
    });

    // Also set privacy to maximum
    tx.moveCall({
      target: `${process.env.PACKAGE_ID}::linktree::set_privacy_settings`,
      arguments: [
        tx.object(profileId),
        tx.pure.bool(true), // Private
        tx.pure.bool(false), // Don't show bio
        tx.pure.bool(false), // Don't show links
        tx.pure.bool(false), // No anonymous viewing
        tx.object('0x6'),
      ],
    });

    tx.setSender(sender);

    const txBytes = await tx.build({
      client: suiClient,
      onlyTransactionKind: true,
    });

    const sponsored = await enokiClient.createSponsoredTransaction({
      transactionKindBytes: toBase64(txBytes),
      network: (process.env.SUI_NETWORK as any) || 'testnet',
      sender: sender,
      allowedMoveCallTargets: [
        `${process.env.PACKAGE_ID}::linktree::update_profile`,
        `${process.env.PACKAGE_ID}::linktree::set_privacy_settings`
      ],
      allowedAddresses: [sender]
    });

    res.json({
      digest: sponsored.digest,
      bytes: sponsored.bytes,
      message: 'Profile data marked for deletion. On-chain data cannot be fully deleted, but sensitive information has been cleared.'
    });

  } catch (error) {
    console.error('Delete profile data failed:', error);
    res.status(500).json({
      error: 'Failed to delete profile data',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 QEDI Backend started on port ${PORT}`);
  console.log(`📡 Network: ${process.env.SUI_NETWORK || 'testnet'}`);
  console.log(`📦 Package ID: ${process.env.PACKAGE_ID}`);
  console.log(`🏪 Registry ID: ${process.env.REGISTRY_ID}`);
  console.log(`🔑 Enoki configured: ${!!process.env.ENOKI_PRIVATE_KEY}`);
});

export default app;
