import { useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { createProfileTransaction } from '../lib/sui-client';

export default function Create() {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    bio: '',
    avatarUrl: '',
    theme: 'default',
    links: [] as Array<{ title: string; url: string; icon: string }>
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addLink = () => {
    setFormData(prev => ({
      ...prev,
      links: [...prev.links, { title: '', url: '', icon: 'link' }]
    }));
  };

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

    setIsCreating(true);

    try {
      const tx = createProfileTransaction(
        formData.username,
        formData.displayName,
        formData.bio,
        formData.avatarUrl,
        formData.theme
      );

      signAndExecuteTransaction(
        {
          transaction: tx,
        },
        {
          onSuccess: (result) => {
            console.log('Profile created successfully:', result);
            alert(`Profile created successfully! Transaction: ${result.digest}`);
            // Reset form or redirect
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
            alert(`Profile creation failed: ${error.message}`);
          },
        }
      );
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
              <h2 className="text-4xl font-bold text-white mb-6">Connect Your Wallet</h2>
              <p className="text-xl text-gray-300 mb-8">
                Connect your Sui wallet to create your on-chain profile
              </p>
              <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:shadow-xl hover:shadow-blue-500/25 transform hover:-translate-y-1 transition-all duration-500 ease-out">
                Connect Wallet
              </button>
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
                    Avatar URL
                  </label>
                  <input
                    type="url"
                    value={formData.avatarUrl}
                    onChange={(e) => handleInputChange('avatarUrl', e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
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
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-white">Add Your Links</h3>
                  <button
                    onClick={addLink}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
                  >
                    + Add Link
                  </button>
                </div>

                <div className="space-y-4">
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

                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-green-300 text-sm">
                          Smart contract deployed! Ready to create your on-chain profile.
                        </p>
                      </div>
                    </div>

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
    </div>
  );
}