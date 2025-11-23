'use client';

import { useRouter, usePathname } from 'next/navigation';
import {
  Home,
  History,
  Calendar,
  Settings,
  LogOut,
  LogIn,
} from 'lucide-react';

import React, { useMemo, useState } from 'react';
import Cookies from 'js-cookie';
import api from '@/lib/api';

// Popup Notification (toast)
import NotificationPopup from '@/components/common/NotificationPopup';

// Confirm Dialog (SweetAlert style)
import ConfirmDialog from '@/components/common/ConfirmDialog';

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
  { id: 'settings', label: 'Cài đặt', icon: <Settings size={20} />, href: '/setting' },
];

export default function Sidebar({ onNavigate }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  // State popup toast
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupType, setPopupType] = useState<'success' | 'error' | 'warning' | 'info' | 'loading'>('success');
  const [popupMessage, setPopupMessage] = useState('');

  // State confirm dialog
  const [confirmLogout, setConfirmLogout] = useState(false);

  const showPopup = (
    type: 'success' | 'error' | 'warning' | 'info' | 'loading',
    message: string
  ) => {
    setPopupType(type);
    setPopupMessage(message);
    setPopupOpen(true);
  };

  const activeItem =
    navItems.find((item) => item.href === pathname)?.id || 'home';

  // Check login từ cookie
  const isLoggedIn = useMemo(() => {
    return !!Cookies.get('token');
  }, [pathname]);

  // Điều hướng menu
  const handleClick = (item: NavItem) => {
    router.push(item.href);
    onNavigate?.(item.id);
  };

  const handleLogin = () => {
    router.push('/auth/signin');
  };

  const handleLogout = async () => {
    try {
      // 🚀 Gọi API logout
      await api.post('/auth/logout', {}, { withCredentials: true });

      // 🗑 Xóa token FE
      Cookies.remove('token', { path: '/' });

      // 🔒 Đóng dialog ngay lập tức
      setConfirmLogout(false);

      // ➡️ Chuyển về trang đăng nhập
      router.push('/auth/signin');
    } catch (err) {
      console.error(err);
      setConfirmLogout(false);
      showPopup('error', 'Đăng xuất thất bại, vui lòng thử lại!');
    }
  };

  return (
    <>
      {/* Toast Notification */}
      <NotificationPopup
        open={popupOpen}
        type={popupType}
        message={popupMessage}
        onClose={() => setPopupOpen(false)}
      />

      {/* Confirm Logout Dialog */}
      <ConfirmDialog
        open={confirmLogout}
        title="Đăng xuất?"
        message="Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?"
        type="warning"
        confirmText="Đăng xuất"
        cancelText="Hủy"
        onConfirm={handleLogout}
        onCancel={() => setConfirmLogout(false)}
      />

      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col h-screen">
        {/* Header */}
        <div className="p-4 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="font-bold text-gray-900 text-lg">MeetHub</span>
        </div>

        {/* Menu */}
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

        {/* Login / Logout */}
        <div className="p-4 border-t border-gray-200">
          {isLoggedIn ? (
            <button
              onClick={() => setConfirmLogout(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span className="text-sm font-medium">Đăng xuất</span>
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <LogIn size={20} />
              <span className="text-sm font-medium">Đăng nhập</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}