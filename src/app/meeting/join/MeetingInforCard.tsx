// src/app/meeting/join/MeetingInfoCard.tsx

'use client';
import React from 'react';
import Image from 'next/image';
import { Calendar, Clock, Users, Lock } from 'lucide-react';
import { MeetingInfo } from '@/interfaces/models/join';

interface MeetingInfoCardProps {
  meeting: MeetingInfo;
}

export default function MeetingInfoCard({ meeting }: MeetingInfoCardProps) {
  return (
    <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white">
      <div className="flex items-start gap-4 mb-4">
        <Image
          src={meeting.organizer.avatar}
          alt={meeting.organizer.name}
          width={48}
          height={48}
          className="rounded-full border-2 border-white"
        />
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-1">{meeting.title}</h2>
          <p className="text-blue-100 text-sm">
            Hosted by {meeting.organizer.name}
          </p>
        </div>
        {meeting.isLocked && (
          <div className="p-2 bg-white/20 rounded-lg">
            <Lock size={20} />
          </div>
        )}
      </div>

      <div className="space-y-2">
        {meeting.scheduledTime && (
          <div className="flex items-center gap-2 text-sm text-blue-100">
            <Calendar size={16} />
            <span>{meeting.scheduledTime}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-blue-100">
          <Users size={16} />
          <span>{meeting.participants} participants in meeting</span>
        </div>
      </div>

      {meeting.requiresPassword && (
        <div className="mt-4 p-3 bg-white/10 rounded-lg">
          <p className="text-sm text-yellow-200 flex items-center gap-2">
            <Lock size={14} />
            This meeting is password protected
          </p>
        </div>
      )}
    </div>
  );
}
