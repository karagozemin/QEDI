/**
 * Privacy Service
 * Handles encryption, decryption, and privacy access control
 * Uses Seal SDK for enhanced security (homomorphic encryption)
 * Maintains backward compatibility with AES-256-CBC
 */

import crypto from 'crypto';
// Lazy import for Seal SDK to avoid build issues on Render
let SEAL: any = null;
let sealLoadAttempted = false;

// Encryption key (should be in environment variables in production)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // For AES, this is always 16

// Seal prefix for identifying Seal-encrypted data
const SEAL_PREFIX = 'seal:';

// Seal context and keys (lazy initialization)
let sealContext: any = null;
let sealPublicKey: any = null;
let sealSecretKey: any = null;
let sealEncryptor: any = null;
let sealDecryptor: any = null;
let sealInitialized = false;

/**
 * Lazy load Seal SDK
 */
async function loadSeal(): Promise<boolean> {
  if (sealLoadAttempted) {
    return SEAL !== null;
  }
  
  sealLoadAttempted = true;
  
  try {
    // Dynamic import to avoid build-time errors
    const sealModule = await import('node-seal');
    SEAL = sealModule.default || sealModule;
    console.log('✅ Seal SDK loaded successfully');
    return true;
  } catch (error) {
    console.warn('⚠️ Seal SDK not available, using AES-256-CBC fallback:', error);
    SEAL = null;
    return false;
  }
}

/**
 * Initialize Seal encryption system
 * Uses BFV scheme for homomorphic encryption
 */
async function initializeSeal(): Promise<void> {
  if (sealInitialized) {
    return;
  }

  // Try to load Seal SDK first
  const loaded = await loadSeal();
  if (!loaded || !SEAL) {
    sealInitialized = false;
    return;
  }

  try {
    const seal = await SEAL();
    
    // Encryption parameters
    const schemeType = seal.SchemeType.bfv;
    const securityLevel = (seal as any).SecurityLevel?.tc128;
    const polyModulusDegree = 4096;
    const bitSizes = [36, 36, 37];

    const encParams = new seal.EncryptionParameters(schemeType);
    encParams.setPolyModulusDegree(polyModulusDegree);
    encParams.setCoeffModulus(
      seal.CoeffModulus.Create(polyModulusDegree, Int32Array.from(bitSizes))
    );
    encParams.setPlainModulus(seal.PlainModulus.Batching(polyModulusDegree, 20));

    sealContext = new (seal as any).Context(encParams, true, securityLevel);

    if (!sealContext.parametersSet()) {
      throw new Error('SEAL: Parameters could not be set');
    }

    // Generate keys
    const keyGenerator = new seal.KeyGenerator(sealContext);
    sealPublicKey = keyGenerator.createPublicKey();
    sealSecretKey = keyGenerator.secretKey();

    // Create encryptor and decryptor
    sealEncryptor = new seal.Encryptor(sealContext, sealPublicKey);
    sealDecryptor = new seal.Decryptor(sealContext, sealSecretKey);

    sealInitialized = true;
    console.log('✅ Seal encryption system initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Seal:', error);
    // Fallback to AES if Seal initialization fails
    sealInitialized = false;
  }
}

/**
 * Encrypt data using Seal SDK (homomorphic encryption)
 * Returns base64-encoded encrypted data with 'seal:' prefix
 */
async function encryptWithSeal(data: string): Promise<string> {
  try {
    await initializeSeal();
    
    if (!sealInitialized || !sealEncryptor) {
      throw new Error('Seal not initialized');
    }

    const seal = await SEAL();
    const encoder = new seal.BatchEncoder(sealContext);
    
    // Convert string to Int32Array for encoding
    const dataBytes = Buffer.from(data, 'utf8');
    const dataArray = new Int32Array(dataBytes.length);
    for (let i = 0; i < dataBytes.length; i++) {
      dataArray[i] = dataBytes[i];
    }

    // Encode and encrypt
    const plainText = (encoder as any).encode(dataArray);
    const cipherText = sealEncryptor.encrypt(plainText);
    
    // Serialize to base64
    const serialized = cipherText.save();
    const base64 = Buffer.from(serialized).toString('base64');
    
    return SEAL_PREFIX + base64;
  } catch (error) {
    console.error('Seal encryption error:', error);
    throw error;
  }
}

/**
 * Decrypt data using Seal SDK
 */
async function decryptWithSeal(encryptedData: string): Promise<string> {
  try {
    await initializeSeal();
    
    if (!sealInitialized || !sealDecryptor) {
      throw new Error('Seal not initialized');
    }

    const seal = await SEAL();
    const encoder = new seal.BatchEncoder(sealContext);
    
    // Remove prefix and decode from base64
    const base64 = encryptedData.replace(SEAL_PREFIX, '');
    const serialized = Buffer.from(base64, 'base64');
    
    // Deserialize and decrypt
    const cipherText = new seal.Ciphertext();
    (cipherText as any).load(sealContext, serialized);
    
    const decryptedPlainText = sealDecryptor.decrypt(cipherText);
    const decodedArray = (encoder as any).decode(decryptedPlainText);
    
    // Convert Int32Array back to string
    const dataBytes = Buffer.from(decodedArray);
    return dataBytes.toString('utf8').replace(/\0/g, ''); // Remove null bytes
  } catch (error) {
    console.error('Seal decryption error:', error);
    throw error;
  }
}

