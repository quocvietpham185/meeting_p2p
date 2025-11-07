'use client';
import React, { useState } from 'react';
import EditText from '@/components/common/EditText';
import Button from '@/components/common/Button';
import api from '@/lib/api';
import axios, { AxiosError } from 'axios';

interface SecuritySettingsProps {
  twoFactorEnabled: boolean;
  onToggleTwoFactor: (enabled: boolean) => void;
}

interface ApiResponse {
  success: boolean;
  message?: string;
}

export default function SecuritySettings({
  twoFactorEnabled,
  onToggleTwoFactor,
}: SecuritySettingsProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 🧩 Hàm đổi mật khẩu
  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword) {
      alert('Please fill in all password fields.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post<ApiResponse>('/user/change-password', {
        currentPassword,
        newPassword,
      });

      if (res.data.success) {
        alert('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
      } else {
        alert(res.data.message || 'Failed to change password.');
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const err = error as AxiosError<{ message?: string }>;
        alert(err.response?.data?.message || 'Server error while changing password.');
      } else {
        alert('Unexpected error while changing password.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 🧩 Hàm bật/tắt xác thực 2 lớp
  const handleToggleTwoFactor = async () => {
    try {
      const enabled = !twoFactorEnabled;
      const res = await api.put<ApiResponse>('/two-factor', { enabled });

      if (res.data.success) {
        onToggleTwoFactor(enabled);
        alert(res.data.message || 'Two-factor setting updated.');
      } else {
        alert(res.data.message || 'Failed to update two-factor setting.');
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const err = error as AxiosError<{ message?: string }>;
        alert(err.response?.data?.message || 'Server error toggling 2FA.');
      } else {
        alert('Unexpected error toggling 2FA.');
      }
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        Security Settings
      </h2>

      <div className="space-y-6">
        {/* Password Section */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Password</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <EditText
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                text_font_size="text-sm"
                text_color="text-gray-900"
                fill_background_color="bg-white"
                border_border="border border-gray-300"
                border_border_radius="rounded-lg"
                padding="py-2 px-3"
                className="w-full focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <EditText
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                text_font_size="text-sm"
                text_color="text-gray-900"
                fill_background_color="bg-white"
                border_border="border border-gray-300"
                border_border_radius="rounded-lg"
                padding="py-2 px-3"
                className="w-full focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="mt-4">
            <Button
              onClick={handleUpdatePassword}
              text={loading ? 'Updating...' : 'Update Password'}
              text_font_size="text-sm"
              text_font_weight="font-medium"
              text_color="text-white"
              fill_background_color="bg-gray-900"
              border_border_radius="rounded-lg"
              padding="py-2 px-4"
              className={`hover:bg-gray-800 transition-colors ${
                loading ? 'opacity-70 cursor-wait' : ''
              }`}
            />
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            Two-Factor Authentication
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Add an extra layer of security to your account.
          </p>
          <button
            onClick={handleToggleTwoFactor}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
