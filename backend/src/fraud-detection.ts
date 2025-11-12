/**
 * Fraud Detection Service
 * Detects spam links, suspicious patterns, and calculates fraud scores
 */

// Suspicious URL patterns
const SPAM_PATTERNS = [
  /bit\.ly/i,
  /tinyurl\.com/i,
  /t\.co/i,
  /goo\.gl/i,
  /short\.link/i,
  /shorte\.st/i,
  /adf\.ly/i,
  /bc\.vc/i,
  /ouo\.io/i,
  /linkbucks\.com/i,
  /doubleclick/i,
  /advertising/i,
  /affiliate/i,
  /ref=/i,
  /utm_source/i,
  /clickbank/i,
  /amazon.*\/dp\//i,
  /ebay\.com\/itm\//i,
];

// Suspicious keywords in URLs
const SUSPICIOUS_KEYWORDS = [
  'spam',
  'scam',
  'phishing',
  'malware',
  'virus',
  'hack',
  'crypto-scam',
  'giveaway',
  'free-money',
  'click-here',
];

/**
 * Detect if a URL is likely spam
 */
export function detectSpamLink(url: string): boolean {
  if (!url || url.length === 0) {
    return false;
  }

  const lowerUrl = url.toLowerCase();

  // Check against spam patterns
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(lowerUrl)) {
      return true;
    }
  }

  // Check for suspicious keywords
  for (const keyword of SUSPICIOUS_KEYWORDS) {
    if (lowerUrl.includes(keyword)) {
      return true;
    }
  }

  return false;
}

/**
 * Validate a link URL
 */
export function validateLink(url: string): { valid: boolean; reason?: string } {
  if (!url || url.trim().length === 0) {
    return { valid: false, reason: 'URL cannot be empty' };
  }

  // Basic URL validation
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    
    // Check for valid protocol
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { valid: false, reason: 'Invalid protocol. Only HTTP and HTTPS are allowed' };
    }

    // Check for localhost/internal IPs (potential security risk)
    const hostname = urlObj.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname.startsWith('127.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.')
    ) {
      return { valid: false, reason: 'Local/internal URLs are not allowed' };
    }

    // Check for spam
    if (detectSpamLink(url)) {
      return { valid: false, reason: 'URL appears to be spam or suspicious' };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, reason: 'Invalid URL format' };
  }
}

/**
 * Calculate fraud score for a profile based on various factors
 * Returns a score from 0-100 (0 = no fraud, 100 = high fraud risk)
 */
export function calculateFraudScore(profile: any): number {
  let score = 0;

  // Check links for spam
  if (profile.links && Array.isArray(profile.links)) {
    const spamLinkCount = profile.links.filter((link: any) => 
      detectSpamLink(link.url || '')
    ).length;
    
    // Each spam link adds 20 points
    score += spamLinkCount * 20;
  }

  // Check username for suspicious patterns
  if (profile.username) {
    const username = profile.username.toLowerCase();
    // Suspicious username patterns
    if (username.includes('admin') || username.includes('support') || username.includes('official')) {
      score += 10;
    }
    // Very short usernames might be bots
    if (username.length <= 3) {
      score += 5;
    }
  }

  // Check bio for suspicious content
  if (profile.bio) {
    const bio = profile.bio.toLowerCase();
    const suspiciousBioKeywords = ['free', 'click', 'money', 'crypto', 'giveaway', 'win'];
    const foundKeywords = suspiciousBioKeywords.filter(keyword => bio.includes(keyword));
    score += foundKeywords.length * 5;
  }

  // Cap at 100
  return Math.min(score, 100);
}

/**
 * Check if a profile should be flagged for review
 */
export function shouldFlagForReview(fraudScore: number): boolean {
  return fraudScore >= 30;
}

