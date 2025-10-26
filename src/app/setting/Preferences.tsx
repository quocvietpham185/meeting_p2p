// src/app/settings/Preferences.tsx

'use client';
import React from 'react';
import { Preferences } from '@/interfaces/models/user';

interface PreferencesProps {
  preferences: Preferences;
  onUpdate: (preferences: Preferences) => void;
}

export default function PreferencesComponent({
  preferences,
  onUpdate,
}: PreferencesProps) {
  const handleChange = (field: keyof Preferences, value: string) => {
    onUpdate({
      ...preferences,
      [field]: value,
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Preferences</h2>

      <div className="space-y-6">
        {/* Theme */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Theme
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Choose your preferred theme
          </p>
          <select
            value={preferences.theme}
            onChange={(e) => handleChange('theme', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>

        {/* Default Camera */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Camera
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Select your preferred camera device
          </p>
          <select
            value={preferences.defaultCamera}
            onChange={(e) => handleChange('defaultCamera', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="built-in">Built-in Camera</option>
            <option value="external">External Camera</option>
          </select>
        </div>

        {/* Default Microphone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Microphone
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Select your preferred microphone device
          </p>
          <select
            value={preferences.defaultMicrophone}
            onChange={(e) => handleChange('defaultMicrophone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="built-in">Built-in Microphone</option>
            <option value="external">External Microphone</option>
          </select>
        </div>
      </div>
    </div>
  );
}