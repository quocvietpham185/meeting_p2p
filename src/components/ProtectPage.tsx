'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie'
export default function ProtectedPage({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  
  useEffect(() => {
    const checkAuth = () => {
      const token = Cookies.get('token')
      if (!token) {
        router.push('/auth/signin')
      }
    }

    // ✅ Gọi khi window đã sẵn sàng
    if (typeof window !== 'undefined') {
      checkAuth()
    }
  }, [router])

  return <>{children}</>;
}
