// src/app/history/StatsSummary.tsx

'use client';
import React from 'react';
import { Clock, Users, Video, Calendar } from 'lucide-react';

interface StatsSummaryProps {
  totalMeetings: number;
  totalDuration: string;
  totalParticipants: number;
  recordedMeetings: number;
}

export default function StatsSummary({
  totalMeetings,
  totalDuration,
  totalParticipants,
  recordedMeetings,
}: StatsSummaryProps) {
  const stats = [
    {
      icon: Calendar,
      label: 'Total Meetings',
      value: totalMeetings,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: Clock,
      label: 'Total Duration',
      value: totalDuration,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      icon: Users,
      label: 'Total Participants',
      value: totalParticipants,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      icon: Video,
      label: 'Recorded',
      value: recordedMeetings,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
              <stat.icon size={24} className={stat.color} />
            </div>
            <div>
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}