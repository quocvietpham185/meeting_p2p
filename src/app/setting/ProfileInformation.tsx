'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Camera } from 'lucide-react'
import EditText from '@/components/common/EditText'
import Button from '@/components/common/Button'
import { UserProfile } from '@/interfaces/models/user'

interface ProfileInformationProps {
  profile: UserProfile
  onSave: (updatedProfile: UserProfile) => void
}

export default function ProfileInformation({ profile, onSave }: ProfileInformationProps) {
  const [formData, setFormData] = useState<UserProfile>(profile)
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar || '/default-avatar.png')
  const [saving, setSaving] = useState(false)

  // ✅ Cập nhật khi profile thay đổi từ props (fetch xong)
  useEffect(() => {
    setFormData(profile)
    setAvatarPreview(profile.avatar || '/default-avatar.png')
  }, [profile])

  const handleInputChange = (field: keyof UserProfile) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave({ ...formData, avatar: avatarPreview })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h2>

      <div className="space-y-6">
        {/* Avatar */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group w-24 h-24">
            <Image
              src={avatarPreview || '/default-avatar.png'}
              alt="Avatar"
              width={96}
              height={96}
              className="rounded-full object-cover w-24 h-24 border border-gray-300"
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
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Upload a new photo</p>
            <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
          </div>
        </div>

        {/* Full name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <EditText
            type="text"
            value={formData.fullName}
            onChange={handleInputChange('fullName')}
            text_font_size="text-sm"
            text_color="text-gray-900"
            fill_background_color="bg-white"
            border_border="border border-gray-300"
            border_border_radius="rounded-lg"
            padding="py-2 px-3"
            className="w-full focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Email (readonly) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <EditText
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            text_font_size="text-sm"
            text_color="text-gray-900"
            fill_background_color="bg-gray-100"
            border_border="border border-gray-200"
            border_border_radius="rounded-lg"
            padding="py-2 px-3"
            className="w-full focus:ring-blue-500 focus:border-blue-500"
            disabled
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            text={saving ? 'Saving...' : 'Save changes'}
            text_font_size="text-sm"
            text_font_weight="font-semibold"
            text_color="text-white"
            fill_background_color="bg-blue-600"
            border_border_radius="rounded-lg"
            padding="py-2 px-4"
            className={`transition-colors ${
              saving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
            disabled={saving}
          />
        </div>
      </div>
    </div>
  )
}
