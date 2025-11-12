// Link structure
export interface Link {
  label: string;
  url: string;
  icon: string;
  order: number;
  enabled: boolean;
}

// Privacy settings structure
export interface PrivacySettings {
  show_bio: boolean;
  show_links: boolean;
  allow_anonymous: boolean;
}

// LinkTree Profile structure (matches Move struct)
export interface LinkTreeProfile {
  id: string;
  owner: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_blob_id: string;
  theme: string;
  links: Link[];
  created_at: number;
  updated_at: number;
  // Privacy & Security fields (optional for backward compatibility)
  is_private?: boolean;
  encrypted_bio?: string;
  privacy_settings?: PrivacySettings;
  walrus_avatar_hash?: string;
  fraud_score?: number;
}

// Theme types
export type ThemeName = 
  | 'classic' 
  | 'dark' 
  | 'gradient' 
  | 'minimal' 
  | 'cyberpunk' 
  | 'nature';

// Auth types
export type AuthMethod = 'wallet' | 'zklogin';
export type LoginProvider = 'google' | 'facebook' | 'twitch';

// User session
export interface UserSession {
  address: string;
  authMethod: AuthMethod;
  provider?: LoginProvider;
  zkProof?: any;
}

