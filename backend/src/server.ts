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
  origin: ['http://localhost:5173', 'http://localhost:3000'],
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
    network: process.env.SUI_NETWORK || 'testnet'
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
    
    res.status(500).json({ 
      error: 'Failed to create sponsored transaction',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Add Link - Sponsored Transaction
app.post('/api/add-link', async (req, res) => {
  try {
    const { 
      sender, 
      profileId,
      title,
      url,
      icon
    } = req.body;

    console.log('Adding link to profile:', profileId);
    console.log('Link data:', { title, url, icon });

    // Validate required fields
    if (!sender || !profileId || !title || !url) {
      return res.status(400).json({ 
        error: 'Missing required fields: sender, profileId, title, url' 
      });
    }

    // Create the transaction
    const tx = new Transaction();
    tx.moveCall({
      target: `${process.env.PACKAGE_ID}::linktree::add_link`,
      arguments: [
        tx.object(profileId),
        tx.pure.string(title),
        tx.pure.string(url),
        tx.pure.string(icon || 'link'),
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
      allowedMoveCallTargets: [`${process.env.PACKAGE_ID}::linktree::add_link`],
      allowedAddresses: [sender],
    });

    console.log('Sponsored add link transaction created:', {
      digest: sponsored.digest,
      bytesLength: sponsored.bytes.length
    });

    res.json({ 
      digest: sponsored.digest,
      bytes: sponsored.bytes 
    });

  } catch (error) {
    console.error('Add link transaction failed:', error);
    
    res.status(500).json({ 
      error: 'Failed to create sponsored transaction',
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

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    details: err.message 
  });
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
