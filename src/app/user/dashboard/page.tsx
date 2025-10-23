'use client';

import React from 'react';
import { Meeting, Stats, UpcomingMeeting } from '@/interfaces/models/meeting';
import MeetingActions from '../meeting/MeetingAction';
import MeetingCard from '../meeting/MeetingCard';
import UpcomingMeetings from '../meeting/UpComingMeeting';
import StatsWidget from '../widget/StatsWidget';

export default function DashboardPage() {
  // Mock data
  const upcomingMeetings: UpcomingMeeting[] = [
    {
      id: '1',
      title: 'Standup Meeting',
      time: '15:30 - 16:00',
      status: 'today',
      participants: [
        { id: '1', name: 'User 1', avatar: '/images/avatar1.png' },
        { id: '2', name: 'User 2', avatar: '/images/avatar2.png' },
      ],
    },
    {
      id: '2',
      title: 'Client Presentation',
      time: '09:00 - 10:30',
      status: 'tomorrow',
      participants: [
        { id: '3', name: 'User 3', avatar: '/images/avatar3.png' },
        { id: '4', name: 'User 4', avatar: '/images/avatar4.png' },
      ],
    },
  ];

  const recentMeetings: Meeting[] = [
    {
      id: '1',
      title: 'Họp nhóm dự án Alpha',
      meetingId: '#MTG-2024-001',
      organizer: { id: '1', name: 'Nguyễn Văn A', avatar: '/images/avatar1.png' },
      participants: 5,
      timeRemaining: '2 giờ trước',
    },
    {
      id: '2',
      title: 'Review thiết kế UI/UX',
      meetingId: '#MTG-2024-002',
      organizer: { id: '2', name: 'Trần Thị B', avatar: '/images/avatar2.png' },
      participants: 5,
      timeRemaining: '1 ngày trước',
    },
  ];

  const stats: Stats = {
    totalMeetings: 12,
    avgDuration: '8.5 giờ',
    roomsCreated: 5,
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Chào mừng trở lại!</h1>
        <p className="text-gray-600">
          Bắt đầu cuộc họp mới hoặc tham gia phòng hiện có.
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Meeting Actions */}
          <MeetingActions
            onCreateMeeting={() => console.log('Create meeting')}
            onJoinMeeting={(code) => console.log('Join:', code)}
          />

          {/* Recent Meetings */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Cuộc họp gần đây</h2>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Xem tất cả
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentMeetings.map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  onJoin={(id) => console.log('Join:', id)}
                  onShare={(id) => console.log('Share:', id)}
                />
              ))}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <UpcomingMeetings meetings={upcomingMeetings} />
          <StatsWidget stats={stats} />
        </div>
      </div>
    </div>
  );
}
