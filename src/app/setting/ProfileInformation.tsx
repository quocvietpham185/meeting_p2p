// src/app/settings/ProfileInformation.tsx

'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { Camera } from 'lucide-react';
import EditText from '@/components/common/EditText';
import Button from '@/components/common/Button';
import { UserProfile } from '@/interfaces/models/user';

interface ProfileInformationProps {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
}

export default function ProfileInformation({
  profile,
  onSave,
}: ProfileInformationProps) {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [avatar, setAvatar] = useState<string>(profile.avatar);

  const handleInputChange = (field: keyof UserProfile) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave({ ...formData, avatar });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        Profile Information
      </h2>

      <div className="space-y-6">
        {/* Avatar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative group">
            <Image
              src={avatar}
              alt={formData.displayName}
              width={80}
              height={80}
              className="rounded-full"
            />
            <label
              htmlFor="avatar-upload"
              className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Camera size={24} className="text-white" />
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-2 border-white rounded-full" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              Upload a new photo
            </p>
            <p className="text-xs text-gray-500">or drag and drop</p>
          </div>
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <EditText
              type="text"
              value={formData.firstName}
              onChange={handleInputChange('firstName')}
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
              Last Name
            </label>
            <EditText
              type="text"
              value={formData.lastName}
              onChange={handleInputChange('lastName')}
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

        {/* Display Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Display Name
          </label>
          <EditText
            type="text"
            value={formData.displayName}
            onChange={handleInputChange('displayName')}
            text_font_size="text-sm"
            text_color="text-gray-900"
            fill_background_color="bg-white"
            border_border="border border-gray-300"
            border_border_radius="rounded-lg"
            padding="py-2 px-3"
            className="w-full focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <EditText
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            text_font_size="text-sm"
            text_color="text-gray-900"
            fill_background_color="bg-white"
            border_border="border border-gray-300"
            border_border_radius="rounded-lg"
            padding="py-2 px-3"
            className="w-full focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            text="Save changes"
            text_font_size="text-sm"
            text_font_weight="font-semibold"
            text_color="text-white"
            fill_background_color="bg-blue-600"
            border_border_radius="rounded-lg"
            padding="py-2 px-4"
            className="hover:bg-blue-700 transition-colors"
          />
        </div>
      </div>
    </div>
  );
}