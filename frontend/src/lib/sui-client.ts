import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, REGISTRY_ID, NETWORK } from './constants';
// import { executeSponsoredTransaction } from './enoki'; // Temporarily disabled

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

// Get profile by username - Registry bug is now FIXED!
export async function getProfileByUsername(username: string) {
  try {
    console.log('=== PROFILE LOOKUP DEBUG ===');
    console.log('Looking for username:', username);
    console.log('Registry ID:', REGISTRY_ID);

    // Get registry object to check if it exists
    const registryResult = await suiClient.getObject({
      id: REGISTRY_ID,
      options: {
        showContent: true,
        showType: true,
      },
    });

    console.log('Registry result:', registryResult);

    if (!registryResult.data?.content) {
      console.log('Registry not found or has no content');
      return null;
    }

    // Get dynamic fields from registry (username -> profile_id mappings)
    console.log('Fetching dynamic fields from registry...');
    const dynamicFields = await suiClient.getDynamicFields({
      parentId: REGISTRY_ID,
    });

    console.log('Dynamic fields:', dynamicFields);

    if (!dynamicFields.data || dynamicFields.data.length === 0) {
      console.log('No dynamic fields found in registry');
      return null;
    }

    // Look for the username in dynamic fields
    let profileId = null;
    for (const field of dynamicFields.data) {
      console.log('Checking field:', field);
      
      // The field name should contain the username
      if (field.name && field.name.value === username) {
        // Get the dynamic field object to extract the profile ID
        const fieldObject = await suiClient.getDynamicFieldObject({
          parentId: REGISTRY_ID,
          name: {
            type: 'string',
            value: username
          }
        });
        
        console.log('Field object for username:', fieldObject);
        
        if (fieldObject.data?.content && 'fields' in fieldObject.data.content) {
          const fields = fieldObject.data.content.fields as any;
          profileId = fields.value;
          console.log('Found profile ID:', profileId);
          break;
        }
      }
    }

    if (!profileId) {
      console.log('Profile ID not found for username:', username);
      return null;
    }

    // Fetch the actual profile object
    console.log('Fetching profile object with ID:', profileId);
    const profileResult = await suiClient.getObject({
      id: profileId,
      options: {
        showContent: true,
        showType: true,
      },
    });

    console.log('Profile result:', profileResult);
    return profileResult;

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
export async function executeWithSponsorship(tx: Transaction, senderAddress?: string) {
  try {
    console.log('Preparing transaction for sponsorship...');
    
    // Set sender address if provided (required for zkLogin users)
    if (senderAddress) {
      tx.setSender(senderAddress);
      console.log('Transaction sender set to:', senderAddress);
    }
    
    // For sponsored transactions, we don't need gas coins
    // Set gas budget to 0 and let Enoki handle the gas payment
    tx.setGasBudget(1000000); // Set a reasonable gas budget
    
    // Build the transaction bytes without requiring gas coins
    // TODO: Fix this to use new 3-step workflow
    throw new Error('executeWithSponsorship temporarily disabled - use Create.tsx direct flow');
  } catch (error) {
    console.error('Sponsored transaction failed:', error);
    throw error;
  }
}
