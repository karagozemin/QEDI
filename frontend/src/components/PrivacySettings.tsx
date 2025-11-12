import { useState } from 'react';
import type { PrivacySettings as PrivacySettingsType } from '../types/profile';

interface PrivacySettingsProps {
  initialSettings?: {
    isPrivate: boolean;
    privacySettings: PrivacySettingsType;
  };
  onSave: (settings: { isPrivate: boolean; privacySettings: PrivacySettingsType }) => void;
  isLoading?: boolean;
}

export default function PrivacySettings({
  initialSettings,
  onSave,
  isLoading = false,
}: PrivacySettingsProps) {
  const [isPrivate, setIsPrivate] = useState(initialSettings?.isPrivate || false);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettingsType>(
    initialSettings?.privacySettings || {
      show_bio: true,
      show_links: true,
      allow_anonymous: true,
    }
  );

  const handleSave = () => {
    onSave({ isPrivate, privacySettings });
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
      <h3 className="text-xl font-semibold text-white mb-4">Privacy Settings</h3>

      {/* Private/Public Toggle */}
      <div className="mb-6">
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <span className="text-white font-medium">Private Profile</span>
            <p className="text-gray-300 text-sm mt-1">
              When enabled, your profile will only be visible to you unless anonymous viewing is allowed.
            </p>
          </div>
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="w-12 h-6 rounded-full bg-gray-600 appearance-none cursor-pointer relative transition-colors duration-200 checked:bg-blue-600"
            style={{
              background: isPrivate ? '#2563eb' : '#4b5563',
            }}
          />
        </label>
      </div>

      {/* Privacy Options */}
      <div className="space-y-4">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={privacySettings.show_bio}
            onChange={(e) =>
              setPrivacySettings({ ...privacySettings, show_bio: e.target.checked })
            }
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-3 text-white">Show Bio</span>
        </label>

        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={privacySettings.show_links}
            onChange={(e) =>
              setPrivacySettings({ ...privacySettings, show_links: e.target.checked })
            }
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-3 text-white">Show Links</span>
        </label>

        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={privacySettings.allow_anonymous}
            onChange={(e) =>
              setPrivacySettings({ ...privacySettings, allow_anonymous: e.target.checked })
            }
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-3 text-white">Allow Anonymous Viewing</span>
          <span className="ml-2 text-gray-400 text-sm">
            (if profile is private)
          </span>
        </label>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isLoading}
        className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Saving...' : 'Save Privacy Settings'}
      </button>

      {/* GDPR Info */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-gray-400 text-sm">
          You have the right to delete your data. Contact support for GDPR compliance requests.
        </p>
      </div>
    </div>
  );
}

