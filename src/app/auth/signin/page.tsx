'use client'

import { useState } from 'react'
import Image from 'next/image'
import Button from '@/components/common/Button'
import EditText from '@/components/common/EditText'
import CheckBox from '@/components/common/CheckBox'
import Link from '@/components/common/Link'
import api from '@/lib/api'
import Cookies from 'js-cookie'
import axios from 'axios'
import { useRouter } from 'next/navigation'

interface FormData {
  email: string
  password: string
  rememberMe: boolean
}

export default function SignInPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    rememberMe: false,
  })
  
  const [message, setMessage] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleInputChange =
    (field: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        event.target.type === 'checkbox'
          ? event.target.checked
          : event.target.value
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }

  // 🟦 Đăng nhập bằng email
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (googleLoading) return // không cho đăng nhập nếu Google đang load

    setEmailLoading(true)
    setMessage('')
    try {
      const res = await api.post('/auth/signin', formData)

      // ✅ Lưu token vào cookie
      Cookies.set('token', res.data.data.token, { expires: 7 })

      // ✅ Thông báo
      setMessage('Đăng nhập thành công!')

      // ✅ Chuyển hướng
      setTimeout(() => router.push('/'), 1000)
    } catch (error: unknown) {
      console.error('Sign In Error:', error)

      if (axios.isAxiosError(error)) {
        setMessage(error.response?.data?.message || 'Email hoặc mật khẩu không đúng')
      } else if (error instanceof Error) {
        setMessage(error.message)
      } else {
        setMessage('Đăng nhập thất bại, vui lòng thử lại!')
      }
    } finally {
      setEmailLoading(false)
    }
  }

  // 🟥 Đăng nhập bằng Google
  const handleGoogleSignIn = async () => {
    if (emailLoading) return // không cho đăng nhập nếu đang load email

    setGoogleLoading(true)
    setMessage('')
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setMessage('Google Sign-In thành công!')
      router.push('/')
    } catch (error) {
      console.error('Google Sign-In Error:', error)
      setMessage('Đăng nhập Google thất bại!')
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleForgotPassword = () => {
    router.push('/auth/forgot_password')
  }

  return (
    <main className="flex flex-col lg:flex-row h-screen bg-gray-50 font-sans">
      {/* Left Section - Sign In Form */}
      <section className="w-full lg:w-1/2 flex justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
          {/* Logo */}
          <div className="flex flex-col items-center gap-6 mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center p-3">
              <Image
                src="/images/img_div.svg"
                alt="VideoMeet logo"
                width={24}
                height={24}
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">VideoMeet</h1>
          </div>

          {/* Welcome Section */}
          <div className="flex flex-col items-center gap-2 mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 text-center">
              Chào mừng trở lại
            </h2>
            <p className="text-base text-gray-600 text-center">
              Đăng nhập vào tài khoản của bạn để tiếp tục
            </p>
          </div>

          {/* Form */}
          <form className="flex flex-col gap-6" onSubmit={handleSignIn}>
            <div className="flex flex-col gap-5">
              {/* Email */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <EditText
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  className="w-full"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Mật khẩu
                </label>
                <div className="relative">
                  <EditText
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu"
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    className="w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex justify-between items-center text-sm">
                <CheckBox
                  checked={formData.rememberMe}
                  onChange={handleInputChange('rememberMe')}
                  text="Ghi nhớ đăng nhập"
                />
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-blue-600 hover:underline"
                >
                  Quên mật khẩu?
                </button>
              </div>

              {/* Buttons */}
              <Button
                type="submit"
                disabled={emailLoading || googleLoading}
                text={emailLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                className="w-full bg-blue-600 text-white hover:bg-blue-700"
              />
              
              <Button
                onClick={handleGoogleSignIn}
                disabled={googleLoading || emailLoading}
                text={
                  googleLoading
                    ? 'Đang đăng nhập với Google...'
                    : 'Đăng nhập bằng Google'
                }
                className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              />
            </div>

            {/* Message */}
            {message && (
              <p
                className={`mt-4 text-center text-sm ${
                  message.includes('thành công')
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {message}
              </p>
            )}

            {/* Sign Up Link */}
            <div className="text-center mt-6">
              <p className="text-base text-gray-600">
                Chưa có tài khoản?{' '}
                <Link
                  href="/auth/signup"
                  variant="button"
                  className="text-blue-700 font-bold"
                >
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </form>
        </div>
      </section>

      {/* Right Section */}
      <section className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 justify-center items-center p-12">
        <div className="text-white text-center max-w-lg">
          <Image
            src="/images/img_img.png"
            alt="Video meeting"
            width={320}
            height={320}
            className="mx-auto rounded-2xl shadow-2xl mb-8"
          />
          <h3 className="text-4xl font-extrabold mb-4">Kết nối với nhóm của bạn</h3>
          <p className="text-lg text-blue-100">
            Trải nghiệm các cuộc họp video liền mạch với chất lượng rõ nét và cộng tác hiệu quả.
          </p>
        </div>
      </section>
    </main>
  )
}
