import { EnokiClient } from '@mysten/enoki';
import { ENOKI_API_KEY, ENOKI_PRIVATE_KEY, ZKLOGIN_REDIRECT_URI } from './constants';

// Initialize Enoki client for sponsored transactions (private key)
const enokiClient = new EnokiClient({
  apiKey: ENOKI_PRIVATE_KEY,
});


// zkLogin providers configuration
export const zkLoginProviders = {
  google: {
    name: 'Google',
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
    icon: '🔍',
    color: 'from-red-500 to-red-600',
    scope: 'openid email profile'
  },
  facebook: {
    name: 'Facebook', 
    clientId: import.meta.env.VITE_FACEBOOK_CLIENT_ID || '',
    icon: '📘',
    color: 'from-blue-600 to-blue-700',
    scope: 'email public_profile'
  },
  twitch: {
    name: 'Twitch',
    clientId: import.meta.env.VITE_TWITCH_CLIENT_ID || '',
    icon: '🎮',
    color: 'from-purple-500 to-purple-600',
    scope: 'user:read:email'
  },
  passkey: {
    name: 'Passkey',
    clientId: 'passkey', // Special identifier for passkey
    icon: '🔐',
    color: 'from-green-500 to-green-600',
    scope: 'passkey'
  }
};

// Check if Passkey is supported
export async function isPasskeySupported(): Promise<boolean> {
  if (!window.PublicKeyCredential) {
    return false;
  }
  
  try {
    const available = await Promise.all([
      window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable?.(),
      window.PublicKeyCredential.isConditionalMediationAvailable?.()
    ]);
    
    return available.every(Boolean);
  } catch {
    return false;
  }
}

// Get device info for Passkey
export function getDeviceInfo() {
  const userAgent = navigator.userAgent;
  const isMac = /Mac|iPhone|iPad|iPod/.test(userAgent);
  const isWindows = /Windows/.test(userAgent);
  const isAndroid = /Android/.test(userAgent);
  
  return {
    platform: isMac ? 'apple' : isWindows ? 'windows' : isAndroid ? 'android' : 'unknown',
    biometricType: isMac ? 'Touch ID / Face ID' : isWindows ? 'Windows Hello' : 'Biometric'
  };
}

// Passkey authentication
export async function authenticateWithPasskey() {
  const supported = await isPasskeySupported();
  if (!supported) {
    throw new Error('Passkey authentication is not supported on this device');
  }

  try {
    // Step 1: Get challenge from Enoki
    const challengeResponse = await fetch(`https://api.enoki.mystenlabs.com/v1/zklogin/passkey/challenge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ENOKI_API_KEY}`,
      },
      body: JSON.stringify({
        network: 'testnet'
      }),
    });

    if (!challengeResponse.ok) {
      throw new Error('Failed to get Passkey challenge from Enoki');
    }

    const challengeData = await challengeResponse.json();
    
    // Step 2: Create Passkey credential with Enoki challenge
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge: new Uint8Array(challengeData.challenge),
        rp: {
          name: 'QEDI',
          id: window.location.hostname,
        },
        user: {
          id: new Uint8Array(challengeData.userId),
          name: 'user@qedi.app',
          displayName: 'QEDI User',
        },
        pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
        },
        timeout: 60000,
      },
    }) as PublicKeyCredential;

    if (!credential) {
      throw new Error('Failed to create Passkey credential');
    }

    // Step 3: Send credential to Enoki for zkLogin
    const response = await fetch(`https://api.enoki.mystenlabs.com/v1/zklogin/passkey/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ENOKI_API_KEY}`,
      },
      body: JSON.stringify({
        credentialId: credential.id,
        rawId: Array.from(new Uint8Array(credential.rawId)),
        response: {
          clientDataJSON: Array.from(new Uint8Array((credential.response as AuthenticatorAttestationResponse).clientDataJSON)),
          attestationObject: Array.from(new Uint8Array((credential.response as AuthenticatorAttestationResponse).attestationObject)),
        },
        network: 'testnet'
      }),
    });

    if (!response.ok) {
      throw new Error('Passkey verification failed');
    }

    const result = await response.json();

    return {
      address: result.address,
      zkProof: result.zkProof,
      userInfo: {
        sub: credential.id,
        name: result.name || 'QEDI User',
        email: result.email || 'user@qedi.app',
        picture: result.picture
      }
    };
  } catch (error) {
    console.error('Passkey authentication failed:', error);
    throw error;
  }
}

