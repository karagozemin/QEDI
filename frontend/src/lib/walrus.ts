/**
 * Walrus Integration
 * Handles avatar uploads to Walrus for verifiable storage
 */

import { BACKEND_URL } from './constants';

export interface WalrusUploadResult {
  hash: string;
  blobId: string;
  url: string;
}

/**
 * Upload avatar to Walrus via backend
 */
export async function uploadAvatarToWalrus(file: File): Promise<WalrusUploadResult> {
  try {
    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size must be less than 5MB');
    }

    // Create form data
    const formData = new FormData();
    formData.append('avatar', file);

    // Upload via backend
    const response = await fetch(`${BACKEND_URL}/api/upload-avatar-walrus`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload to Walrus');
    }

    const result = await response.json();
    return {
      hash: result.hash,
      blobId: result.blobId,
      url: result.url || `https://aggregator.walrus-testnet.walrus.space/blob/${result.blobId}`,
    };
  } catch (error) {
    console.error('Walrus upload error:', error);
    throw error;
  }
}

/**
 * Get Walrus URL for a blob ID
 */
export function getWalrusUrl(blobId: string): string {
  return `https://aggregator.walrus-testnet.walrus.space/blob/${blobId}`;
}

