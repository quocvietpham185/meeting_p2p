'use client';

import { usePathname } from 'next/navigation';
import '../styles/index.css';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/SideBar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // ✅ Kiểm tra xem có phải trang auth không
  const isAuthPage = pathname.startsWith('/auth');

  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 text-gray-900">
        {isAuthPage ? (
          // ❌ Layout trống cho trang đăng nhập / đăng ký
          <main className="min-h-screen flex items-center justify-center">
            {children}
          </main>
        ) : (
          // ✅ Layout chính có Sidebar và Header
          <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
                {children}
              </main>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
