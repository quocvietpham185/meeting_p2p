'use client'
import React, { useState, useEffect } from 'react'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import ProfileInformation from './ProfileInformation'
import PreferencesComponent from './Preferences'
import ConnectedAccounts from './ConnectedAccount'
import SecuritySettings from './SecuritySetting'
import MainLayout from '@/components/layout/MainLayout'
import {
  UserProfile,
  ConnectedAccount,
  Preferences,
} from '@/interfaces/models/user'
import api from '@/lib/api'
import Swal from 'sweetalert2'

export default function SettingsPage() {
  const router = useRouter()

  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    fullName: '',
    email: '',
    avatar: '/images/avatar1.png',
  })

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [loading, setLoading] = useState(true)

  const [accounts, setAccounts] = useState<ConnectedAccount[]>([])
  const [preferences, setPreferences] = useState<Preferences>({
    theme: 'light',
    defaultCamera: 'built-in',
    defaultMicrophone: 'built-in',
  })

  // ✅ Lấy thông tin người dùng từ backend
  const fetchProfile = async () => {
    try {
      const token = Cookies.get('token')
      if (!token) {
        router.push('/auth/signin')
        return
      }

      const res = await api.get('/user/profile')
      const data = res.data

      if (data.success) {
        setProfile({
          id: data.data.id,
          fullName: data.data.full_name || `${data.data.first_name} ${data.data.last_name}`,
          email: data.data.email,
          avatar: data.data.avatar || '/images/avatar1.png',
        })
        setTwoFactorEnabled(data.data.two_factor_enabled)
      }
    } catch (error) {
      console.error('Fetch profile error:', error)
    } finally {
      setLoading(false)
    }
  }

  // ✅ Lưu thay đổi hồ sơ
  const handleSaveProfile = async (updatedProfile: UserProfile) => {
    try {
      const res = await api.put('/user/profile', {
        fullName: updatedProfile.fullName,
        avatar: updatedProfile.avatar,
      })
      if (res.data.success) {
        setProfile(updatedProfile)
        alert('Cập nhật hồ sơ thành công!')
      }
    } catch (error) {
      console.error('Update profile error:', error)
      alert('Không thể cập nhật hồ sơ.')
    }
  }

  // ✅ Bật/tắt 2FA
  const handleToggleTwoFactor = async (enabled: boolean) => {
    try {
      const res = await api.post('/toggle-2fa', { enabled })
      if (res.data.success) {
        setTwoFactorEnabled(enabled)
        alert(res.data.message)
      }
    } catch (error) {
      console.error('Toggle 2FA error:', error)
      alert('Không thể thay đổi cài đặt bảo mật.')
    }
  }

  // ✅ Đăng xuất
  const handleLogout = async () => {
  Swal.fire({
    title: 'Xác nhận đăng xuất?',
    text: 'Bạn có chắc muốn thoát khỏi tài khoản?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Đăng xuất',
    cancelButtonText: 'Hủy',
    reverseButtons: true,
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        // ✅ Gọi API logout để server xóa refresh_token
        await api.post('/auth/logout', {}, { withCredentials: true })

        // ✅ Xóa access token FE (nếu bạn có lưu)
        Cookies.remove('token', { path: '/' })

        // 🔁 Điều hướng về trang đăng nhập
        router.push('/auth/signin')

        // ✅ Thông báo thành công
        Swal.fire({
          icon: 'success',
          title: 'Đã đăng xuất',
          showConfirmButton: false,
          timer: 1200,
        })
      } catch (err) {
        console.error('Logout error:', err)
        Swal.fire({
          icon: 'error',
          title: 'Lỗi đăng xuất',
          text: 'Không thể đăng xuất, vui lòng thử lại!',
        })
      }
    }
  })
}

  useEffect(() => {
    fetchProfile()
  }, [])

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen text-gray-600">
          Đang tải thông tin người dùng...
        </div>
      </MainLayout>
    )
  }

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
            <ProfileInformation
              profile={profile}
              onSave={handleSaveProfile}
            />

            <SecuritySettings
              twoFactorEnabled={twoFactorEnabled}
              onToggleTwoFactor={handleToggleTwoFactor}
            />

            <ConnectedAccounts
              accounts={accounts}
              onConnect={() => console.log('Connect account')}
              onDisconnect={() => console.log('Disconnect account')}
            />

            <PreferencesComponent
              preferences={preferences}
              onUpdate={setPreferences}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
