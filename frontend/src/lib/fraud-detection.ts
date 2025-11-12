/**
 * Fraud Detection Client
 * Client-side validation for links before submission
 */

import { BACKEND_URL } from './constants';

export interface LinkValidationResult {
  valid: boolean;
  reason?: string;
  isSpam?: boolean;
  recommendation?: string;
}

/**
 * Validate a link URL (client-side basic check)
 */
export function checkSpamPattern(url: string): boolean {
  if (!url || url.length === 0) {
    return false;
  }

  const lowerUrl = url.toLowerCase();

  // Basic spam patterns
  const spamPatterns = [
    /bit\.ly/i,
    /tinyurl\.com/i,
    /t\.co/i,
    /goo\.gl/i,
    /short\.link/i,
    /adf\.ly/i,
    /clickbank/i,
  ];

  return spamPatterns.some(pattern => pattern.test(lowerUrl));
}

/**
 * Validate link via backend API
 */
export async function validateLink(url: string): Promise<LinkValidationResult> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/check-fraud`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error('Validation request failed');
    }

    const result = await response.json();
    return {
      valid: result.valid,
      reason: result.reason,
      isSpam: result.isSpam,
      recommendation: result.recommendation,
    };
  } catch (error) {
    console.error('Link validation error:', error);
    // Fallback to client-side check
    const isSpam = checkSpamPattern(url);
    return {
      valid: !isSpam,
      reason: isSpam ? 'URL appears to be spam' : undefined,
      isSpam,
      recommendation: isSpam ? 'Consider using a different URL' : undefined,
    };
  }
}

