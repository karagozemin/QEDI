import { useState, useEffect } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { getUserProfiles } from '../lib/sui-client';
import SocialIcon from '../components/SocialIcon';
import DarkVeil from '../components/DarkVeil';

export default function MyProfiles() {
  const currentAccount = useCurrentAccount();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentAccount?.address) {
      loadProfiles();
    }
  }, [currentAccount]);

  const loadProfiles = async () => {
    if (!currentAccount?.address) return;
    
    setLoading(true);
    try {
      console.log('=== MY PROFILES DEBUG ===');
      console.log('Current account:', currentAccount);
      console.log('Current account address:', currentAccount.address);
      
      // Check both current account and zkLogin session addresses
      const addresses = [currentAccount.address];
      
      const zkLoginSession = localStorage.getItem('qedi_session');
      if (zkLoginSession) {
        const session = JSON.parse(zkLoginSession);
        console.log('zkLogin session found:', session);
        console.log('zkLogin address:', session.address);
        
        // Add zkLogin address if different
        if (session.address !== currentAccount.address) {
          addresses.push(session.address);
        }
      }
      
      console.log('Checking profiles for addresses:', addresses);
      
      // Get profiles from all addresses
      let allProfiles: any[] = [];
      for (const address of addresses) {
        console.log('Fetching profiles for address:', address);
        const addressProfiles = await getUserProfiles(address);
        console.log(`Profiles for ${address}:`, addressProfiles);
        console.log('Raw profile data:', JSON.stringify(addressProfiles, null, 2));
        allProfiles = [...allProfiles, ...addressProfiles];
      }
      
      // Also check transaction digest manually
      console.log('Recent transaction digest: VWAsLReDgtG4EBd2K7mEnHx18qF5aNEHTMperpds7go');
      console.log('Check on Sui Explorer: https://suiexplorer.com/txblock/VWAsLReDgtG4EBd2K7mEnHx18qF5aNEHTMperpds7go?network=testnet');
      
      console.log('All profiles found:', allProfiles);
      
      // Sort by created_at - newest first
      const sortedProfiles = allProfiles.sort((a, b) => {
        const aCreatedAt = Number(a.data?.content?.fields?.created_at || 0);
        const bCreatedAt = Number(b.data?.content?.fields?.created_at || 0);
        return bCreatedAt - aCreatedAt; // Descending order (newest first)
      });
      
      console.log('Sorted profiles (newest first):', sortedProfiles.map(p => ({
        username: p.data?.content?.fields?.username,
        created_at: p.data?.content?.fields?.created_at
      })));
      
      setProfiles(sortedProfiles);
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = (url: string) => {
    let formattedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      formattedUrl = 'https://' + url;
    }
    console.log('Opening URL:', formattedUrl);
    window.open(formattedUrl, '_blank', 'noopener,noreferrer');
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
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-6">My Profiles</h1>
            <p className="text-xl text-gray-300 mb-8">Connect your wallet to view your on-chain LinkTree profiles</p>
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
            <h2 className="text-2xl font-bold text-white mb-4">Loading Your Profiles</h2>
            <p className="text-gray-300">Fetching your on-chain LinkTree profiles...</p>
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
            <div className="w-24 h-24 bg-gradient-to-br from-gray-700 to-gray-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold text-white mb-6">No Profiles Found</h2>
            <p className="text-xl text-gray-300 mb-8">You haven't created any LinkTree profiles yet.</p>
            <a 
              href="/create" 
              className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:shadow-xl hover:shadow-blue-500/25 transform hover:-translate-y-1 transition-all duration-300"
            >
              Create Your First Profile
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 pt-24">
      {/* DarkVeil Background - Fixed to cover entire page */}
      <div className="fixed inset-0 opacity-30 pointer-events-none z-0">
        <DarkVeil speed={0.3} />
      </div>
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-6">My Profiles</h1>
            <p className="text-xl text-gray-300">Manage your on-chain LinkTree profiles</p>
          </div>

          {/* Profiles Grid */}
          <div className="space-y-8">
            {profiles.map((profile, index) => {
              const profileData = profile.data?.content?.fields;
              console.log('=== FULL PROFILE DEBUG ===');
              console.log('Raw profile object:', profile);
              console.log('Profile data fields:', profileData);
              console.log('Links array:', profileData?.links);
              console.log('Links length:', profileData?.links?.length);
              console.log('========================');
              
              return (
                <div key={profile.data?.objectId || index} className="bg-gradient-to-br from-gray-800/60 to-gray-700/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-600/30 overflow-hidden">
                  {/* Profile Header */}
                  <div className="p-8 pb-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-6">
                        {profileData?.avatar_url && (
                          <img 
                            src={profileData.avatar_url} 
                            alt="Profile Avatar" 
                            className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-500/30"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        <div>
                          <h2 className="text-3xl font-bold text-white mb-2">
                            {profileData?.display_name || 'Unnamed Profile'}
                          </h2>
                          <p className="text-blue-400 font-medium text-lg mb-2">@{profileData?.username}</p>
                          {profileData?.bio && (
                            <p className="text-gray-300 max-w-md">{profileData.bio}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <a 
                          href={`/${profileData?.username}`}
                          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-1 transition-all duration-300"
                        >
                          View Profile
                        </a>
                        <a 
                          href={`https://suiscan.xyz/testnet/object/${profile.data?.objectId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-green-500/25 transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                          title="View on SuiScan Explorer"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          SuiScan
                        </a>
                        <a 
                          href="/edit-profile"
                          className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-700 transition-colors duration-300"
                        >
                          Edit
                        </a>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-gray-700/40 rounded-2xl p-4 text-center">
                        <div className="text-3xl font-bold text-blue-400 mb-1">
                          {profileData?.links?.length || 0}
                        </div>
                        <div className="text-gray-300 text-sm font-medium">Links</div>
                      </div>
                      <div className="bg-gray-700/40 rounded-2xl p-4 text-center">
                        <div className="text-3xl font-bold text-purple-400 mb-1 capitalize">
                          {profileData?.theme || 'default'}
                        </div>
                        <div className="text-gray-300 text-sm font-medium">Theme</div>
                      </div>
                    </div>
                  </div>

                  {/* Links Section */}
                  {profileData?.links && profileData.links.length > 0 ? (
                    <div className="px-8 pb-8">
                      <h3 className="text-xl font-bold text-white mb-4">Your Links</h3>
                      <div className="space-y-3">
                        {profileData.links.map((link: any, linkIndex: number) => {
                          // Extract link data from fields
                          const linkData = link.fields || link;
                          console.log('Individual link:', link);
                          console.log('Link fields:', linkData);
                          console.log('Link title:', linkData.title);
                          console.log('Link URL:', linkData.url);
                          console.log('Link icon:', linkData.icon);
                          
                          return (
                            <button
                              key={linkIndex}
                              onClick={() => handleLinkClick(linkData.url)}
                              className="w-full flex items-center gap-4 p-4 bg-gray-800/60 hover:bg-gray-700/60 rounded-2xl border border-gray-600/30 hover:border-blue-500/50 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 group"
                            >
                              {/* Icon */}
                              <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                                linkData.icon === 'twitter' ? 'bg-black text-white' :
                                linkData.icon === 'instagram' ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white' :
                                linkData.icon === 'youtube' ? 'bg-red-600 text-white' :
                                linkData.icon === 'github' ? 'bg-gray-900 text-white' :
                                linkData.icon === 'linkedin' ? 'bg-blue-600 text-white' :
                                linkData.icon === 'website' ? 'bg-blue-500 text-white' :
                                linkData.icon === 'email' ? 'bg-gray-600 text-white' :
                                'bg-gray-700 text-white'
                              }`}>
                                <SocialIcon icon={linkData.icon} className="w-7 h-7" />
                              </div>

                              {/* Content */}
                              <div className="flex-1 text-left">
                                <div className="text-white font-semibold text-lg group-hover:text-blue-300 transition-colors duration-300">
                                  {linkData.title}
                                </div>
                                <div className="text-gray-400 text-sm truncate max-w-md">
                                  {linkData.url}
                                </div>
                              </div>

                              {/* Stats & Arrow */}
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className="text-gray-300 font-medium">
                                    {linkData.click_count || 0}
                                  </div>
                                  <div className="text-gray-500 text-xs">clicks</div>
                                </div>
                                <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="px-8 pb-8">
                      <div className="bg-gray-700/30 rounded-2xl p-8 text-center">
                        <div className="w-16 h-16 bg-gray-600/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-white mb-2">No Links Yet</h4>
                        <p className="text-gray-400 mb-4">Add some links to your profile to get started</p>
                        <a 
                          href="/edit-profile"
                          className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors duration-300"
                        >
                          Add Links
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="px-8 py-4 bg-gray-800/40 border-t border-gray-600/30">
                    <div className="flex justify-between items-center text-sm text-gray-400">
                      <span>Created: {new Date(parseInt(profileData?.created_at || '0')).toLocaleDateString()}</span>
                      <span className="font-mono">ID: {profile.data?.objectId?.slice(0, 8)}...{profile.data?.objectId?.slice(-8)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Debug Section - Remove in production */}
          <div className="mt-12 bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-blue-300 mb-3">Debug Info</h4>
            <div className="space-y-2 text-sm">
              <p className="text-gray-300">
                <span className="font-medium">Wallet Address:</span> {currentAccount.address}
              </p>
              <p className="text-gray-300">
                <span className="font-medium">Total Profiles Found:</span> {profiles.length}
              </p>
              <button 
                onClick={loadProfiles}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
              >
                Refresh Profiles
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}