import { useState, useEffect } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction, useSignTransaction, useWallets } from '@mysten/dapp-kit';
import { isEnokiWallet } from '@mysten/enoki';
import { getUserProfiles, addMultipleLinksTransaction } from '../lib/sui-client';
import { BACKEND_URL } from '../lib/constants';
import DarkVeil from '../components/DarkVeil';

export default function EditProfile() {
  const currentAccount = useCurrentAccount();
  const wallets = useWallets();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { mutateAsync: signTransaction } = useSignTransaction();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Array to hold multiple links before saving
  const [pendingLinks, setPendingLinks] = useState<Array<{title: string; url: string; icon: string}>>([]);
  
  const [newLink, setNewLink] = useState({
    title: '',
    url: '',
    icon: 'link'
  });

  useEffect(() => {
    if (currentAccount?.address) {
      loadProfiles();
    }
  }, [currentAccount]);

  const loadProfiles = async () => {
    if (!currentAccount?.address) return;
    
    setLoading(true);
    try {
      const userProfiles = await getUserProfiles(currentAccount.address);
      setProfiles(userProfiles);
      if (userProfiles.length > 0) {
        setSelectedProfile(userProfiles[0]); // Select first profile by default
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add link to pending list (not blockchain yet)
  const handleAddLinkToPending = () => {
    if (!newLink.title || !newLink.url) {
      alert('Please fill in all fields');
      return;
    }

    setPendingLinks(prev => [...prev, { ...newLink }]);
    setNewLink({ title: '', url: '', icon: 'link' });
  };

  // Remove link from pending list
  const handleRemovePending = (index: number) => {
    setPendingLinks(prev => prev.filter((_, i) => i !== index));
  };

  // Save all pending links to blockchain in a single PTB transaction
  const handleSaveAllLinks = async () => {
    if (!selectedProfile || pendingLinks.length === 0) {
      alert('No links to save');
      return;
    }

    console.log('=== SAVE ALL LINKS DEBUG ===');
    console.log('Current account:', currentAccount);
    console.log('Wallets:', wallets);
    console.log('Selected profile:', selectedProfile);
    console.log('Pending links:', pendingLinks);

    setIsSaving(true);

    try {
      // Create PTB with all pending links
      const batchTx = addMultipleLinksTransaction(
        selectedProfile.data.objectId,
        pendingLinks
      );
      
      console.log('Batch transaction created with', pendingLinks.length, 'links');
      console.log('Profile ID:', selectedProfile.data.objectId);

      // Check if using Enoki wallet
      const currentWallet = wallets.find(w => w.accounts.some(acc => acc.address === currentAccount?.address));
      const isEnokiConnected = currentWallet ? isEnokiWallet(currentWallet) : false;
      
      console.log('Current wallet:', currentWallet);
      console.log('Is Enoki connected:', isEnokiConnected);

      if (isEnokiConnected) {
        console.log('Using sponsored transaction for batch link addition...');
        
        try {
          // Step 1: Create sponsored transaction via backend
          console.log('📝 Step 1: Creating batch sponsored transaction via backend...');
          const createResponse = await fetch(`${BACKEND_URL}/api/add-multiple-links`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              profileId: selectedProfile.data.objectId,
              links: pendingLinks,
              sender: currentAccount?.address,
            }),
          });

          if (!createResponse.ok) {
            const errorData = await createResponse.json();
            throw new Error(`Backend error: ${errorData.error}`);
          }

          const { digest, bytes } = await createResponse.json();
          console.log('✅ Batch sponsored transaction created:', { digest, bytesLength: bytes.length });

          // Step 2: Sign the transaction bytes
          console.log('✍️ Step 2: Signing transaction...');
          const { signature } = await signTransaction({
            transaction: bytes
          });

          if (!signature) {
            throw new Error('Failed to get signature from user');
          }

          console.log('✅ Transaction signed successfully');

          // Step 3: Execute sponsored transaction via backend
          console.log('🚀 Step 3: Executing batch sponsored transaction via backend...');
          const executeResponse = await fetch(`${BACKEND_URL}/api/execute-transaction`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              digest,
              signature,
            }),
          });

          if (!executeResponse.ok) {
            const errorData = await executeResponse.json();
            throw new Error(`Execution error: ${errorData.error}`);
          }

          const { result } = await executeResponse.json();
          console.log('✅ Batch sponsored transaction executed successfully:', result);
          
          alert(`Successfully added ${pendingLinks.length} links with zkLogin (gas-free)! Transaction: ${result.result?.digest || digest}`);
          
          // Clear pending links
          setPendingLinks([]);
          // Reset form
          setNewLink({ title: '', url: '', icon: 'link' });
          // Reload profiles
          loadProfiles();
          
        } catch (sponsorError) {
          console.error('Batch sponsored transaction failed:', sponsorError);
          alert(`Failed to add links: ${sponsorError instanceof Error ? sponsorError.message : 'Unknown error'}`);
        }
      } else {
        // Regular wallet transaction - send PTB with all links
        console.log('Using regular wallet transaction...');
        
        signAndExecuteTransaction(
          {
            transaction: batchTx,
          },
          {
            onSuccess: (result) => {
              console.log('All links added successfully:', result);
              alert(`Successfully added ${pendingLinks.length} links! Transaction: ${result.digest}`);
              // Clear pending links
              setPendingLinks([]);
              // Reset form
              setNewLink({ title: '', url: '', icon: 'link' });
              // Reload profiles
              loadProfiles();
            },
            onError: (error) => {
              console.error('Batch link addition failed:', error);
              alert(`Failed to add links: ${error.message}`);
            },
          }
        );
      }
    } catch (error) {
      console.error('Transaction preparation failed:', error);
      alert('Failed to prepare transaction');
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentAccount) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 pt-24">
        {/* DarkVeil Background - Fixed to cover entire page */}
        <div className="fixed inset-0 opacity-30 pointer-events-none z-0">
          <DarkVeil speed={0.3} />
        </div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-white mb-6">Edit Profile</h1>
            <p className="text-xl text-gray-300">Please connect your wallet to edit your profile</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 pt-24">
        {/* DarkVeil Background - Fixed to cover entire page */}
        <div className="fixed inset-0 opacity-30 pointer-events-none z-0">
          <DarkVeil speed={0.3} />
        </div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-gray-300">Loading your profiles...</p>
          </div>
        </div>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 pt-24">
        {/* DarkVeil Background - Fixed to cover entire page */}
        <div className="fixed inset-0 opacity-30 pointer-events-none z-0">
          <DarkVeil speed={0.3} />
        </div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-white mb-6">Edit Profile</h1>
            <p className="text-xl text-gray-300 mb-8">You don't have any profiles yet.</p>
            <a 
              href="/create" 
              className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-blue-500/25 transform hover:-translate-y-1 transition-all duration-300"
            >
              Create Your First Profile
            </a>
          </div>
        </div>
      </div>
    );
  }

  const profileData = selectedProfile?.data?.content?.fields;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 pt-24">
      {/* DarkVeil Background - Fixed to cover entire page */}
      <div className="fixed inset-0 opacity-30 pointer-events-none z-0">
        <DarkVeil speed={0.3} />
      </div>
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-6">Edit Profile</h1>
            <p className="text-xl text-gray-300">Manage your on-chain LinkTree profile</p>
          </div>

          {/* Profile Selector - Only show if multiple profiles */}
          {profiles.length > 1 && (
            <div className="bg-gradient-to-br from-blue-800/30 to-indigo-800/30 backdrop-blur-xl rounded-2xl shadow-xl border border-blue-500/30 p-6 mb-8">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Select Profile to Edit
              </label>
              <select
                value={selectedProfile?.data?.objectId || ''}
                onChange={(e) => {
                  const profile = profiles.find(p => p.data?.objectId === e.target.value);
                  setSelectedProfile(profile || null);
                }}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              >
                {profiles.map((profile) => {
                  const data = profile.data?.content?.fields;
                  return (
                    <option key={profile.data?.objectId} value={profile.data?.objectId}>
                      @{data?.username} - {data?.display_name}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Profile Info */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-600/30 p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Current Profile</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-300"><span className="font-medium">Username:</span> {profileData?.username}</p>
                <p className="text-gray-300"><span className="font-medium">Display Name:</span> {profileData?.display_name}</p>
                <p className="text-gray-300"><span className="font-medium">Bio:</span> {profileData?.bio}</p>
              </div>
              <div>
                <p className="text-gray-300"><span className="font-medium">Theme:</span> {profileData?.theme}</p>
                <p className="text-gray-300"><span className="font-medium">Total Clicks:</span> {profileData?.total_clicks}</p>
                <p className="text-gray-300"><span className="font-medium">Links:</span> {profileData?.links?.length || 0}</p>
              </div>
            </div>
          </div>

          {/* Add Link Form */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-600/30 p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Add Links (Batch Mode)</h2>
            <p className="text-gray-300 mb-6">Add multiple links and save them all in a single transaction!</p>
            
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Link Title *
                  </label>
                  <input
                    type="text"
                    value={newLink.title}
                    onChange={(e) => setNewLink(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="My Website"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    URL *
                  </label>
                  <input
                    type="url"
                    value={newLink.url}
                    onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://example.com"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Icon
                </label>
                <select
                  value={newLink.icon}
                  onChange={(e) => setNewLink(prev => ({ ...prev, icon: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="link">🔗 Link</option>
                  <option value="twitter">🐦 Twitter</option>
                  <option value="instagram">📷 Instagram</option>
                  <option value="youtube">📺 YouTube</option>
                  <option value="github">💻 GitHub</option>
                  <option value="linkedin">💼 LinkedIn</option>
                  <option value="website">🌐 Website</option>
                  <option value="email">📧 Email</option>
                </select>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleAddLinkToPending}
                  disabled={!newLink.title || !newLink.url}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-green-500/25 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  + Add to List
                </button>
              </div>
            </div>

            {/* Pending Links List */}
            {pendingLinks.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-600/30">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">
                    Pending Links ({pendingLinks.length})
                  </h3>
                  <button
                    onClick={handleSaveAllLinks}
                    disabled={isSaving}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-blue-500/25 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSaving ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving {pendingLinks.length} Links...
                      </div>
                    ) : (
                      `Save All ${pendingLinks.length} Links (1 Transaction)`
                    )}
                  </button>
                </div>

                <div className="space-y-3">
                  {pendingLinks.map((link, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">
                          {link.icon === 'twitter' ? '🐦' : 
                           link.icon === 'instagram' ? '📷' : 
                           link.icon === 'youtube' ? '📺' : 
                           link.icon === 'github' ? '💻' : 
                           link.icon === 'linkedin' ? '💼' : 
                           link.icon === 'website' ? '🌐' : 
                           link.icon === 'email' ? '📧' : '🔗'}
                        </span>
                        <div>
                          <h3 className="text-white font-medium">{link.title}</h3>
                          <p className="text-gray-300 text-sm">{link.url}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemovePending(index)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="text-yellow-300 font-semibold mb-1">Batch Transaction</h4>
                      <p className="text-yellow-200 text-sm">
                        All {pendingLinks.length} links will be added in a single transaction, saving gas fees and time!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Current Links */}
          {profileData?.links && profileData.links.length > 0 && (
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-600/30 p-8 mt-8">
              <h2 className="text-2xl font-bold text-white mb-6">Current Links</h2>
              <div className="space-y-4">
                {profileData.links.map((link: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">
                        {link.icon === 'twitter' ? '🐦' : 
                         link.icon === 'instagram' ? '📷' : 
                         link.icon === 'youtube' ? '📺' : 
                         link.icon === 'github' ? '💻' : 
                         link.icon === 'linkedin' ? '💼' : 
                         link.icon === 'website' ? '🌐' : 
                         link.icon === 'email' ? '📧' : '🔗'}
                      </span>
                      <div>
                        <h3 className="text-white font-medium">{link.title}</h3>
                        <p className="text-gray-400 text-sm">{link.url}</p>
                        <p className="text-gray-500 text-xs">Clicks: {link.click_count}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
