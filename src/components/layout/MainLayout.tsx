'use client';
import React, { useState } from 'react';
import Sidebar from './SideBar';
import Header from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [activeNav, setActiveNav] = useState('home');

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar bên trái */}
      <Sidebar activeItem={activeNav} onNavigate={setActiveNav} />

      {/* Nội dung chính */}
      <div className="flex flex-col flex-1">
        {/* Header trên cùng */}
        <Header
          user={{
            name: 'Việt Phạm',
            avatar: '/images/avatar1.png',
          }}
          unreadNotifications={3}
        />

        {/* Khu vực nội dung chính */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
