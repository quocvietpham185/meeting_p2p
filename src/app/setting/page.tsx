// src/app/settings/page.tsx

'use client';
import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import ProfileInformation from './ProfileInformation';

import PreferencesComponent from './Preferences';
import {
  UserProfile,
  ConnectedAccount,
  Preferences,
} from '@/interfaces/models/user';
import ConnectedAccounts from './ConnectedAccount';
import SecuritySettings from './SecuritySetting';
import MainLayout from '@/components/layout/MainLayout';

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile>({
    id: '1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    displayName: 'Sarah Johnson',
    email: 'sarah@example.com',
    avatar: '/images/avatar1.png',
  });

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const [accounts, setAccounts] = useState<ConnectedAccount[]>([
    {
      id: '1',
      provider: 'Google Account',
      email: 'sarah@gmail.com',
      isConnected: true,
    },
  ]);

  const [preferences, setPreferences] = useState<Preferences>({
    theme: 'light',
    defaultCamera: 'built-in',
    defaultMicrophone: 'built-in',
  });

  const handleSaveProfile = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    alert('Profile updated successfully!');
  };

  const handleConnectAccount = (provider: string) => {
    console.log('Connect:', provider);
    // TODO: OAuth flow
  };

  const handleDisconnectAccount = (id: string) => {
    if (confirm('Are you sure you want to disconnect this account?')) {
      setAccounts(
        accounts.map((acc) =>
          acc.id === id ? { ...acc, isConnected: false } : acc
        )
      );
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      // TODO: Logout logic
      console.log('Logout');
    }
  };

  return (
    <MainLayout>
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Profile & Account Settings
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your profile information and account preferences
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors self-start sm:self-auto"
            >
              <LogOut size={18} />
              <span className="font-medium">Đăng xuất</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <ProfileInformation profile={profile} onSave={handleSaveProfile} />

          <SecuritySettings
            twoFactorEnabled={twoFactorEnabled}
            onToggleTwoFactor={setTwoFactorEnabled}
          />

          <ConnectedAccounts
            accounts={accounts}
            onConnect={handleConnectAccount}
            onDisconnect={handleDisconnectAccount}
          />

          <PreferencesComponent
            preferences={preferences}
            onUpdate={setPreferences}
          />
        </div>
      </div>
    </div>
    </MainLayout>
  );
}