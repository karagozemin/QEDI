import { EnokiClient } from '@mysten/enoki';

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
      status: result.effects?.status?.status
    });

    res.json({ result });

  } catch (error) {
    console.error('Execute transaction failed:', error);
    
    res.status(500).json({ 
      error: 'Failed to execute transaction',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
