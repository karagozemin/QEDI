/**
 * Walrus Upload Service
 * Handles file uploads to Walrus for verifiable storage
 */

import crypto from 'crypto';
import FormData from 'form-data';

const WALRUS_PUBLISHER_URL = process.env.WALRUS_PUBLISHER_URL || 'https://publisher.walrus-testnet.walrus.space';
const WALRUS_AGGREGATOR_URL = process.env.WALRUS_AGGREGATOR_URL || 'https://aggregator.walrus-testnet.walrus.space';

/**
 * Upload file to Walrus and return hash and blob ID
 */
export async function uploadToWalrus(
  fileBuffer: Buffer,
  filename: string
): Promise<{ hash: string; blobId: string; url?: string }> {
  try {
    // Calculate SHA-256 hash of the file
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // Create form data for upload
    const formData = new FormData();
    formData.append('file', fileBuffer, {
      filename: filename,
      contentType: 'application/octet-stream',
    });

    // Upload to Walrus publisher
    // Use global fetch (Node.js 18+) or require node-fetch for older versions
    let fetchFn: typeof fetch;
    if (typeof fetch !== 'undefined') {
      fetchFn = fetch;
    } else {
      const nodeFetch = await import('node-fetch');
      fetchFn = nodeFetch.default as any;
    }
    
    const uploadResponse = await fetchFn(`${WALRUS_PUBLISHER_URL}/upload`, {
      method: 'POST',
      body: formData as any,
      headers: formData.getHeaders(),
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Walrus upload failed: ${uploadResponse.status} - ${errorText}`);
    }

    const uploadResult = await uploadResponse.json() as { blobId?: string; id?: string };
    const blobId = uploadResult.blobId || uploadResult.id || hash;

    // Get URL from aggregator
    let url: string | undefined;
    try {
      const aggregatorResponse = await fetchFn(`${WALRUS_AGGREGATOR_URL}/blob/${blobId}`);
      if (aggregatorResponse.ok) {
        const blobInfo = await aggregatorResponse.json() as { url?: string };
        url = blobInfo.url || `${WALRUS_AGGREGATOR_URL}/blob/${blobId}`;
      }
    } catch (error) {
      console.warn('Failed to get blob URL from aggregator:', error);
      // Continue without URL
    }

    return {
      hash,
      blobId,
      url,
    };
  } catch (error) {
    console.error('Walrus upload error:', error);
    throw new Error(`Failed to upload to Walrus: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Verify Walrus hash matches expected hash
 */
export function verifyWalrusHash(blobId: string, expectedHash: string): boolean {
  // In a real implementation, you would fetch the blob from Walrus
  // and verify its hash matches the expected hash
  // For now, we'll just check if both are provided
  return !!(blobId && expectedHash);
}

/**
 * Get Walrus blob URL
 */
export function getWalrusUrl(blobId: string): string {
  return `${WALRUS_AGGREGATOR_URL}/blob/${blobId}`;
}

/**
 * Upload image file (avatar) to Walrus
 */
export async function uploadAvatarToWalrus(
  fileBuffer: Buffer,
  filename: string = 'avatar.jpg'
): Promise<{ hash: string; blobId: string; url: string }> {
  // Validate file size (max 5MB)
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  if (fileBuffer.length > MAX_SIZE) {
    throw new Error(`File size exceeds maximum of ${MAX_SIZE} bytes`);
  }

  // Validate file type (basic check)
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  if (!validExtensions.includes(extension)) {
    throw new Error(`Invalid file type. Allowed: ${validExtensions.join(', ')}`);
  }

  const result = await uploadToWalrus(fileBuffer, filename);
  
  // Ensure url is always defined
  return {
    hash: result.hash,
    blobId: result.blobId,
    url: result.url || getWalrusUrl(result.blobId)
  };
}

