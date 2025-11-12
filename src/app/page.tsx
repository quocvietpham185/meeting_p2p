'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedPage from '@/components/ProtectPage';
import MeetingCard from '@/app/meeting/MeetingCard';
import StatsWidget from '@/app/widget/StatsWidget';
import UpcomingMeetings from '@/app/meeting/UpComingMeeting';
import MeetingActions from '@/app/meeting/MeetingAction';
import api, { ensureAccessToken } from '@/lib/api';
import { Meeting, UpcomingMeeting, Stats } from '@/interfaces/models/meeting';

export default function HomePage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('');
  const [recentMeetings, setRecentMeetings] = useState<Meeting[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<UpcomingMeeting[]>([]);
  const [stats, setStats] = useState<Stats>({ totalMeetings: 0, avgDuration: '0h', roomsCreated: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await ensureAccessToken();

        // 🧑‍💼 Lấy thông tin user
        const userRes = await api.get('/user/me');
        setUserName(userRes.data?.data?.full_name ?? 'Người dùng');

        // 🧾 Lấy danh sách cuộc họp gần đây
        const meetRes = await api.get('/meetings');
        setRecentMeetings(meetRes.data?.data ?? []);

        // 📅 Lấy lịch sắp tới
        const scheduleRes = await api.get('/schedule/upcoming');
        setUpcomingMeetings(scheduleRes.data?.data ?? []);

        // 📊 Lấy thống kê đơn giản
        const total = meetRes.data?.data?.length ?? 0;
        const avg = total ? `${(total * 0.5).toFixed(1)} giờ` : '0h';
        setStats({ totalMeetings: total, avgDuration: avg, roomsCreated: total });

      } catch (err) {
        console.error('Lỗi khi load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCreateMeeting = () => router.push('/meeting');
  const handleJoinMeeting = (code: string) => router.push(`/meeting/join/${code}`);
  const handleJoinMeetingCard = (id: string) => router.push(`/meeting/room/${id}`);
  const handleShareMeeting = (id: string) => {
    const shareUrl = `${window.location.origin}/meeting/join/${id}`;
    navigator.clipboard.writeText(shareUrl);
    alert('🔗 Link cuộc họp đã được sao chép!');
  };

  return (
    <ProtectedPage>
      <MainLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Chào mừng trở lại, {userName} 👋
          </h1>
          <p className="text-gray-600">
            Bắt đầu cuộc họp mới hoặc tham gia phòng hiện có.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <MeetingActions onCreateMeeting={handleCreateMeeting} onJoinMeeting={handleJoinMeeting} />

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Cuộc họp gần đây</h2>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Xem tất cả
                </button>
              </div>
              {recentMeetings.length === 0 ? (
                <p className="text-gray-500 text-sm">Chưa có cuộc họp nào gần đây.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentMeetings.map((meeting) => (
                    <MeetingCard
                      key={meeting.id}
                      meeting={meeting}
                      onJoin={handleJoinMeetingCard}
                      onShare={handleShareMeeting}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <UpcomingMeetings meetings={upcomingMeetings} />
            <StatsWidget stats={stats} />
          </div>
        </div>
      </MainLayout>
    </ProtectedPage>
  );
}
