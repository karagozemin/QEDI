import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, REGISTRY_ID, NETWORK } from './constants';
import { executeSponsoredTransaction } from './enoki';

// Initialize Sui client
export const suiClient = new SuiClient({
  url: NETWORK === 'mainnet' 
    ? 'https://fullnode.mainnet.sui.io:443' 
    : 'https://fullnode.testnet.sui.io:443'
});

// Profile creation transaction
export function createProfileTransaction(
  username: string,
  displayName: string,
  bio: string,
  avatarUrl: string,
  theme: string = 'default'
) {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::linktree::create_profile`,
    arguments: [
      tx.object(REGISTRY_ID),
      tx.pure.string(username),
      tx.pure.string(displayName),
      tx.pure.string(bio),
      tx.pure.string(avatarUrl),
      tx.pure.string(theme),
      tx.object('0x6'), // Clock object ID
    ],
  });

  return tx;
}

// Add link to profile transaction
export function addLinkTransaction(
  profileId: string,
  title: string,
  url: string,
  icon: string
) {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::linktree::add_link`,
    arguments: [
      tx.object(profileId),
      tx.pure.string(title),
      tx.pure.string(url),
      tx.pure.string(icon),
      tx.object('0x6'), // Clock object ID
    ],
  });

  return tx;
}

// Update profile transaction
export function updateProfileTransaction(
  profileId: string,
  displayName: string,
  bio: string,
  avatarUrl: string,
  theme: string
) {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::linktree::update_profile`,
    arguments: [
      tx.object(profileId),
      tx.pure.string(displayName),
      tx.pure.string(bio),
      tx.pure.string(avatarUrl),
      tx.pure.string(theme),
      tx.object('0x6'), // Clock object ID
    ],
  });

  return tx;
}

// Get profile by username
export async function getProfileByUsername(username: string) {
  try {
    const result = await suiClient.getObject({
      id: REGISTRY_ID,
      options: {
        showContent: true,
        showType: true,
      },
    });

    // This is a simplified version - in practice, you'd need to query the registry
    // and then fetch the actual profile object
    console.log('Registry object for username:', username, result);
    return null; // TODO: Implement proper profile fetching
  } catch (error) {
    console.error('Error fetching profile for username:', username, error);
    return null;
  }
}

// Get profile by object ID
export async function getProfileById(profileId: string) {
  try {
    const result = await suiClient.getObject({
      id: profileId,
      options: {
        showContent: true,
        showType: true,
      },
    });

    return result;
  } catch (error) {
    console.error('Error fetching profile by ID:', error);
    return null;
  }
}

// Get user's profiles
export async function getUserProfiles(userAddress: string) {
  try {
    const result = await suiClient.getOwnedObjects({
      owner: userAddress,
      filter: {
        StructType: `${PACKAGE_ID}::linktree::LinkTreeProfile`,
      },
      options: {
        showContent: true,
        showType: true,
      },
    });

    return result.data;
  } catch (error) {
    console.error('Error fetching user profiles:', error);
    return [];
  }
}

// Record link click
export function recordLinkClickTransaction(profileId: string, linkIndex: number) {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::linktree::click_link`,
    arguments: [
      tx.object(profileId),
      tx.pure.u64(linkIndex),
      tx.object('0x6'), // Clock object ID
    ],
  });

  return tx;
}

// Execute transaction with sponsorship
export async function executeWithSponsorship(tx: Transaction) {
  try {
    console.log('Preparing transaction for sponsorship...');
    
    // Build the transaction bytes
    const transactionBytes = await tx.build({ client: suiClient });
    
    // Execute with Enoki sponsorship
    const result = await executeSponsoredTransaction(transactionBytes);
    
    return result;
  } catch (error) {
    console.error('Sponsored transaction failed:', error);
    throw error;
  }
}
