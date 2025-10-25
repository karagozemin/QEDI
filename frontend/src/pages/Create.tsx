import { useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction, useSignTransaction, useWallets } from '@mysten/dapp-kit';
import { isEnokiWallet } from '@mysten/enoki';
import { createProfileTransaction, addLinkTransaction } from '../lib/sui-client';
import { BACKEND_URL } from '../lib/constants';

export default function Create() {
  const currentAccount = useCurrentAccount();
  const wallets = useWallets();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { mutateAsync: signTransaction } = useSignTransaction();
  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    bio: '',
    avatarUrl: '',
    theme: 'default',
    links: [] as Array<{ title: string; url: string; icon: string }>
  });
  const [, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  // Check if current wallet is an Enoki wallet (zkLogin)
  const connectedWallet = wallets.find(wallet => 
    wallet.accounts.some(account => account.address === currentAccount?.address)
  );
  const isEnokiConnected = connectedWallet && isEnokiWallet(connectedWallet);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      setAvatarFile(file);
      
      // Compress image to fit within 16KB limit for on-chain storage
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Create canvas for compression
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Set max dimensions (smaller = less data)
          const MAX_WIDTH = 200;
          const MAX_HEIGHT = 200;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = (height * MAX_WIDTH) / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = (width * MAX_HEIGHT) / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with quality adjustment
          let quality = 0.7;
          let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          
          // Reduce quality if still too large (16KB = ~16384 bytes)
          while (compressedDataUrl.length > 14000 && quality > 0.1) {
            quality -= 0.1;
            compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          }
          
          console.log('Compressed image size:', compressedDataUrl.length, 'bytes');
          
          if (compressedDataUrl.length > 16000) {
            alert('Image is still too large after compression. Please use a smaller image or enter a URL instead.');
            return;
          }
          
          setAvatarPreview(compressedDataUrl);
          setFormData(prev => ({ ...prev, avatarUrl: compressedDataUrl }));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  // Disabled for now - links should be added via Edit Profile
  // const addLink = () => {
  //   setFormData(prev => ({
  //     ...prev,
  //     links: [...prev.links, { title: '', url: '', icon: 'link' }]
  //   }));
  // };

  const updateLink = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    }));
  };

  const removeLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }));
  };

  const handleCreateProfile = async () => {
    if (!currentAccount) {
      alert('Please connect your wallet first');
      return;
    }

    if (!formData.username || !formData.displayName) {
      alert('Please fill in required fields');
      return;
    }

    console.log('=== WALLET DEBUG ===');
    console.log('Current account:', currentAccount);
    console.log('Connected wallet:', connectedWallet);
    console.log('Is Enoki wallet:', isEnokiConnected);
    console.log('Wallet type:', connectedWallet?.name);

    setIsCreating(true);

    try {
      // Create the profile transaction
      console.log('=== PROFILE DATA DEBUG ===');
      console.log('Username:', formData.username, 'Length:', formData.username.length);
      console.log('Display Name:', formData.displayName);
      console.log('Bio:', formData.bio);
      console.log('Avatar URL:', formData.avatarUrl);
      console.log('Theme:', formData.theme);
      
      // Validate username before creating transaction
      if (formData.username.length < 3 || formData.username.length > 20) {
        alert(`Username must be between 3-20 characters. Current: ${formData.username.length} characters`);
        return;
      }
      
      const profileTx = createProfileTransaction(
        formData.username,
        formData.displayName,
        formData.bio,
        formData.avatarUrl,
        formData.theme
      );

      // Check if we need to use sponsored transactions for Enoki wallet
      if (isEnokiConnected) {
        console.log('Using sponsored transaction via backend for Enoki wallet...');
        
        try {
          // Step 1: Create sponsored transaction via backend
          console.log('📝 Step 1: Creating sponsored transaction via backend...');
          const createResponse = await fetch(`${BACKEND_URL}/api/create-profile`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sender: currentAccount.address,
              username: formData.username,
              displayName: formData.displayName,
              bio: formData.bio,
              avatarUrl: formData.avatarUrl,
              theme: formData.theme,
            }),
          });

          if (!createResponse.ok) {
            const errorData = await createResponse.json();
            throw new Error(`Backend error: ${errorData.error}`);
          }

          const { digest, bytes } = await createResponse.json();
          console.log('✅ Sponsored transaction created:', { digest, bytesLength: bytes.length });

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
          console.log('🚀 Step 3: Executing sponsored transaction via backend...');
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
          console.log('✅ Sponsored transaction executed successfully:', result);
          
          // Show success toast
          setShowSuccessToast(true);
          setTimeout(() => setShowSuccessToast(false), 5000);
          
          // Reset form
          setFormData({
            username: '',
            displayName: '',
            bio: '',
            avatarUrl: '',
            theme: 'default',
            links: []
          });
          setStep(1);
          
        } catch (sponsorError) {
          console.error('Sponsored transaction failed:', sponsorError);
          setErrorMessage(sponsorError instanceof Error ? sponsorError.message : 'Unknown error');
          setShowErrorToast(true);
          setTimeout(() => setShowErrorToast(false), 5000);
        }
      } else {
        console.log('Using regular wallet transaction...');
        
        // Use regular wallet transaction
        signAndExecuteTransaction(
          {
            transaction: profileTx,
          },
          {
          onSuccess: async (result) => {
            console.log('Profile created successfully:', result);
            
            // Step 2: Add links if any exist (DISABLED - use Edit Profile instead)
            if (false && formData.links.length > 0) {
              try {
                // Get the created profile ID from the transaction result
                let profileId = null;
                
                console.log('Full transaction result:', JSON.stringify(result, null, 2));
                
                // Try to get profile ID from objectChanges (most reliable)
                const resultWithChanges = result as any;
                if ('objectChanges' in result && Array.isArray(resultWithChanges.objectChanges)) {
                  const createdObject = resultWithChanges.objectChanges.find((change: any) => 
                    change.type === 'created' && 
                    change.objectType && 
                    change.objectType.includes('LinkTreeProfile')
                  );
                  if (createdObject) {
                    profileId = createdObject.objectId;
                    console.log('Found profile ID from objectChanges:', profileId);
                  }
                }
                
                // Fallback: try effects.created
                if (!profileId && result.effects && typeof result.effects === 'object') {
                  const effects = result.effects as any;
                  if (effects.created && effects.created.length > 0) {
                    // Look for LinkTreeProfile object
                    const profileObject = effects.created.find((obj: any) => 
                      obj.reference?.objectId && 
                      (!obj.objectType || obj.objectType.includes('LinkTreeProfile'))
                    );
                    if (profileObject) {
                      profileId = profileObject.reference.objectId;
                      console.log('Found profile ID from effects.created:', profileId);
                    }
                  }
                }
                
                // Last resort: take first created object
                if (!profileId && result.effects && typeof result.effects === 'object') {
                  const effects = result.effects as any;
                  if (effects.created && effects.created.length > 0) {
                    profileId = effects.created[0].reference?.objectId;
                    console.log('Using first created object as profile ID:', profileId);
                  }
                }
                
                console.log('Extracted profile ID:', profileId);
                
                if (profileId) {
                  console.log('Adding links to profile:', profileId);
                  
                  // Add each link sequentially
                  for (let i = 0; i < formData.links.length; i++) {
                    const link = formData.links[i];
                    if (link.title && link.url) {
                      console.log(`Adding link ${i + 1}:`, link);
                      
                      const linkTx = addLinkTransaction(
                        profileId,
                        link.title,
                        link.url,
                        link.icon
                      );

                      await new Promise((resolve, reject) => {
                        signAndExecuteTransaction(
                          { transaction: linkTx },
                          {
                            onSuccess: (linkResult) => {
                              console.log(`Link ${i + 1} added successfully:`, linkResult);
                              resolve(linkResult);
                            },
                            onError: (linkError) => {
                              console.error(`Failed to add link ${i + 1}:`, linkError);
                              reject(linkError);
                            },
                          }
                        );
                      });
                    }
                  }
                  
                  const successMessage = isEnokiConnected 
                    ? `Profile created successfully with ${formData.links.length} links! (Gas-free with zkLogin)`
                    : `Profile created successfully with ${formData.links.length} links! Transaction: ${result.digest}`;
                  
                  alert(successMessage);
                } else {
                  alert('Profile created but could not add links. Please add them manually.');
                }
              } catch (linkError) {
                console.error('Error adding links:', linkError);
                alert('Profile created but some links failed to add. Please add them manually.');
              }
            } else {
              // Show success toast
              setShowSuccessToast(true);
              setTimeout(() => setShowSuccessToast(false), 5000);
            }

            // Reset form
            setFormData({
              username: '',
              displayName: '',
              bio: '',
              avatarUrl: '',
              theme: 'default',
              links: []
            });
            setStep(1);
          },
          onError: (error) => {
            console.error('Profile creation failed:', error);
            setErrorMessage(error.message || 'Failed to create profile');
            setShowErrorToast(true);
            setTimeout(() => setShowErrorToast(false), 5000);
          },
        }
        );
      }
    } catch (error) {
      console.error('Transaction preparation failed:', error);
      alert('Failed to prepare transaction');
    } finally {
      setIsCreating(false);
    }
  };

  if (!currentAccount) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 pt-24">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-600/30 p-16">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
                  <h2 className="text-4xl font-bold text-white mb-6">Authentication Required</h2>
                  <p className="text-xl text-gray-300 mb-8">
                    Connect your Sui wallet or sign in with zkLogin to create your on-chain profile
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:shadow-xl hover:shadow-blue-500/25 transform hover:-translate-y-1 transition-all duration-500 ease-out">
                      Connect Wallet
                    </button>
                    <button className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-2xl hover:shadow-xl hover:shadow-green-500/25 transform hover:-translate-y-1 transition-all duration-500 ease-out">
                      Sign In with zkLogin
                    </button>
                  </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 pt-24">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-6 text-white">
              Create Your Profile
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Build your decentralized LinkTree profile on Sui blockchain
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center gap-4">
              {[1, 2, 3].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                    step >= stepNum 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-400'
                  }`}>
                    {stepNum}
                  </div>
                  {stepNum < 3 && (
                    <div className={`w-16 h-1 mx-2 transition-all duration-300 ${
                      step > stepNum ? 'bg-blue-600' : 'bg-gray-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-600/30 p-8">
            {step === 1 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white mb-6">Basic Information</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Username *
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      placeholder="your-username"
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Display Name *
                    </label>
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => handleInputChange('displayName', e.target.value)}
                      placeholder="Your Display Name"
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell people about yourself..."
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Profile Picture
                  </label>
                  
                  {/* Image Upload Area */}
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-600/50 rounded-xl cursor-pointer bg-gray-700/30 hover:bg-gray-700/50 transition-all duration-300"
                    >
                      {avatarPreview ? (
                        <div className="flex flex-col items-center">
                          <img 
                            src={avatarPreview} 
                            alt="Preview" 
                            className="w-16 h-16 rounded-full object-cover mb-2"
                          />
                          <span className="text-sm text-gray-300">Click to change</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span className="text-sm text-gray-300">Click to upload image</span>
                          <span className="text-xs text-gray-500 mt-1">Max 5MB</span>
                        </div>
                      )}
                    </label>
                  </div>
                  
                  {/* Manual URL Input (Alternative) */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Or enter image URL
                    </label>
                    <input
                      type="url"
                      value={formData.avatarUrl}
                      onChange={(e) => handleInputChange('avatarUrl', e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setStep(2)}
                    disabled={!formData.username || !formData.displayName}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-blue-500/25 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white mb-4">Add Your Links</h3>
                
                {/* Info Box */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-2">Add Links After Profile Creation</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Create your profile first, then add your links by going to <span className="text-blue-400 font-medium">My Profiles → Edit Profile</span>. This ensures all your links are properly saved on the blockchain.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 hidden">
                  {formData.links.map((link, index) => (
                    <div key={index} className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
                      <div className="grid md:grid-cols-3 gap-4">
                        <input
                          type="text"
                          value={link.title}
                          onChange={(e) => updateLink(index, 'title', e.target.value)}
                          placeholder="Link Title"
                          className="px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) => updateLink(index, 'url', e.target.value)}
                          placeholder="https://example.com"
                          className="px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex gap-2">
                          <select
                            value={link.icon}
                            onChange={(e) => updateLink(index, 'icon', e.target.value)}
                            className="flex-1 px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="link">🔗 Link</option>
                            <option value="twitter">🐦 Twitter</option>
                            <option value="instagram">📷 Instagram</option>
                            <option value="youtube">📺 YouTube</option>
                            <option value="github">💻 GitHub</option>
                            <option value="linkedin">💼 LinkedIn</option>
                          </select>
                          <button
                            onClick={() => removeLink(index)}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {formData.links.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <p>No links added yet. Click "Add Link" to get started!</p>
                  </div>
                )}

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors duration-300"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-blue-500/25 transform hover:-translate-y-1 transition-all duration-300"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white mb-6">Review & Create</h3>
                
                <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30">
                  <h4 className="text-lg font-semibold text-white mb-4">Profile Preview</h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      {formData.avatarUrl && (
                        <img 
                          src={formData.avatarUrl} 
                          alt="Avatar" 
                          className="w-16 h-16 rounded-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                      <div>
                        <h5 className="text-xl font-bold text-white">{formData.displayName}</h5>
                        <p className="text-blue-400">@{formData.username}</p>
                        {formData.bio && <p className="text-gray-300 mt-2">{formData.bio}</p>}
                      </div>
                    </div>

                    {formData.links.length > 0 && (
                      <div>
                        <h6 className="text-sm font-medium text-gray-400 mb-2">Links ({formData.links.length})</h6>
                        <div className="space-y-2">
                          {formData.links.map((link, index) => (
                            <div key={index} className="flex items-center gap-3 p-2 bg-gray-600/30 rounded-lg">
                              <span className="text-lg">{link.icon === 'twitter' ? '🐦' : link.icon === 'instagram' ? '📷' : link.icon === 'youtube' ? '📺' : link.icon === 'github' ? '💻' : link.icon === 'linkedin' ? '💼' : '🔗'}</span>
                              <span className="text-white font-medium">{link.title}</span>
                              <span className="text-gray-400 text-sm">→ {link.url}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-green-300 text-sm">
                          Smart contract deployed! Ready to create your on-chain profile.
                        </p>
                      </div>
                    </div>

                    {/* Enoki zkLogin Info */}
                    {isEnokiConnected && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-green-300 font-semibold">zkLogin Connected</h4>
                            <p className="text-green-200 text-sm">
                              Your transactions will be automatically sponsored - no gas fees!
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors duration-300"
                  >
                    Previous
                  </button>
                      <button
                        onClick={handleCreateProfile}
                        disabled={isCreating}
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-blue-500/25 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {isCreating ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Creating Profile...
                          </div>
                        ) : (
                          'Create Profile'
                        )}
                      </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl border border-green-400/30 backdrop-blur-xl flex items-center gap-4 max-w-md">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-lg">Profile Created!</h4>
              <p className="text-sm text-green-50">Your LinkTree profile is now live on-chain</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {showErrorToast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-4 rounded-2xl shadow-2xl border border-red-400/30 backdrop-blur-xl flex items-center gap-4 max-w-md">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-lg">Creation Failed</h4>
              <p className="text-sm text-red-50">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}