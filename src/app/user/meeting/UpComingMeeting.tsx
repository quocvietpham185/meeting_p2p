'use client';
import React from 'react';
import Image from 'next/image';
import { UpcomingMeeting } from '@/interfaces/models/meeting';

interface UpcomingMeetingsProps {
  meetings: UpcomingMeeting[];
}

export default function UpcomingMeetings({ meetings }: UpcomingMeetingsProps) {
  return (
    <div className="bg-white rounded-xl p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Cuộc họp sắp tới</h3>
      <div className="space-y-4">
        {meetings.map((meeting) => (
          <div key={meeting.id} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-gray-900 text-sm">{meeting.title}</h4>
              <span className={`text-xs px-2 py-0.5 rounded ${
                meeting.status === 'today' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {meeting.status === 'today' ? 'Hôm nay' : 'Ngày mai'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-2">{meeting.time}</p>
            <div className="flex items-center gap-1">
              {meeting.participants.slice(0, 3).map((participant, idx) => (
                <Image
                  key={participant.id}
                  src={participant.avatar}
                  alt={participant.name}
                  width={24}
                  height={24}
                  className="rounded-full border-2 border-white"
                  style={{ marginLeft: idx > 0 ? '-8px' : '0' }}
                />
              ))}
              {meeting.participants.length > 3 && (
                <span className="text-xs text-gray-500 ml-1">
                  +{meeting.participants.length - 3} khác
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}