'use client'
import { useState } from 'react'
import Image from 'next/image'
import Button from '@/components/common/Button'
import EditText from '@/components/common/EditText'
import CheckBox from '@/components/common/CheckBox'
import Link from '@/components/common/Link'

interface FormData {
  email: string
  password: string
  rememberMe: boolean
}

export default function SignInPage() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    rememberMe: false,
  })

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)

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

  const handleSignIn = async (): Promise<void> => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      alert('Sign In Successful!')
    } catch (error) {
      console.error('Sign In Error:', error)
      alert('Sign In Failed!')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async (): Promise<void> => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      alert('Google Sign In Successful!')
    } catch (error) {
      console.error('Google Sign In Error:', error)
      alert('Google Sign In Failed!')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = (): void => {
      window.location.href = '/auth/forgot_password';
  }

  return (
    <main className="flex flex-col lg:flex-row h-screen bg-gray-50 font-sans">
      {/* Left Section - Sign In Form */}
      <section className="w-full lg:w-1/2 flex justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
          {/* Logo and Brand */}
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
              Chào mừng trở lại{' '}
            </h2>
            <p className="text-base text-gray-600 text-center">
              Đăng nhập vào tài khoản của bạn để tiếp tục
            </p>
          </div>

          {/* Sign In Form */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-5">
              {/* Email Field */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="relative">
                  <EditText
                    type="email"
                    placeholder="Enter your email (e.g., viet@example.com)"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    text_font_size="text-base"
                    text_color="text-gray-900"
                    fill_background_color="bg-white"
                    border_border="border border-gray-300"
                    border_border_radius="rounded-lg"
                    padding="py-3 px-4"
                    className="w-full focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Image
                      src="/images/img_i.svg"
                      alt=""
                      width={16}
                      height={20}
                    />
                  </div>
                </div>
              </div>

              {/* Password Field with Toggle */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <EditText
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 8 characters"
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    text_font_size="text-base"
                    text_color="text-gray-900"
                    fill_background_color="bg-white"
                    border_border="border border-gray-300"
                    border_border_radius="rounded-lg"
                    padding="py-3 px-4 pr-12"
                    className="w-full focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? (
                      // Eye Slash Icon - Ẩn mật khẩu
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line
                          x1="1"
                          y1="1"
                          x2="23"
                          y2="23"
                        />
                      </svg>
                    ) : (
                      // Eye Icon - Hiện mật khẩu
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle
                          cx="12"
                          cy="12"
                          r="3"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me and Forgot Password */}
              <div className="flex justify-between items-center text-sm">
                <CheckBox
                  checked={formData.rememberMe}
                  onChange={handleInputChange('rememberMe')}
                  text="Remember me"
                  text_font_size="text-sm"
                  text_color="text-gray-700"
                  layout_gap="8px"
                />
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-200"
                >
                  Forgot password?
                </button>
              </div>

              {/* Sign In Button */}
              <Button
                onClick={handleSignIn}
                disabled={isLoading}
                text={isLoading ? 'Signing In...' : 'Đăng nhập'}
                text_font_size="text-base"
                text_font_weight="font-semibold"
                text_line_height="leading-6"
                text_color="text-white"
                fill_background_color="bg-blue-600"
                border_border_radius="rounded-lg"
                padding="py-3 px-4"
                className="w-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              />

              {/* Google Sign In Button */}
              <Button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                text={
                  isLoading
                    ? 'Signing In with Google...'
                    : 'Sign in with Google — fast and secure'
                }
                text_font_size="text-base"
                text_font_weight="font-medium"
                text_line_height="leading-6"
                text_color="text-gray-700"
                fill_background_color="bg-white"
                border_border="border border-gray-300"
                border_border_radius="rounded-lg"
                padding="py-3 px-4 pl-14"
                layout_gap="14px"
                className="w-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 transition-colors duration-200 relative disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Image
                  src="/images/img_i_red_500.svg"
                  alt="Google"
                  width={20}
                  height={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                />
                {isLoading
                  ? 'Signing In with Google...'
                  : 'Sign in with Google — fast and secure'}
              </Button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center mt-6">
              <p className="text-base text-gray-600">
                {`Don't have an account?`}{' '}
                <Link
                  href="/auth/signup"
                  variant="button"
                  text_font_weight="font-bold"
                  className="text-blue-700"
                >
                  Đăng kí ngay
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Right Section - Promotional Content */}
      <section className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 justify-center items-center p-12">
        <div className="flex flex-col items-center text-white text-center max-w-lg">
          <div className="w-80 h-80 rounded-2xl overflow-hidden shadow-2xl mb-8 transform hover:scale-105 transition-transform duration-300 ease-in-out">
            <Image
              src="/images/img_img.png"
              alt="Video meeting participants grid showing team collaboration"
              width={320}
              height={320}
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="text-4xl font-extrabold mb-4 leading-tight">
            Kết nối với nhóm của bạn{' '}
          </h3>
          <p className="text-lg text-blue-100 leading-relaxed">
            Trải nghiệm các cuộc họp video liền mạch với chất lượng rõ nét và
            cộng tác hiệu quả.{' '}
          </p>
        </div>
      </section>
    </main>
  )
}
