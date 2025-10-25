import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { EnokiClient } from '@mysten/enoki';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { toBase64 } from '@mysten/sui/utils';

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
      theme 
    } = req.body;

    console.log('Creating profile for:', sender);
    console.log('Profile data:', { username, displayName, bio, theme });

    // Validate required fields
    if (!sender || !username || !displayName) {
      return res.status(400).json({ 
        error: 'Missing required fields: sender, username, displayName' 
      });
    }

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
      bytes: sponsored.bytes 
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 QEDI Backend started on port ${PORT}`);
  console.log(`📡 Network: ${process.env.SUI_NETWORK || 'testnet'}`);
  console.log(`📦 Package ID: ${process.env.PACKAGE_ID}`);
  console.log(`🏪 Registry ID: ${process.env.REGISTRY_ID}`);
  console.log(`🔑 Enoki configured: ${!!process.env.ENOKI_PRIVATE_KEY}`);
});

export default app;