/**
 * Check if encrypted data is in Seal format
 */
function isSealEncrypted(data: string): boolean {
  return data.startsWith(SEAL_PREFIX);
}

/**
 * Encrypt data using Seal SDK (preferred) or AES-256-CBC (fallback)
 * New data will be encrypted with Seal for enhanced security
 * Set USE_SEAL=false in env to force AES encryption
 */
export async function encryptData(data: string, key?: string): Promise<string> {
  if (!data || data.length === 0) {
    return '';
  }

  // Check if Seal should be used (default: true)
  const useSeal = process.env.USE_SEAL !== 'false';

  if (useSeal) {
    try {
      return await encryptWithSeal(data);
    } catch (error) {
      console.warn('Seal encryption failed, falling back to AES:', error);
      // Fall through to AES encryption
    }
  }

  // Fallback to AES-256-CBC (backward compatibility)
  const encryptionKey = key || ENCRYPTION_KEY;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    crypto.createHash('sha256').update(encryptionKey).digest(),
    iv
  );

  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Return IV + encrypted data (IV is needed for decryption)
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Synchronous version for backward compatibility
 * Uses AES-256-CBC only (for legacy code that expects sync)
 */
export function encryptDataSync(data: string, key?: string): string {
  if (!data || data.length === 0) {
    return '';
  }

  const encryptionKey = key || ENCRYPTION_KEY;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    crypto.createHash('sha256').update(encryptionKey).digest(),
    iv
  );

  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt data - automatically detects Seal or AES format
 * Maintains full backward compatibility with AES-256-CBC
 */
export async function decryptData(encryptedData: string, key?: string): Promise<string> {
  if (!encryptedData || encryptedData.length === 0) {
    return '';
  }

  // Check if data is Seal-encrypted
  if (isSealEncrypted(encryptedData)) {
    try {
      return await decryptWithSeal(encryptedData);
    } catch (error) {
      console.error('Seal decryption error:', error);
      throw new Error('Failed to decrypt Seal-encrypted data');
    }
  }

  // Fallback to AES-256-CBC (backward compatibility)
  try {
    const encryptionKey = key || ENCRYPTION_KEY;
    const parts = encryptedData.split(':');
    
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];

    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      crypto.createHash('sha256').update(encryptionKey).digest(),
      iv
    );

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('AES decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Synchronous version for backward compatibility
 * Only supports AES-256-CBC (for legacy code)
 */
export function decryptDataSync(encryptedData: string, key?: string): string {
  if (!encryptedData || encryptedData.length === 0) {
    return '';
  }

  // If Seal-encrypted, throw error (needs async)
  if (isSealEncrypted(encryptedData)) {
    throw new Error('Seal-encrypted data requires async decryptData() function');
  }

  try {
    const encryptionKey = key || ENCRYPTION_KEY;
    const parts = encryptedData.split(':');
    
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];

    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      crypto.createHash('sha256').update(encryptionKey).digest(),
      iv
    );

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('AES decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Check if a viewer has access to a profile based on privacy settings
 */
export function checkPrivacyAccess(
  profile: any,
  viewerAddress: string
): { allowed: boolean; reason?: string } {
  // Owner always has access
  if (profile.owner === viewerAddress) {
    return { allowed: true };
  }

  // Check if profile is private
  if (profile.is_private === true || profile.is_private === 'true') {
    // Check if anonymous viewing is allowed
    const privacySettings = profile.privacy_settings || {};
    if (privacySettings.allow_anonymous === true || privacySettings.allow_anonymous === 'true') {
      return { allowed: true };
    }
    return { allowed: false, reason: 'Profile is private and anonymous viewing is not allowed' };
  }

  // Public profile
  return { allowed: true };
}

/**
 * Filter profile data based on privacy settings
 */
export function filterProfileData(profile: any, viewerAddress: string): any {
  const access = checkPrivacyAccess(profile, viewerAddress);
  
  if (!access.allowed) {
    return null;
  }

  const isOwner = profile.owner === viewerAddress;
  const privacySettings = profile.privacy_settings || {};

  // Owner sees everything
  if (isOwner) {
    return profile;
  }

  // Filter based on privacy settings
  const filtered: any = {
    id: profile.id,
    owner: profile.owner,
    username: profile.username,
    display_name: profile.display_name,
    theme: profile.theme,
    is_verified: profile.is_verified,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
  };

  // Show bio only if allowed
  if (privacySettings.show_bio !== false && privacySettings.show_bio !== 'false') {
    filtered.bio = profile.bio || '';
    // Note: encrypted_bio decryption is handled in server.ts (async required)
  }

  // Show avatar
  filtered.avatar_url = profile.avatar_url || '';
  if (profile.walrus_avatar_hash) {
    filtered.walrus_avatar_hash = profile.walrus_avatar_hash;
  }

  // Show links only if allowed
  if (privacySettings.show_links !== false && privacySettings.show_links !== 'false') {
    filtered.links = profile.links || [];
  } else {
    filtered.links = [];
  }

  // Don't expose sensitive fields
  delete filtered.encrypted_bio;
  delete filtered.fraud_score;
  delete filtered.zklogin_provider;
  delete filtered.zklogin_sub;

  return filtered;
}

