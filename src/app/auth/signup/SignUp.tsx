'use client'
import { useState } from 'react'
import Image from 'next/image'
import Button from '@/components/common/Button'
import EditText from '@/components/common/EditText'
import CheckBox from '@/components/common/CheckBox'
import PasswordInput from '@/components/common/PasswordInput'
import Link from '@/components/common/Link'

interface FormData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  agreedToTerms: boolean
}

export default function SignUpPage() {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false,
  })

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)
  const [avatar, setAvatar] = useState<string | null>(null)

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

  const handleAvatarUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatar(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const getPasswordStrength = (password: string): string => {
    if (password.length < 6) return 'Tối thiểu 8 ký tự'
    if (password.length < 8) return 'Một chữ hoa'
    if (!/[A-Z]/.test(password)) return 'Một chữ hoa'
    if (!/[0-9]/.test(password)) return 'Một chữ số'
    return 'Yếu'
  }

  const passwordStrength = getPasswordStrength(formData.password)

  const handleSignUp = async (): Promise<void> => {
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!')
      return
    }
    if (!formData.agreedToTerms) {
      alert('Please agree to Terms of Service and Privacy Policy')
      return
    }

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      // Handle successful sign up
      alert('Sign Up Successful!') // Example feedback
    } catch (error) {
      console.error('Sign Up Error:', error)
      alert('Sign Up Failed!') // Example feedback
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async (): Promise<void> => {
    setIsLoading(true)
    try {
      // Simulate Google OAuth
      await new Promise((resolve) => setTimeout(resolve, 1000))
      // Handle successful Google sign up
      alert('Google Sign Up Successful!') // Example feedback
    } catch (error) {
      console.error('Google Sign Up Error:', error)
      alert('Google Sign Up Failed!') // Example feedback
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex flex-col lg:flex-row h-screen bg-gray-50 font-sans">
      {/* Left Section - Sign Up Form */}
      <section className="w-full lg:w-1/2 flex justify-center items-start py-8 px-4 sm:px-6 lg:px-8 overflow-y-auto">
        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg my-auto">
          {/* Logo */}
          <div className="flex justify-center lg:justify-start mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center p-2">
              <Image
                src="/images/img_icon_add_user.svg"
                alt="VideoMeet logo"
                width={24}
                height={24}
              />
            </div>
          </div>

          {/* Welcome Section */}
          <div className="flex flex-col gap-1 mb-5">
            <h2 className="text-2xl font-extrabold text-gray-900">
              Tạo tài khoản
            </h2>
            <p className="text-sm text-gray-600">
              Tham gia cộng đồng của chúng tôi ngay hôm nay
            </p>
          </div>

          {/* Sign Up Form */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4">
              {/* Full Name Field */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-700">
                  Họ và tên<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <EditText
                    type="text"
                    placeholder="Nhập họ và tên của bạn"
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
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Image
                      src="/images/img_user_icon.svg"
                      alt=""
                      width={14}
                      height={16}
                    />
                  </div>
                </div>
              </div>

              {/* Email Field */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-700">
                  Email<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <EditText
                    type="email"
                    placeholder="example@email.com"
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
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Image
                      src="/images/img_i.svg"
                      alt=""
                      width={14}
                      height={16}
                    />
                  </div>
                </div>
              </div>

              {/* Password Field with PasswordInput Component */}
              <PasswordInput
                value={formData.password}
                onChange={handleInputChange('password')}
                placeholder="Tối thiểu 8 ký tự"
                label="Mật khẩu"
                required={true}
                showStrengthIndicator={true}
              />

              {/* Confirm Password Field with PasswordInput Component */}
              <PasswordInput
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                placeholder="Nhập lại mật khẩu"
                label="Xác nhận mật khẩu"
                required={true}
                showStrengthIndicator={false}
              />

              {/* Avatar Upload */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {avatar ? (
                    <Image
                      src={avatar}
                      alt="Avatar"
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image
                      src="/images/img_user_icon.svg"
                      alt=""
                      width={20}
                      height={20}
                    />
                  )}
                </div>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <span className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                    Tải ảnh lên
                  </span>
                </label>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start text-xs">
                <CheckBox
                  checked={formData.agreedToTerms}
                  onChange={handleInputChange('agreedToTerms')}
                  text=""
                  text_font_size="text-xs"
                  text_color="text-gray-700"
                  layout_gap="6px"
                />
                <label className="text-xs text-gray-700 ml-2 leading-tight">
                  Tôi đồng ý với{' '}
                  <span className="text-blue-600 hover:underline cursor-pointer">
                    Điều khoản dịch vụ
                  </span>{' '}
                  và{' '}
                  <span className="text-blue-600 hover:underline cursor-pointer">
                    Chính sách bảo mật
                  </span>
                </label>
              </div>

              {/* Sign Up Button */}
              <Button
                onClick={handleSignUp}
                disabled={isLoading}
                text={isLoading ? 'Đang tạo...' : 'Tạo tài khoản'}
                text_font_size="text-sm"
                text_font_weight="font-semibold"
                text_line_height="leading-5"
                text_color="text-white"
                fill_background_color="bg-blue-600"
                border_border_radius="rounded-lg"
                padding="py-2.5 px-4"
                className="w-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              />

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative bg-white px-3 text-xs text-gray-500">
                  Hoặc
                </div>
              </div>

              {/* Google Sign Up Button */}
              <Button
                onClick={handleGoogleSignUp}
                disabled={isLoading}
                text={isLoading ? 'Đang đăng ký...' : 'Đăng ký bằng Google'}
                text_font_size="text-sm"
                text_font_weight="font-medium"
                text_line_height="leading-5"
                text_color="text-gray-700"
                fill_background_color="bg-white"
                border_border="border border-gray-300"
                border_border_radius="rounded-lg"
                padding="py-2.5 px-4 pl-12"
                layout_gap="10px"
                className="w-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 transition-colors duration-200 relative disabled:opacity-50 disabled:cursor-not-allowed border"
              >
                <Image
                  src="/images/img_i_red_500.svg"
                  alt="Google"
                  width={18}
                  height={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                />
                {isLoading ? 'Đang đăng ký...' : 'Đăng ký bằng Google'}
              </Button>
            </div>

            {/* Sign In Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Đã có tài khoản?{' '}
                <Link
                  href="/auth/signin"
                  variant="button"
                  text_font_weight="font-bold"
                  className='text-blue-700'
                >
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Right Section - Promotional Content */}
      <section className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 justify-center items-center p-12">
        <div className="flex flex-col items-center text-white text-center max-w-lg">
          {/* Illustration */}
              <Image src="/images/img_signup.png" alt="img" width={364} height={364} />

          {/* Promotional Text */}
          <h3 className="text-4xl font-extrabold mb-4 leading-tight">
            Tham gia cộng đồng
          </h3>
          <p className="text-lg text-blue-100 leading-relaxed">
            Kết nối với hàng nghìn người dùng và khám phá những trải nghiệm
            tuyệt vời đang chờ đón bạn.
          </p>
        </div>
      </section>
    </main>
  )
}