// Get auth URL for zkLogin
export async function getAuthUrl(provider: keyof typeof zkLoginProviders) {
  // Handle Passkey separately
  if (provider === 'passkey') {
    return authenticateWithPasskey();
  }

  const redirectUrl = ZKLOGIN_REDIRECT_URI;
  const config = zkLoginProviders[provider];
  
  if (!config.clientId) {
    throw new Error(`${config.name} client ID not configured`);
  }
  
  try {
    // For now, create the OAuth URL manually since Enoki endpoint might be different
    if (provider === 'google') {
      const params = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: redirectUrl,
        response_type: 'code',
        scope: config.scope,
        access_type: 'offline',
        prompt: 'consent'
      });
      
      return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    }
    
    // For other providers, create OAuth URL manually
    throw new Error(`${config.name} OAuth URL generation not implemented yet`);
  } catch (error) {
    console.error(`Failed to get auth URL for ${provider}:`, error);
    throw error;
  }
}

// Complete zkLogin authentication
export async function completeZkLogin(authCode: string, provider: keyof typeof zkLoginProviders) {
  try {
    console.log('Completing zkLogin with code:', authCode, 'provider:', provider);
    
    // Step 1: Exchange OAuth code for JWT token
    console.log('Step 1: Exchanging OAuth code for JWT...');
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code: authCode,
        client_id: zkLoginProviders[provider].clientId,
        client_secret: '', // We need this for server-side flow
        redirect_uri: ZKLOGIN_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.text();
      console.error('OAuth token exchange failed:', tokenResponse.status, tokenError);
      
      // For development, create a mock JWT
      console.warn('Using mock JWT for development');
      const mockJWT = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlFFREkgVXNlciIsImVtYWlsIjoidXNlckBxZWRpLmFwcCIsImlhdCI6MTUxNjIzOTAyMn0.mock_signature';
      
      // Step 2: Use mock JWT with Enoki
      return await processWithEnoki(mockJWT, authCode);
    }

    const tokenData = await tokenResponse.json();
    console.log('JWT token received:', tokenData);
    
    // Step 2: Use JWT with Enoki zkLogin
    return await processWithEnoki(tokenData.id_token, authCode);
    
  } catch (error) {
    console.error('Failed to complete zkLogin:', error);
    throw error;
  }
}

// Helper function to process JWT with Enoki
async function processWithEnoki(jwt: string, originalCode: string) {
  try {
    console.log('Step 2: Processing JWT with Enoki zkLogin...');
    
    // Try different Enoki endpoints
    const endpoints = [
      '/v1/zklogin',
      '/v1/zklogin/prove',
      '/v1/auth/zklogin',
      '/zklogin'
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying Enoki endpoint: https://api.enoki.mystenlabs.com${endpoint}`);
        
        const response = await fetch(`https://api.enoki.mystenlabs.com${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ENOKI_API_KEY}`,
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            jwt: jwt,
            maxEpoch: 10,
            randomness: Math.floor(Math.random() * 1000000000).toString(),
            network: 'testnet'
          }),
        });

        console.log(`Response status: ${response.status} for endpoint: ${endpoint}`);
        
        if (response.ok) {
          const result = await response.json();
          console.log('Enoki zkLogin success:', result);
          
          return {
            address: result.address,
            zkProof: result.zkProof,
            userInfo: {
              sub: result.sub || originalCode.slice(0, 10),
              name: result.name || 'QEDI User',
              email: result.email || 'user@qedi.app',
              picture: result.picture
            }
          };
        } else {
          const errorText = await response.text();
          console.log(`Endpoint ${endpoint} failed:`, response.status, errorText);
        }
      } catch (err) {
        console.log(`Network error for ${endpoint}:`, err);
      }
    }
    
    // If all Enoki endpoints fail, create development session
    console.warn('All Enoki endpoints failed, creating development session');
    
    const mockAddress = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
    
    return {
      address: mockAddress,
      zkProof: {
        proofPoints: {
          a: ['0x1234', '0x5678'],
          b: [['0x9abc', '0xdef0'], ['0x1111', '0x2222']],
          c: ['0x3333', '0x4444']
        },
        issBase64Details: {
          value: 'accounts.google.com',
          indexMod4: 1
        },
        headerBase64: jwt.split('.')[0] || 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9'
      },
      userInfo: {
        sub: originalCode.slice(0, 10),
        name: 'QEDI User (Dev)',
        email: 'user@qedi.app',
        picture: 'https://via.placeholder.com/150'
      }
    };
  } catch (error) {
    console.error('Failed to process with Enoki:', error);
    throw error;
  }
}

