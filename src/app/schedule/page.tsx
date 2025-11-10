'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Download } from 'lucide-react';
import CalendarView from './CalendarView';
import WeekView from './WeekView';
import DayView from './DayView';
import ViewModeSwitcher from './ViewModeSwitcher';
import Button from '@/components/common/Button';
import UpcomingList from './UpComingList';
import MainLayout from '@/components/layout/MainLayout';
import api from '@/lib/api';
import axios, { AxiosError } from 'axios';
import {
  Participant,
  ScheduledMeeting,
  ViewMode,
} from '@/interfaces/models/schedule';
import {
  ApiMeeting,
  ApiParticipant,
  ScheduleApiResponse,
} from '@/interfaces/api/schedule';

export default function SchedulePage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [meetings, setMeetings] = useState<ScheduledMeeting[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Map API meeting status -> frontend status
  const mapMeetingStatus = (
    apiStatus: 'scheduled' | 'cancelled' | 'completed',
    startTime: Date,
    endTime: Date
  ): 'upcoming' | 'in-progress' | 'completed' | 'cancelled' => {
    if (apiStatus === 'cancelled') return 'cancelled';
    if (apiStatus === 'completed') return 'completed';

    const now = new Date();
    if (now < startTime) return 'upcoming';
    if (now >= startTime && now <= endTime) return 'in-progress';
    return 'completed';
  };

  // ✅ Fetch meetings with safe unknown typing
const fetchMeetings = async () => {
  try {
    setLoading(true);

    // 1) Refresh token để lấy access token mới
    let accessToken = '';
    try {
      const refreshRes = await api.post('/auth/refresh', {}, { withCredentials: true });
      console.log('🔥 REFRESH RESPONSE:', refreshRes.data);

      accessToken = refreshRes.data?.accessToken ?? '';
      if (!accessToken) {
        console.warn('⚠️ No accessToken in refresh response, redirect to signin.');
        // logout/redirect
        await api.post('/auth/logout', {}, { withCredentials: true }).catch(() => {});
        router.push('/auth/signin');
        return;
      }

      // Gắn token cho mọi request tiếp theo (dự phòng)
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    } catch (refreshErr: unknown) {
      if (axios.isAxiosError(refreshErr)) {
        console.warn('Refresh failed (axios):', refreshErr.response?.data ?? refreshErr.message);
      } else {
        console.warn('Refresh failed (unknown):', refreshErr);
      }
      // Nếu refresh thất bại thì đảm bảo logout và redirect
      await api.post('/auth/logout', {}, { withCredentials: true }).catch(() => {});
      router.push('/auth/signin');
      return;
    }

    // 2) Kiểm tra header sẽ được gửi (debug)
    console.log('[fetchMeetings] Authorization header (api.defaults):', api.defaults.headers.common['Authorization']);

    // 3) Gọi API /schedule với Authorization đảm bảo gửi kèm
    const res = await api.get<ScheduleApiResponse>('/schedule', {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log('✅ Schedule response:', res.data);

    // 4) Map dữ liệu an toàn
    const mappedMeetings: ScheduledMeeting[] = (res.data?.data ?? []).map((m: ApiMeeting) => {
      const startTime = new Date(m.start_time);
      const endTime = new Date(m.end_time);
      return {
        id: m.id,
        title: m.title,
        description: m.description,
        startTime,
        endTime,
        duration: m.duration,
        organizer: {
          id: m.organizer_id,
          name: m.full_name,
          avatar: m.organizer_avatar ?? '/default-avatar.png',
        },
        participants: (m.participants ?? []).map<Participant>((p: ApiParticipant) => ({
          id: p.id,
          name: p.name,
          email: p.email,
          avatar: p.avatar ?? '/default-avatar.png',
          status: p.status === 'invited' ? 'pending' : p.status,
        })),
        meetingLink: m.meeting_link ?? '',
        isRecurring:
          m.recurrence_type !== undefined &&
          m.recurrence_type !== 'none' &&
          m.recurrence_type !== '',
        recurringPattern:
          m.recurrence_type && m.recurrence_type !== 'none'
            ? m.recurrence_type
            : undefined,
        reminder: m.reminder_minutes ?? 15,
        color: m.color ?? '#3b82f6',
        status: mapMeetingStatus(m.status, startTime, endTime),
      };
    });

    setMeetings(mappedMeetings);
  } catch (error: unknown) {
    console.error('❌ [fetchMeetings] schedule fetch failed:', error);
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // nếu backend trả 401 thì logout sạch và redirect
      await api.post('/auth/logout', {}, { withCredentials: true }).catch(() => {});
      // xóa header local
      delete api.defaults.headers.common['Authorization'];
      delete axios.defaults.headers.common['Authorization'];
      router.push('/auth/signin');
    }
  } finally {
    setLoading(false);
  }
};



  useEffect(() => {
    fetchMeetings();
  }, []);

  // --- UI Handlers ---
  const handleCreateMeeting = () => router.push('/meeting');
  const handleJoinMeeting = (id: string) => router.push(`/meeting/room/${id}`);

  const handleCancelMeeting = async (id: string) => {
    if (!confirm('Bạn có chắc muốn hủy cuộc họp này?')) return;
    try {
      await api.delete(`/schedule/${id}`);
      setMeetings((prev) => prev.filter((m) => m.id !== id));
      alert('Đã hủy cuộc họp!');
    } catch (error: unknown) {
      console.error('Cancel failed:', error);
      alert('Lỗi khi hủy cuộc họp!');
    }
  };

  const handleExport = () => alert('Exporting to Google Calendar...');

  const upcomingMeetings = meetings
    .filter((m) => m.status === 'upcoming' || m.status === 'in-progress')
    .sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );


  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Schedule</h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your meetings and calendar
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleExport}
                text="Export"
                fill_background_color="bg-white"
                border_border="border border-gray-300"
                className="hover:bg-gray-50 flex items-center gap-2"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button
                onClick={handleCreateMeeting}
                text="New Meeting"
                text_color="text-white"
                fill_background_color="bg-blue-600"
                className="hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus size={16} />
                <span>New Meeting</span>
              </Button>
            </div>
          </div>

          <ViewModeSwitcher currentView={viewMode} onViewChange={setViewMode} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={viewMode === 'list' ? 'lg:col-span-3' : 'lg:col-span-2'}>
            {viewMode === 'month' && (
              <CalendarView
                meetings={meetings}
                currentDate={currentDate}
                onDateChange={setCurrentDate}
                onMeetingClick={(m) => alert(`Meeting: ${m.title}`)}
              />
            )}
            {viewMode === 'week' && (
              <WeekView
                meetings={meetings}
                currentDate={currentDate}
                onDateChange={setCurrentDate}
                onMeetingClick={(m) => alert(`Meeting: ${m.title}`)}
              />
            )}
            {viewMode === 'day' && (
              <DayView
                meetings={meetings}
                currentDate={currentDate}
                onDateChange={setCurrentDate}
                onMeetingClick={(m) => alert(`Meeting: ${m.title}`)}
              />
            )}
            {viewMode === 'list' && (
              <UpcomingList
                meetings={upcomingMeetings}
                onJoin={handleJoinMeeting}
                onCancel={handleCancelMeeting}
                onCopyLink={(link) => navigator.clipboard.writeText(link)}
                onEdit={(id) => router.push(`/schedule/edit/${id}`)}
              />
            )}
          </div>

          {(viewMode === 'month' || viewMode === 'week' || viewMode === 'day') && (
            <div className="lg:col-span-1">
              <UpcomingList
                meetings={upcomingMeetings.slice(0, 3)}
                onJoin={handleJoinMeeting}
                onCancel={handleCancelMeeting}
                onCopyLink={(link) => navigator.clipboard.writeText(link)}
                onEdit={(id) => router.push(`/schedule/edit/${id}`)}
              />
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
