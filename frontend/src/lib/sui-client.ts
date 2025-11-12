import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, REGISTRY_ID, NETWORK, OLD_PACKAGE_IDS, OLD_REGISTRY_IDS } from './constants';
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
  theme: string = 'default',
  isPrivate: boolean = false,
  showBio: boolean = true,
  showLinks: boolean = true,
  allowAnonymous: boolean = true,
  walrusAvatarHash: string = '',
  zkLoginProvider: string = '',
  zkLoginSub: string = ''
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
      tx.pure.bool(isPrivate),
      tx.pure.bool(showBio),
      tx.pure.bool(showLinks),
      tx.pure.bool(allowAnonymous),
      tx.pure.string(walrusAvatarHash),
      tx.pure.string(zkLoginProvider),
      tx.pure.string(zkLoginSub),
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

// Add multiple links in a single PTB transaction
export function addMultipleLinksTransaction(
  profileId: string,
  links: Array<{ title: string; url: string; icon: string }>
) {
  const tx = new Transaction();
  
  // Add each link in the same transaction block
  links.forEach(link => {
    tx.moveCall({
      target: `${PACKAGE_ID}::linktree::add_link`,
      arguments: [
        tx.object(profileId),
        tx.pure.string(link.title),
        tx.pure.string(link.url),
        tx.pure.string(link.icon),
        tx.object('0x6'), // Clock object ID
      ],
    });
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

// Helper function to search for username in a specific registry
async function searchUsernameInRegistry(username: string, registryId: string): Promise<string | null> {
  try {
    console.log(`Searching in registry: ${registryId}`);

    // Get registry object
    const registryResult = await suiClient.getObject({
      id: registryId,
      options: {
        showContent: true,
        showType: true,
      },
    });

    if (!registryResult.data?.content || !('fields' in registryResult.data.content)) {
      console.log(`Registry ${registryId} not found or invalid`);
      return null;
    }

    const registryFields = registryResult.data.content.fields as any;
    const usernamesTableId = registryFields.usernames.fields.id.id;

    // Get dynamic fields from usernames table
    const dynamicFields = await suiClient.getDynamicFields({
      parentId: usernamesTableId,
    });

    if (!dynamicFields.data || dynamicFields.data.length === 0) {
      return null;
    }

    // Look for the username in dynamic fields
    for (const field of dynamicFields.data) {
      if (field.name && field.name.value === username) {
        const fieldObject = await suiClient.getObject({
          id: field.objectId,
          options: {
            showContent: true,
          },
        });
        
        if (fieldObject.data?.content && 'fields' in fieldObject.data.content) {
          const fields = fieldObject.data.content.fields as any;
          console.log(`✅ Found username "${username}" in registry ${registryId}`);
          return fields.value; // Return profile ID
        }
      }
    }

    return null;
  } catch (error) {
    console.error(`Error searching registry ${registryId}:`, error);
    return null;
  }
}

// Get profile by username - Supports multiple registries for backward compatibility
export async function getProfileByUsername(username: string) {
  try {
    console.log('=== PROFILE LOOKUP DEBUG ===');
    console.log('Looking for username:', username);

    // Search in current registry first
    console.log('Searching in CURRENT registry...');
    let profileId = await searchUsernameInRegistry(username, REGISTRY_ID);

    // If not found, search in old registries
    if (!profileId) {
      console.log('Not found in current registry, searching in OLD registries...');
      for (const oldRegistryId of OLD_REGISTRY_IDS) {
        profileId = await searchUsernameInRegistry(username, oldRegistryId);
        if (profileId) break;
      }
    }

    if (!profileId) {
      console.log('❌ Profile ID not found for username:', username);
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

// Get user's profiles (supporting all contract versions)
export async function getUserProfiles(userAddress: string) {
  try {
    console.log('Fetching profiles for address:', userAddress);
    
    // Fetch profiles with current package ID
    const currentResult = await suiClient.getOwnedObjects({
      owner: userAddress,
      filter: {
        StructType: `${PACKAGE_ID}::linktree::LinkTreeProfile`,
      },
      options: {
        showContent: true,
        showType: true,
      },
    });

    console.log('Current package profiles:', currentResult.data.length);

    // Fetch profiles from all old package IDs
    const oldResults = await Promise.all(
      OLD_PACKAGE_IDS.map(oldPackageId => 
        suiClient.getOwnedObjects({
          owner: userAddress,
          filter: {
            StructType: `${oldPackageId}::linktree::LinkTreeProfile`,
          },
          options: {
            showContent: true,
            showType: true,
          },
        })
      )
    );

    // Combine all results
    const allProfiles = [
      ...currentResult.data,
      ...oldResults.flatMap(result => result.data)
    ];

    console.log('Total profiles found (all versions):', allProfiles.length);

    // Remove duplicates by objectId
    const uniqueProfiles = allProfiles.filter((profile, index, self) => 
      index === self.findIndex((p) => p.data?.objectId === profile.data?.objectId)
    );
    
    console.log('Unique profiles:', uniqueProfiles.length);
    return uniqueProfiles;
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
