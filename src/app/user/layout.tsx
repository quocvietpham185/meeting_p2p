'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/layout/user/SideBar';
import Header from '@/components/layout/user/Header';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeNav, setActiveNav] = useState('dashboard');

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar cố định */}
      <Sidebar activeItem={activeNav} onNavigate={setActiveNav} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          user={{ name: 'John Doe', avatar: '/images/user-avatar.png' }}
          unreadNotifications={1}
        />

        {/* Nội dung trang con */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
