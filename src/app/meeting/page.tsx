'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import CreateMeetingForm from './CreateMeetingForm';
import { MeetingCreatePayload } from '@/interfaces/api/meeting';
import MainLayout from '@/components/layout/MainLayout';
import api from '@/lib/api';

interface MeetingResponse {
  success: boolean;
  message?: string;
  data?: {
    id: string;
    meeting_id: string;
    title: string;
  };
}

export default function CreateMeetingPage() {
  const router = useRouter();

  async function handleStartMeeting(data: MeetingCreatePayload): Promise<void> {
    try {
      const res = await api.post<MeetingResponse>('/meetings', data);
      const meeting = res.data?.data;

      if (meeting?.id) {
        router.push(`/meeting/room/${meeting.id}`);
      } else {
        alert('Không tạo được phòng, dữ liệu rỗng!');
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error('Create meeting error:', err.message);
        alert('Lỗi tạo phòng! ' + err.message);
      } else {
        console.error('Unknown error:', err);
        alert('Lỗi không xác định khi tạo phòng!');
      }
    }
  }

  async function handleScheduleMeeting(data: MeetingCreatePayload): Promise<void> {
    try {
      const res = await api.post<MeetingResponse>('/schedule', data);
      const result = res.data;
      if (!result.success) throw new Error(result.message ?? 'Không rõ lỗi');
      alert('Lên lịch cuộc họp thành công!');
      router.push('/schedule');
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error scheduling meeting:', error.message);
        alert('Lỗi khi lên lịch: ' + error.message);
      }
    }
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-6">
        <CreateMeetingForm
          onStartMeeting={handleStartMeeting}
          onScheduleMeeting={handleScheduleMeeting}
        />
      </div>
    </MainLayout>
  );
}
