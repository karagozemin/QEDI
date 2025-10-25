import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { getProfileByUsername, recordLinkClickTransaction } from '../lib/sui-client';
import SocialIcon from '../components/SocialIcon';

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (username) {
      loadProfile();
    }
  }, [username]);

  const loadProfile = async () => {
    if (!username) return;
    
    setLoading(true);
    setError('');
    setProfile(null);
    
    try {
      console.log('=== PROFILE PAGE DEBUG ===');
      console.log('Loading profile for username:', username);
      
      // Use the new getProfileByUsername function
      const profileResult = await getProfileByUsername(username);
      
      if (!profileResult || !profileResult.data) {
        console.log('Profile not found for username:', username);
        setError(`The profile "@${username}" doesn't exist or hasn't been created yet.`);
        return;
      }

      console.log('Profile loaded successfully:', profileResult);
      setProfile(profileResult);
      
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = async (linkIndex: number, url: string) => {
    // Ensure URL has protocol
    let formattedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      formattedUrl = 'https://' + url;
    }
    
    console.log('Opening URL:', formattedUrl);
    
    // Open the link
    window.open(formattedUrl, '_blank', 'noopener,noreferrer');

    // Record the click on-chain (optional, requires wallet connection)
    if (profile?.data?.objectId) {
      try {
        const tx = recordLinkClickTransaction(profile.data.objectId, linkIndex);
        
        signAndExecuteTransaction(
          { transaction: tx },
          {
            onSuccess: (result) => {
              console.log('Click recorded:', result);
              // Reload profile to update click count
              loadProfile();
            },
            onError: (error) => {
              console.error('Failed to record click:', error);
              // Don't show error to user, click tracking is optional
            },
          }
        );
      } catch (error) {
        console.error('Failed to prepare click transaction:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Profile Not Found</h2>
          <p className="text-gray-300 mb-6">
            The profile "@{username}" doesn't exist or hasn't been created yet.
          </p>
          <a 
            href="/create" 
            className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-blue-500/25 transform hover:-translate-y-1 transition-all duration-300"
          >
            Create Your Profile
          </a>
        </div>
      </div>
    );
  }

  const profileData = profile.data?.content?.fields;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          {/* Profile Header */}
          <div className="text-center mb-8">
            {profileData?.avatar_url && (
              <img 
                src={profileData.avatar_url} 
                alt={profileData.display_name}
                className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-blue-500/30 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <h1 className="text-3xl font-bold text-white mb-2">
              {profileData?.display_name || 'Unnamed Profile'}
            </h1>
            <p className="text-blue-400 font-medium mb-4">@{profileData?.username}</p>
            {profileData?.bio && (
              <p className="text-gray-300 text-center max-w-sm mx-auto">
                {profileData.bio}
              </p>
            )}
          </div>

          {/* Links */}
          <div className="space-y-4">
            {profileData?.links && profileData.links.length > 0 ? (
              profileData.links.map((link: any, index: number) => {
                // Extract link data from fields
                const linkData = link.fields || link;
                
                return (
                  <button
                    key={index}
                    onClick={() => handleLinkClick(index, linkData.url)}
                    className="w-full flex items-center justify-between p-4 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-600/30 hover:bg-gray-700/50 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transform hover:-translate-y-1 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 ${
                        linkData.icon === 'twitter' ? 'bg-black text-white' :
                        linkData.icon === 'instagram' ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white' :
                        linkData.icon === 'youtube' ? 'bg-red-600 text-white' :
                        linkData.icon === 'github' ? 'bg-gray-900 text-white' :
                        linkData.icon === 'linkedin' ? 'bg-blue-600 text-white' :
                        linkData.icon === 'website' ? 'bg-blue-500 text-white' :
                        linkData.icon === 'email' ? 'bg-gray-600 text-white' :
                        'bg-gray-700 text-white'
                      }`}>
                        <SocialIcon icon={linkData.icon} className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <div className="text-white font-semibold group-hover:text-blue-300 transition-colors duration-300">
                          {linkData.title}
                        </div>
                        <div className="text-gray-400 text-sm">
                          {linkData.click_count || 0} clicks
                        </div>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </button>
                );
              })
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <p className="text-gray-400">No links added yet</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-12 pt-8 border-t border-gray-700/50">
            <div className="flex items-center justify-center gap-2 text-gray-400 text-sm mb-4">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <span>Powered by QEDI</span>
            </div>
            <a 
              href="/" 
              className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors duration-300"
            >
              Create your own LinkTree →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
