import { EnokiClient } from '@mysten/enoki';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { toBase64 } from '@mysten/sui/utils';

// Initialize clients
const suiClient = new SuiClient({ 
  url: getFullnodeUrl(process.env.SUI_NETWORK || 'testnet') 
});

const enokiClient = new EnokiClient({
  apiKey: process.env.ENOKI_PRIVATE_KEY
});

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
        tx.object(process.env.REGISTRY_ID),
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
      network: process.env.SUI_NETWORK || 'testnet',
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
}
