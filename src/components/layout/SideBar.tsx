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
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  activeItem?: string;
  onNavigate?: (id: string) => void;
}

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

  const activeItem = navItems.find((item) => item.href === pathname)?.id || 'home';

  const handleClick = (item: NavItem) => {
    router.push(item.href);
    onNavigate?.(item.id);
  };

  // 🧠 Hàm đăng xuất
  const handleLogout = () => {
  Swal.fire({
    title: 'Xác nhận đăng xuất?',
    text: 'Bạn có chắc muốn thoát khỏi tài khoản?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Đăng xuất',
    cancelButtonText: 'Hủy',
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) {
      // ✅ Xóa cookie token
      Cookies.remove('token', { path: '/' })

      // 🔁 Điều hướng về trang login
      router.push('/auth/signin')

      Swal.fire({
        icon: 'success',
        title: 'Đã đăng xuất',
        showConfirmButton: false,
        timer: 1200,
      })
    }
  })
}

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
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
