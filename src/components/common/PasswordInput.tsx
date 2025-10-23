// components/common/PasswordInput.tsx
'use client';
import { useState } from 'react';
import Image from 'next/image';
import EditText from '@/components/common/EditText';

interface PasswordInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  showStrengthIndicator?: boolean;
}

export default function PasswordInput({
  value,
  onChange,
  placeholder = 'Tối thiểu 8 ký tự',
  label = 'Mật khẩu',
  required = false,
  showStrengthIndicator = false,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const getPasswordStrength = (password: string) => {
    if (password.length < 6) return { strength: 'Yếu', level: 1 };
    if (password.length < 8) return { strength: 'Trung bình', level: 2 };
    if (!/[A-Z]/.test(password)) return { strength: 'Trung bình', level: 2 };
    if (!/[0-9]/.test(password)) return { strength: 'Khá', level: 3 };
    return { strength: 'Mạnh', level: 4 };
  };

  const passwordInfo = getPasswordStrength(value);

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <EditText
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          text_font_size="text-sm"
          text_color="text-gray-900"
          fill_background_color="bg-white"
          border_border="border border-gray-300"
          border_border_radius="rounded-lg"
          padding="py-2 px-3 pr-10"
          className="w-full focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        >
          {showPassword ? (
            // Eye slash icon - Ẩn mật khẩu
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            // Eye icon - Hiện mật khẩu
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
      
      {/* Password Strength Indicator */}
      {showStrengthIndicator && value && (
        <div className="space-y-1">
          <div className="flex gap-1">
            <div
              className={`h-0.5 flex-1 rounded transition-colors ${
                passwordInfo.level >= 1 ? 'bg-red-500' : 'bg-gray-200'
              }`}
            ></div>
            <div
              className={`h-0.5 flex-1 rounded transition-colors ${
                passwordInfo.level >= 2 ? 'bg-yellow-500' : 'bg-gray-200'
              }`}
            ></div>
            <div
              className={`h-0.5 flex-1 rounded transition-colors ${
                passwordInfo.level >= 3 ? 'bg-green-400' : 'bg-gray-200'
              }`}
            ></div>
            <div
              className={`h-0.5 flex-1 rounded transition-colors ${
                passwordInfo.level >= 4 ? 'bg-green-600' : 'bg-gray-200'
              }`}
            ></div>
          </div>
          <p className="text-xs text-gray-600">{passwordInfo.strength}</p>
        </div>
      )}
    </div>
  );
}