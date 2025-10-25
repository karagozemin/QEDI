import { useState, useEffect } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { getUserProfiles, addLinkTransaction } from '../lib/sui-client';

export default function EditProfile() {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAddingLink, setIsAddingLink] = useState(false);
  
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

  const handleAddLink = async () => {
    if (!selectedProfile || !newLink.title || !newLink.url) {
      alert('Please fill in all fields');
      return;
    }

    setIsAddingLink(true);

    try {
      const tx = addLinkTransaction(
        selectedProfile.data.objectId,
        newLink.title,
        newLink.url,
        newLink.icon
      );

      signAndExecuteTransaction(
        {
          transaction: tx,
        },
        {
          onSuccess: (result) => {
            console.log('Link added successfully:', result);
            alert(`Link added successfully! Transaction: ${result.digest}`);
            // Reset form
            setNewLink({ title: '', url: '', icon: 'link' });
            // Reload profiles
            loadProfiles();
          },
          onError: (error) => {
            console.error('Link addition failed:', error);
            alert(`Link addition failed: ${error.message}`);
          },
        }
      );
    } catch (error) {
      console.error('Transaction preparation failed:', error);
      alert('Failed to prepare transaction');
    } finally {
      setIsAddingLink(false);
    }
  };

  if (!currentAccount) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 pt-24">
        <div className="container mx-auto px-4 py-20">
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
        <div className="container mx-auto px-4 py-20">
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
        <div className="container mx-auto px-4 py-20">
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
      <div className="container mx-auto px-4 py-20">
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
            <h2 className="text-2xl font-bold text-white mb-6">Add New Link</h2>
            
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
                  onClick={handleAddLink}
                  disabled={isAddingLink || !newLink.title || !newLink.url}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-blue-500/25 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isAddingLink ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Adding Link...
                    </div>
                  ) : (
                    'Add Link'
                  )}
                </button>
              </div>
            </div>
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
