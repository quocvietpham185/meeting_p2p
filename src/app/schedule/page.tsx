// src/app/schedule/page.tsx

'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Download } from 'lucide-react';
import CalendarView from './CalendarView';
import ViewModeSwitcher from './ViewModeSwitcher';
import Button from '@/components/common/Button';
import { ScheduledMeeting, ViewMode } from '@/interfaces/models/schedule';
import UpcomingList from './UpComingList';

export default function SchedulePage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  // Mock data
  const meetings: ScheduledMeeting[] = [
    {
      id: '1',
      title: 'Daily Standup',
      description: 'Quick sync with the team',
      startTime: new Date(2024, 9, 25, 15, 30),
      endTime: new Date(2024, 9, 25, 16, 0),
      duration: 30,
      organizer: {
        id: '1',
        name: 'Nguyễn Văn A',
        avatar: '/images/avatar1.png',
      },
      participants: [
        {
          id: '1',
          name: 'User 1',
          email: 'user1@example.com',
          avatar: '/images/avatar1.png',
          status: 'accepted',
        },
        {
          id: '2',
          name: 'User 2',
          email: 'user2@example.com',
          avatar: '/images/avatar2.png',
          status: 'accepted',
        },
      ],
      meetingLink: 'https://meet.example.com/daily-standup',
      isRecurring: true,
      recurringPattern: 'Daily at 3:30 PM',
      reminder: 15,
      color: '#3B82F6',
      status: 'upcoming',
    },
    {
      id: '2',
      title: 'Client Presentation',
      description: 'Q4 Results Review',
      startTime: new Date(2024, 9, 26, 14, 0),
      endTime: new Date(2024, 9, 26, 15, 30),
      duration: 90,
      organizer: {
        id: '2',
        name: 'Trần Thị B',
        avatar: '/images/avatar2.png',
      },
      participants: [
        {
          id: '3',
          name: 'User 3',
          email: 'user3@example.com',
          avatar: '/images/avatar3.png',
          status: 'pending',
        },
      ],
      meetingLink: 'https://meet.example.com/client-presentation',
      isRecurring: false,
      reminder: 30,
      color: '#10B981',
      status: 'upcoming',
    },
    {
      id: '3',
      title: 'Sprint Planning',
      startTime: new Date(2024, 9, 28, 10, 0),
      endTime: new Date(2024, 9, 28, 11, 30),
      duration: 90,
      organizer: {
        id: '1',
        name: 'Nguyễn Văn A',
        avatar: '/images/avatar1.png',
      },
      participants: [
        {
          id: '1',
          name: 'User 1',
          email: 'user1@example.com',
          avatar: '/images/avatar1.png',
          status: 'accepted',
        },
      ],
      meetingLink: 'https://meet.example.com/sprint-planning',
      isRecurring: true,
      recurringPattern: 'Weekly on Monday',
      reminder: 15,
      color: '#8B5CF6',
      status: 'upcoming',
    },
  ];

  const upcomingMeetings = meetings
    .filter((m) => new Date(m.startTime) > new Date())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const handleCreateMeeting = () => {
    router.push('/meeting');
  };

  const handleJoinMeeting = (id: string) => {
    const meeting = meetings.find((m) => m.id === id);
    if (meeting) {
      router.push(`/meeting/room/${id}`);
    }
  };

  const handleEditMeeting = (id: string) => {
    console.log('Edit meeting:', id);
    alert('Edit meeting functionality coming soon!');
  };

  const handleCancelMeeting = (id: string) => {
    if (confirm('Are you sure you want to cancel this meeting?')) {
      console.log('Cancel meeting:', id);
      alert('Meeting cancelled!');
    }
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    alert('Meeting link copied to clipboard!');
  };

  const handleMeetingClick = (meeting: ScheduledMeeting) => {
    console.log('Meeting clicked:', meeting);
    alert(`Meeting: ${meeting.title}`);
  };

  const handleExport = () => {
    console.log('Export calendar');
    alert('Exporting to Google Calendar...');
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Schedule
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your meetings and calendar
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleExport}
              text="Export"
              text_font_size="text-sm"
              text_font_weight="font-medium"
              text_color="text-gray-700"
              fill_background_color="bg-white"
              border_border="border border-gray-300"
              border_border_radius="rounded-lg"
              padding="py-2 px-4"
              className="hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button
              onClick={handleCreateMeeting}
              text="New Meeting"
              text_font_size="text-sm"
              text_font_weight="font-semibold"
              text_color="text-white"
              fill_background_color="bg-blue-600"
              border_border_radius="rounded-lg"
              padding="py-2 px-4"
              className="hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              <span>New Meeting</span>
            </Button>
          </div>
        </div>

        {/* View Mode Switcher */}
        <ViewModeSwitcher currentView={viewMode} onViewChange={setViewMode} />
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2">
          {viewMode === 'month' && (
            <CalendarView
              meetings={meetings}
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              onMeetingClick={handleMeetingClick}
            />
          )}
          {viewMode === 'list' && (
            <UpcomingList
              meetings={upcomingMeetings}
              onJoin={handleJoinMeeting}
              onEdit={handleEditMeeting}
              onCancel={handleCancelMeeting}
              onCopyLink={handleCopyLink}
            />
          )}
        </div>

        {/* Upcoming Meetings Sidebar */}
        {viewMode === 'month' && (
          <div className="lg:col-span-1">
            <UpcomingList
              meetings={upcomingMeetings.slice(0, 3)}
              onJoin={handleJoinMeeting}
              onEdit={handleEditMeeting}
              onCancel={handleCancelMeeting}
              onCopyLink={handleCopyLink}
            />
          </div>
        )}
      </div>
    </div>
  );
}