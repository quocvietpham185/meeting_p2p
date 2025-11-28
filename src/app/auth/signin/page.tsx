'use client'

import { useState, useEffect } from 'react'
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

  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: '',
  })
  const [successMessage, setSuccessMessage] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // 🔥 Force reset loading khi có lỗi
  useEffect(() => {
    if (errors.email || errors.password || errors.general) {
      console.log('🔄 Errors detected, force reset loading')
      setEmailLoading(false)
      setGoogleLoading(false)
    }
  }, [errors])

  // 🔥 Safety timeout: Force reset loading sau 5 giây
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (emailLoading || googleLoading) {
      console.log('⏰ Starting safety timeout')
      timer = setTimeout(() => {
        console.log('⏰ Safety timeout triggered - force reset loading')
        setEmailLoading(false)
        setGoogleLoading(false)
      }, 5000)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [emailLoading, googleLoading])

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
      
      // Clear errors khi user nhập lại
      if (field === 'email' || field === 'password') {
        setErrors((prev) => ({
          ...prev,
          [field]: '',
          general: '',
        }))
      }
    }

  // Validate form
  const validateForm = () => {
    const newErrors = {
      email: '',
      password: '',
      general: '',
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ'
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Vui lòng nhập mật khẩu'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
    }

    setErrors(newErrors)
    return !newErrors.email && !newErrors.password
  }

  // 🟦 Đăng nhập bằng email
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('🔵 handleSignIn called', { emailLoading, googleLoading })
    
    // Nếu đang loading thì không cho submit
    if (googleLoading || emailLoading) {
      console.log('⛔ Blocked: already loading')
      return
    }

    // Clear messages trước
    setErrors({ email: '', password: '', general: '' })
    setSuccessMessage('')

    // Validate - nếu fail thì return luôn, KHÔNG set loading
    if (!validateForm()) {
      console.log('⚠️ Validation failed')
      return
    }

    console.log('✅ Starting login...')
    // Chỉ set loading khi validate pass
    setEmailLoading(true)
    
    try {
      // 🔥 Dùng api trực tiếp để tránh interceptor
      const res = await api.post('/auth/signin', formData)

      console.log('📥 Login response:', res.data)

      // ✅ Lưu token vào cookie
      Cookies.set('token', res.data.data.token, {
        expires: 7,
        path: '/',
        sameSite: 'strict',
        secure: false,
      })

      // ✅ Thông báo
      setSuccessMessage('Đăng nhập thành công!')
      
      // Reset loading trước khi redirect
      setEmailLoading(false)

      // ✅ Chuyển hướng
      setTimeout(() => router.push('/'), 500)
    } catch (error: unknown) {
      console.log('❌ Login error caught:', error)
      
      // 🔥 QUAN TRỌNG: Reset loading NGAY khi có lỗi
      setEmailLoading(false)

      if (axios.isAxiosError(error)) {
        const status = error.response?.status
        const serverMessage = error.response?.data?.message

        // Xử lý các mã lỗi cụ thể
        if (status === 401) {
          // Sai mật khẩu - hiển thị ở field password
          setErrors((prev) => ({
            ...prev,
            password: 'Mật khẩu không chính xác',
          }))
        } else if (status === 404) {
          setErrors((prev) => ({
            ...prev,
            email: 'Email này chưa được đăng ký',
          }))
        } else if (status === 400) {
          // Có thể là lỗi validation từ server
          if (serverMessage?.toLowerCase().includes('email')) {
            setErrors((prev) => ({
              ...prev,
              email: serverMessage,
            }))
          } else if (serverMessage?.toLowerCase().includes('password')) {
            setErrors((prev) => ({
              ...prev,
              password: serverMessage,
            }))
          } else {
            setErrors((prev) => ({
              ...prev,
              general: serverMessage || 'Thông tin đăng nhập không hợp lệ',
            }))
          }
        } else {
          setErrors((prev) => ({
            ...prev,
            general: serverMessage || 'Đăng nhập thất bại, vui lòng thử lại',
          }))
        }
      } else if (error instanceof Error) {
        setErrors((prev) => ({
          ...prev,
          general: error.message,
        }))
      } else {
        setErrors((prev) => ({
          ...prev,
          general: 'Đã có lỗi xảy ra, vui lòng thử lại sau',
        }))
      }
    }
    
    console.log('🔚 End of handleSignIn')
  }

  // 🟥 Đăng nhập bằng Google
  const handleGoogleSignIn = async () => {
    if (emailLoading) return

    setGoogleLoading(true)
    setErrors({ email: '', password: '', general: '' })
    setSuccessMessage('')
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setSuccessMessage('Google Sign-In thành công!')
      router.push('/')
    } catch (error) {
      console.error('Google Sign-In Error:', error)
      setErrors((prev) => ({
        ...prev,
        general: 'Đăng nhập Google thất bại!',
      }))
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
                alt="Meethub logo"
                width={24}
                height={24}
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Meethub</h1>
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
          <form
            className="flex flex-col gap-6"
            onSubmit={handleSignIn}
          >
            <div className="flex flex-col gap-5">
              {/* Email */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <EditText
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  className={`w-full ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span>⚠️</span>
                    {errors.email}
                  </p>
                )}
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
                    className={`w-full ${errors.password ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span>⚠️</span>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Success Message */}
              {successMessage && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-600 flex items-center gap-2">
                    <span className="text-lg">✅</span>
                    {successMessage}
                  </p>
                </div>
              )}

              {/* General Error - nếu không có lỗi cụ thể ở field */}
              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <span className="text-lg">❌</span>
                    {errors.general}
                  </p>
                </div>
              )}

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
            alt="Meethub meeting"
            width={320}
            height={320}
            className="mx-auto rounded-2xl shadow-2xl mb-8"
          />
          <h3 className="text-4xl font-extrabold mb-4">
            Kết nối với nhóm của bạn
          </h3>
          <p className="text-lg text-blue-100">
            Trải nghiệm các cuộc họp video liền mạch với chất lượng rõ nét và
            cộng tác hiệu quả.
          </p>
        </div>
      </section>
    </main>
  )
}