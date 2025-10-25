// components/user/layout/Header.tsx
'use client';
import React from 'react';
import Image from 'next/image';
import { Search, Bell } from 'lucide-react';

interface HeaderProps {
  user?: {
    name: string;
    avatar: string;
  };
  unreadNotifications?: number;
}

export default function Header({ user, unreadNotifications = 0 }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Tìm phòng đang mở..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell size={20} className="text-gray-700" />
          {unreadNotifications > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </button>

        {/* User Profile */}
        <button className="flex items-center gap-2 hover:bg-gray-100 px-2 py-1 rounded-lg transition-colors">
          <Image
            src={user?.avatar || '/images/default-avatar.png'}
            alt={user?.name || 'User'}
            width={32}
            height={32}
            className="rounded-full"
          />
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </header>
  );
}