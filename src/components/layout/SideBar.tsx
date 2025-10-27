'use client';

import { useRouter, usePathname } from 'next/navigation';
import {
  Home,
  History,
  Calendar,
  Monitor,
  Users,
  Settings,
  LogOut,
} from 'lucide-react';
import React from 'react';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  onNavigate?: (id: string) => void;
}

// 🔹 Danh sách các mục điều hướng
const navItems: NavItem[] = [
  { id: 'home', label: 'Trang chủ', icon: <Home size={20} />, href: '/' },
  { id: 'history', label: 'Lịch sử', icon: <History size={20} />, href: '/history' },
  { id: 'schedule', label: 'Lịch', icon: <Calendar size={20} />, href: '/schedule' },
  { id: 'devices', label: 'Thiết bị', icon: <Monitor size={20} />, href: '/devices' },
  { id: 'contacts', label: 'Hồ sơ', icon: <Users size={20} />, href: '/contacts' },
  { id: 'settings', label: 'Cài đặt', icon: <Settings size={20} />, href: '/setting' },
];

export default function Sidebar({ onNavigate }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  // 🔹 Xác định item đang active dựa vào pathname
  const activeItem = navItems.find((item) => item.href === pathname)?.id || 'home';

  const handleClick = (item: NavItem) => {
    router.push(item.href);
    onNavigate?.(item.id);
  };

  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">M</span>
        </div>
        <span className="font-bold text-gray-900 text-lg">MeetHub</span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleClick(item)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
              activeItem === item.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {item.icon}
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
          <LogOut size={20} />
          <span className="text-sm font-medium">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
