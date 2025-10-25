//app/user/meeting/meetingCard.tsx
'use client';
import React from 'react';
import { Users, Clock, Share2, ExternalLink } from 'lucide-react';
import Button from '@/components/common/Button';
import { Meeting } from '@/interfaces/models/meeting';

interface MeetingCardProps {
  meeting: Meeting;
  onJoin?: (meetingId: string) => void;
  onShare?: (meetingId: string) => void;
  onOpenDetails?: (meetingId: string) => void;
}

export default function MeetingCard({ meeting, onJoin, onShare, onOpenDetails }: MeetingCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-base mb-1">{meeting.title}</h3>
          <p className="text-xs text-gray-500">ID: {meeting.meetingId}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onShare?.(meeting.id)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Share"
          >
            <Share2 size={16} className="text-gray-600" />
          </button>
          <button
            onClick={() => onOpenDetails?.(meeting.id)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Open details"
          >
            <ExternalLink size={16} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <Users size={14} />
          <span>{meeting.organizer.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <Users size={14} />
          <span>{meeting.participants} người</span>
        </div>
        {meeting.timeRemaining && (
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{meeting.timeRemaining}</span>
          </div>
        )}
      </div>

      {/* Action Button */}
      <Button
        onClick={() => onJoin?.(meeting.id)}
        text="Tham gia"
        text_font_size="text-sm"
        text_font_weight="font-semibold"
        text_color="text-white"
        fill_background_color="bg-blue-600"
        border_border_radius="rounded-lg"
        padding="py-2.5 px-4"
        className="w-full hover:bg-blue-700 transition-colors"
      />
    </div>
  );
}