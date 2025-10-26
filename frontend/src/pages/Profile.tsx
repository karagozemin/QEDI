import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { getProfileByUsername } from '../lib/sui-client';
import SocialIcon from '../components/SocialIcon';
import Galaxy from '../components/Galaxy';
import DonationModal from '../components/DonationModal';

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showDonationModal, setShowDonationModal] = useState(false);

  // Get profile data early for memoization
  const profileData = profile?.data?.content?.fields;

  // Memoize modal to prevent unnecessary re-renders
  const donationModal = useMemo(() => (
    <DonationModal
      isOpen={showDonationModal}
      onClose={() => setShowDonationModal(false)}
      profileOwner={profileData?.owner || ''}
      username={profileData?.username || ''}
    />
  ), [showDonationModal, profileData?.owner, profileData?.username]);

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

      console.log('Profile result:', profileResult); 
      
      if (!profileResult) {
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

  const handleLinkClick = async (url: string, linkIndex: number) => {
    // Ensure URL has protocol
    let formattedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      formattedUrl = 'https://' + url;
    }
    
    console.log('Opening URL:', formattedUrl);
    
    // Track click on-chain (sponsored transaction)
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'https://qedi.onrender.com'}/api/track-click`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileId: profile.data.objectId,
          linkIndex: linkIndex
        }),
      });

      if (response.ok) {
        console.log('Click tracked successfully');
        // Reload profile to update click counts
        loadProfile();
      }
    } catch (error) {
      console.error('Failed to track click:', error);
      // Continue with opening link even if tracking fails
    }
    
    // Open the link
    window.open(formattedUrl, '_blank', 'noopener,noreferrer');
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

  return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-gray-900 flex items-center justify-center py-12 px-4 relative overflow-hidden">
          {/* Galaxy Background */}
          <div className="fixed inset-0 z-0">
            <Galaxy 
              hueShift={240}
              density={0.8}
              glowIntensity={0.2}
              saturation={0.3}
              twinkleIntensity={0.5}
              rotationSpeed={0.05}
              mouseInteraction={false}
              transparent={true}
            />
          </div>
          
          {/* Animated Background Blobs */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-blue-500/8 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-purple-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>

          <div className="container mx-auto max-w-2xl relative z-10 w-full">
        {/* Glassmorphism Card */}
        <div className="backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl overflow-hidden mt-20 mb-8">
          {/* Header Section */}
          <div className="relative bg-gradient-to-br from-blue-600/15 to-purple-600/15 p-8 sm:p-12">
            <div className="text-center">
              {/* Avatar with Animated Gradient Ring */}
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-lg opacity-75 animate-pulse"></div>
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-1">
                  {profileData?.avatar_url ? (
                    <img 
                      src={profileData.avatar_url} 
                      alt={profileData.display_name}
                      className="w-full h-full rounded-full object-cover bg-gray-900"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                      <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Name & Username */}
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
                {profileData?.display_name || 'Unnamed Profile'}
              </h1>
              <div className="flex items-center justify-center gap-2 mb-4">
                <p className="text-lg text-blue-300 font-medium">@{profileData?.username}</p>
                {profileData?.is_verified && (
                  <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                )}
              </div>

              {/* Bio */}
              {profileData?.bio && (
                <p className="text-gray-200 text-lg max-w-md mx-auto leading-relaxed mb-8">
                  {profileData.bio}
                </p>
              )}

              {/* Stats Bar */}
              <div className="flex items-center justify-center gap-6 mt-8 flex-wrap">
                <div className="w-36 h-20 flex items-center justify-center bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl backdrop-blur-sm border border-white/20 shadow-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{profileData?.links?.length || 0}</div>
                    <div className="text-xs text-gray-300 font-medium mt-1">Links</div>
                  </div>
                </div>
                <button
                  onClick={() => setShowDonationModal(true)}
                  className="w-36 h-20 flex items-center justify-center bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-yellow-500/25 hover:scale-105 transition-all duration-300"
                  title="Send SUI Donation"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-xs text-gray-300 font-medium mt-1">
                      Donate
                    </div>
                  </div>
                </button>
                <a 
                  href={`https://suiscan.xyz/testnet/object/${profile.data?.objectId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-36 h-20 flex items-center justify-center bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-green-500/25 hover:scale-105 transition-all duration-300"
                  title="View on SuiScan Explorer"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                    <div className="text-xs text-gray-300 font-medium mt-1">
                      SuiScan
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Links Section */}
          <div className="p-6 sm:p-8">
            
            <div className="space-y-4">
              {profileData?.links && profileData.links.length > 0 ? (
                profileData.links.map((link: any, index: number) => {
                  const linkData = link.fields || link;
                  
                  return (
                        <button
                          key={index}
                          onClick={() => handleLinkClick(linkData.url, index)}
                          className="w-full group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/20"
                        >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 transition-all duration-300"></div>
                      <div className="relative flex items-center justify-between p-5">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-105 transition-all duration-300 shadow-lg ${
                            linkData.icon === 'twitter' ? 'bg-black' :
                            linkData.icon === 'instagram' ? 'bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45]' :
                            linkData.icon === 'youtube' ? 'bg-[#FF0000]' :
                            linkData.icon === 'github' ? 'bg-[#181717]' :
                            linkData.icon === 'linkedin' ? 'bg-[#0A66C2]' :
                            linkData.icon === 'website' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                            linkData.icon === 'email' ? 'bg-gradient-to-br from-gray-600 to-gray-800' :
                            'bg-gradient-to-br from-purple-500 to-pink-500'
                          }`}>
                            <SocialIcon icon={linkData.icon} className="w-7 h-7 text-white" />
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <div className="text-white text-lg font-semibold group-hover:text-blue-300 transition-colors duration-300 truncate">
                              {linkData.title}
                            </div>
                            {linkData.click_count && linkData.click_count !== '0' && (
                              <div className="text-gray-400 text-sm flex items-center gap-1 mt-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                {linkData.click_count} clicks
                              </div>
                            )}
                          </div>
                        </div>
                        <svg className="w-6 h-6 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/10">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <p className="text-gray-300 text-lg font-medium">No links added yet</p>
                  <p className="text-gray-400 text-sm mt-2">Links will appear here when they're added</p>
                </div>
              )}
            </div>
          </div>

              {/* Footer */}
              <div className="border-t border-white/10 p-6 sm:p-8 bg-black/20">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 text-gray-300 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <span className="font-medium">Powered by QEDI</span>
              </div>
              <a 
                href="/create" 
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transform hover:-translate-y-1 transition-all duration-300"
              >
                Create your own LinkTree
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Donation Modal */}
      {donationModal}
    </div>
  );
}
