/**
 * Privacy Service
 * Handles encryption, decryption, and privacy access control
 */

import crypto from 'crypto';

// Encryption key (should be in environment variables in production)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Encrypt data using AES-256-CBC
 * In production, consider using Seal SDK for better security
 */
export function encryptData(data: string, key?: string): string {
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

  // Return IV + encrypted data (IV is needed for decryption)
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt data using AES-256-CBC
 */
export function decryptData(encryptedData: string, key?: string): string {
  if (!encryptedData || encryptedData.length === 0) {
    return '';
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
    console.error('Decryption error:', error);
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
    // If encrypted bio exists, try to decrypt (only if we have the key)
    if (profile.encrypted_bio && profile.encrypted_bio.length > 0) {
      try {
        filtered.bio = decryptData(profile.encrypted_bio);
      } catch (error) {
        console.error('Failed to decrypt bio:', error);
        filtered.bio = profile.bio || '';
      }
    }
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

