'use client';
import { useState } from 'react';
import Button from '@/components/common/Button';
import EditText from '@/components/common/EditText';

type Step = 'email' | 'verification' | 'newPassword' | 'success';

interface FormData {
  email: string;
  verificationCode: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ForgotPasswordPage() {
  const [currentStep, setCurrentStep] = useState<Step>('email');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleInputChange = (field: keyof FormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  // Bước 1: Gửi email xác thực
  const handleSendEmail = async (): Promise<void> => {
    if (!formData.email) {
      alert('Vui lòng nhập email!');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call to send verification email
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // TODO: Call your API
      // const response = await fetch('/api/auth/forgot-password', {
      //   method: 'POST',
      //   body: JSON.stringify({ email: formData.email }),
      // });
      
      alert(`Mã xác thực đã được gửi đến ${formData.email}`);
      setCurrentStep('verification');
    } catch (error) {
      console.error('Error:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  // Bước 2: Xác thực mã code
  const handleVerifyCode = async (): Promise<void> => {
    if (!formData.verificationCode) {
      alert('Vui lòng nhập mã xác thực!');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call to verify code
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // TODO: Call your API
      // const response = await fetch('/api/auth/verify-code', {
      //   method: 'POST',
      //   body: JSON.stringify({ 
      //     email: formData.email,
      //     code: formData.verificationCode 
      //   }),
      // });
      
      setCurrentStep('newPassword');
    } catch (error) {
      console.error('Error:', error);
      alert('Mã xác thực không đúng!');
    } finally {
      setIsLoading(false);
    }
  };

  // Bước 3: Đặt mật khẩu mới
  const handleResetPassword = async (): Promise<void> => {
    if (!formData.newPassword || !formData.confirmPassword) {
      alert('Vui lòng nhập đầy đủ mật khẩu!');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }

    if (formData.newPassword.length < 8) {
      alert('Mật khẩu phải có ít nhất 8 ký tự!');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call to reset password
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // TODO: Call your API
      // const response = await fetch('/api/auth/reset-password', {
      //   method: 'POST',
      //   body: JSON.stringify({ 
      //     email: formData.email,
      //     code: formData.verificationCode,
      //     newPassword: formData.newPassword 
      //   }),
      // });
      
      setCurrentStep('success');
    } catch (error) {
      console.error('Error:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = (): void => {
    // TODO: Navigate to login page
    window.location.href = '/auth/signin';
  };

  const getPasswordStrength = (password: string) => {
    if (password.length < 6) return 1;
    if (password.length < 8) return 2;
    if (!/[A-Z]/.test(password)) return 2;
    if (!/[0-9]/.test(password)) return 3;
    return 4;
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-500 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        
        {/* Step 1: Enter Email */}
        {currentStep === 'email' && (
          <div className="flex flex-col items-center">
            {/* Icon */}
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
              </svg>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Quên mật khẩu?
            </h2>
            <p className="text-sm text-gray-600 text-center mb-6">
              Nhập email của bạn để nhận mã xác thực
            </p>

            {/* Email Input */}
            <div className="w-full mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <EditText
                  type="email"
                  placeholder="example@email.com"
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#9CA3AF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSendEmail}
              disabled={isLoading}
              text={isLoading ? 'Đang gửi...' : 'Gửi mã xác thực'}
              text_font_size="text-base"
              text_font_weight="font-semibold"
              text_line_height="leading-6"
              text_color="text-white"
              fill_background_color="bg-blue-600"
              border_border_radius="rounded-lg"
              padding="py-3 px-4"
              className="w-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            />

            {/* Back to Login */}
            <button
              onClick={handleBackToLogin}
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              Quay lại đăng nhập
            </button>
          </div>
        )}

        {/* Step 2: Verification Code */}
        {currentStep === 'verification' && (
          <div className="flex flex-col items-center">
            {/* Icon */}
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#10B981"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Kiểm tra email
            </h2>
            <p className="text-sm text-gray-600 text-center mb-6">
              Chúng tôi đã gửi mã xác thực đến<br />
              <span className="font-medium text-gray-900">{formData.email}</span>
            </p>

            {/* Verification Code Input */}
            <div className="w-full mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã xác thực
              </label>
              <EditText
                type="text"
                placeholder="Nhập mã 6 số"
                value={formData.verificationCode}
                onChange={handleInputChange('verificationCode')}
                text_font_size="text-base"
                text_color="text-gray-900"
                fill_background_color="bg-white"
                border_border="border border-gray-300"
                border_border_radius="rounded-lg"
                padding="py-3 px-4"
                className="w-full focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest"
              />
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleVerifyCode}
              disabled={isLoading}
              text={isLoading ? 'Đang xác thực...' : 'Xác thực'}
              text_font_size="text-base"
              text_font_weight="font-semibold"
              text_line_height="leading-6"
              text_color="text-white"
              fill_background_color="bg-blue-600"
              border_border_radius="rounded-lg"
              padding="py-3 px-4"
              className="w-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            />

            {/* Resend Code */}
            <button
              onClick={handleSendEmail}
              disabled={isLoading}
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-50"
            >
              Gửi lại mã
            </button>
          </div>
        )}

        {/* Step 3: Set New Password */}
        {currentStep === 'newPassword' && (
          <div className="flex flex-col items-center">
            {/* Icon */}
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Đặt mật khẩu mới
            </h2>
            <p className="text-sm text-gray-600 text-center mb-6">
              Nhập mật khẩu mới cho tài khoản của bạn
            </p>

            {/* New Password Input */}
            <div className="w-full mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu mới
              </label>
              <div className="relative">
                <EditText
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu mới"
                  value={formData.newPassword}
                  onChange={handleInputChange('newPassword')}
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Password Requirements */}
              {formData.newPassword && (
                <div className="mt-3 space-y-2">
                  <div className="flex gap-1">
                    <div className={`h-1 flex-1 rounded ${passwordStrength >= 1 ? 'bg-red-500' : 'bg-gray-200'}`}></div>
                    <div className={`h-1 flex-1 rounded ${passwordStrength >= 2 ? 'bg-yellow-500' : 'bg-gray-200'}`}></div>
                    <div className={`h-1 flex-1 rounded ${passwordStrength >= 3 ? 'bg-green-400' : 'bg-gray-200'}`}></div>
                    <div className={`h-1 flex-1 rounded ${passwordStrength >= 4 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
                  </div>
                  <ul className="space-y-1 text-xs">
                    <li className={formData.newPassword.length >= 8 ? 'text-green-600' : 'text-gray-500'}>
                      ✓ Ít nhất 8 ký tự
                    </li>
                    <li className={/[A-Z]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-500'}>
                      ✓ Có chữ hoa
                    </li>
                    <li className={/[0-9]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-500'}>
                      ✓ Có số
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="w-full mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <EditText
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Nhập lại mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
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
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleResetPassword}
              disabled={isLoading}
              text={isLoading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
              text_font_size="text-base"
              text_font_weight="font-semibold"
              text_line_height="leading-6"
              text_color="text-white"
              fill_background_color="bg-blue-600"
              border_border_radius="rounded-lg"
              padding="py-3 px-4"
              className="w-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        )}

        {/* Step 4: Success */}
        {currentStep === 'success' && (
          <div className="flex flex-col items-center">
            {/* Success Icon */}
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#10B981"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Thành công!
            </h2>
            <p className="text-sm text-gray-600 text-center mb-6">
              Mật khẩu của bạn đã được đặt lại thành công.<br />
              Bạn có thể đăng nhập với mật khẩu mới.
            </p>

            {/* Back to Login Button */}
            <Button
              onClick={handleBackToLogin}
              text="Quay lại đăng nhập"
              text_font_size="text-base"
              text_font_weight="font-semibold"
              text_line_height="leading-6"
              text_color="text-white"
              fill_background_color="bg-blue-600"
              border_border_radius="rounded-lg"
              padding="py-3 px-4"
              className="w-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            />
          </div>
        )}
      </div>
    </main>
  );
}