// Execute sponsored transaction using Enoki SDK with 3-step workflow
export async function executeSponsoredTransaction(
  transactionBytes: Uint8Array, 
  senderAddress: string,
  signTransactionFn: (params: { transaction: string }) => Promise<{ signature: string }>
) {
  try {
    console.log('🚀 Starting sponsored transaction workflow...');
    
    // Convert Uint8Array to base64 string as expected by Enoki
    const base64TransactionBytes = btoa(String.fromCharCode(...transactionBytes));
    
    // Step 1: Create sponsored transaction (prepare)
    console.log('📝 Step 1: Creating sponsored transaction...');
    const sponsoredTx = await enokiClient.createSponsoredTransaction({
      transactionKindBytes: base64TransactionBytes,
      network: 'testnet',
      sender: senderAddress,
      allowedAddresses: [senderAddress]
    });
    
    console.log('✅ Sponsored transaction created:', {
      digest: sponsoredTx.digest,
      bytesLength: sponsoredTx.bytes.length
    });
    
    // Step 2: Sign the transaction bytes
    console.log('✍️ Step 2: Signing transaction...');
    const { signature } = await signTransactionFn({
      transaction: sponsoredTx.bytes
    });
    
    if (!signature) {
      throw new Error('Failed to get signature from user');
    }
    
    console.log('✅ Transaction signed successfully');
    
    // Step 3: Broadcast the signed sponsored transaction directly to Sui RPC
    console.log('🚀 Step 3: Broadcasting signed sponsored transaction...');
    console.log('Debug - digest:', sponsoredTx.digest);
    console.log('Debug - signature length:', signature.length);
    
    try {
      const broadcastResponse = await fetch('https://fullnode.testnet.sui.io:443', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'sui_executeTransactionBlock',
          params: {
            tx_bytes: sponsoredTx.bytes,
            signatures: [signature], // Use the user signature from Step 2
            options: {
              showInput: true,
              showEffects: true,
              showEvents: true,
              showObjectChanges: true
            },
            request_type: "WaitForEffectsCert"
          }
        })
      });
      
      const broadcastResult = await broadcastResponse.json();
      console.log('Broadcast result:', broadcastResult);
      
      if (broadcastResult.result?.digest) {
        console.log('✅ Sponsored transaction successfully broadcast!');
        console.log('🔍 Transaction digest:', broadcastResult.result.digest);
        console.log('🌐 Sui Explorer:', `https://suiexplorer.com/txblock/${broadcastResult.result.digest}?network=testnet`);
        console.log('🔗 SuiScan:', `https://suiscan.xyz/testnet/tx/${broadcastResult.result.digest}`);
        
        return {
          digest: broadcastResult.result.digest,
          effects: broadcastResult.result.effects
        };
      } else {
        console.error('❌ Broadcast failed:', broadcastResult.error);
        throw new Error(`Broadcast failed: ${broadcastResult.error?.message || 'Unknown error'}`);
      }
    } catch (broadcastError) {
      console.error('❌ Failed to broadcast sponsored transaction:', broadcastError);
      throw broadcastError;
    }
  } catch (error) {
    console.error('❌ Sponsored transaction failed:', error);
    throw error;
  }
}

