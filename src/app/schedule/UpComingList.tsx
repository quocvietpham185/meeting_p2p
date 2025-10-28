// src/app/schedule/UpcomingList.tsx

'use client';
import React from 'react';
import Image from 'next/image';
import { Calendar, Clock, Users, Video, MoreVertical, Copy, Edit, Trash2 } from 'lucide-react';
import { ScheduledMeeting } from '@/interfaces/models/schedule';
import Button from '@/components/common/Button';

interface UpcomingListProps {
  meetings: ScheduledMeeting[];
  onJoin: (id: string) => void;
  onEdit: (id: string) => void;
  onCancel: (id: string) => void;
  onCopyLink: (link: string) => void;
}

export default function UpcomingList({
  meetings,
  onJoin,
  onEdit,
  onCancel,
  onCopyLink,
}: UpcomingListProps) {
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    const meetingDate = new Date(date);
    return (
      meetingDate.getDate() === today.getDate() &&
      meetingDate.getMonth() === today.getMonth() &&
      meetingDate.getFullYear() === today.getFullYear()
    );
  };

  const isTomorrow = (date: Date) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const meetingDate = new Date(date);
    return (
      meetingDate.getDate() === tomorrow.getDate() &&
      meetingDate.getMonth() === tomorrow.getMonth() &&
      meetingDate.getFullYear() === tomorrow.getFullYear()
    );
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return formatDate(date);
  };

  const canJoinNow = (meeting: ScheduledMeeting) => {
    const now = new Date();
    const startTime = new Date(meeting.startTime);
    const diffMinutes = (startTime.getTime() - now.getTime()) / (1000 * 60);
    return diffMinutes <= 15 && diffMinutes >= -60; // Can join 15 min before, up to 1 hour after
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Upcoming Meetings</h2>

      {meetings.length === 0 ? (
        <div className="text-center py-12">
          <Calendar size={48} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No upcoming meetings scheduled</p>
        </div>
      ) : (
        <div className="space-y-4">
          {meetings.map((meeting) => (
            <div
              key={meeting.id}
              className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
              style={{ borderLeftWidth: '4px', borderLeftColor: meeting.color }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {meeting.title}
                  </h3>
                  {meeting.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {meeting.description}
                    </p>
                  )}
                </div>

                {/* Menu */}
                <div className="relative">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === meeting.id ? null : meeting.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <MoreVertical size={18} className="text-gray-600" />
                  </button>

                  {openMenuId === meeting.id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpenMenuId(null)}
                      />
                      <div className="absolute right-0 top-10 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                        <button
                          onClick={() => {
                            onCopyLink(meeting.meetingLink);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Copy size={16} />
                          Copy link
                        </button>
                        <button
                          onClick={() => {
                            onEdit(meeting.id);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        <div className="border-t border-gray-200 my-1" />
                        <button
                          onClick={() => {
                            onCancel(meeting.id);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 size={16} />
                          Cancel meeting
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Meeting Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={16} />
                  <span>{getDateLabel(meeting.startTime)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={16} />
                  <span>
                    {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users size={16} />
                  <span>{meeting.participants.length} participants</span>
                </div>
              </div>

              {/* Participants */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center">
                  {meeting.participants.slice(0, 4).map((participant, idx) => (
                    <Image
                      key={participant.id}
                      src={participant.avatar}
                      alt={participant.name}
                      width={32}
                      height={32}
                      className="rounded-full border-2 border-white"
                      style={{ marginLeft: idx > 0 ? '-8px' : '0' }}
                    />
                  ))}
                  {meeting.participants.length > 4 && (
                    <div
                      className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600"
                      style={{ marginLeft: '-8px' }}
                    >
                      +{meeting.participants.length - 4}
                    </div>
                  )}
                </div>
                <span className="text-sm text-gray-600">
                  with {meeting.organizer.name}
                </span>
              </div>

              {/* Recurring Badge */}
              {meeting.isRecurring && (
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded mb-4">
                  <Video size={12} />
                  <span>{meeting.recurringPattern}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                {canJoinNow(meeting) ? (
                  <Button
                    onClick={() => onJoin(meeting.id)}
                    text="Join Now"
                    text_font_size="text-sm"
                    text_font_weight="font-semibold"
                    text_color="text-white"
                    fill_background_color="bg-green-600"
                    border_border_radius="rounded-lg"
                    padding="py-2 px-4"
                    className="flex-1 hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Video size={16} />
                    <span>Join Now</span>
                  </Button>
                ) : (
                  <Button
                    onClick={() => onCopyLink(meeting.meetingLink)}
                    text="Copy Link"
                    text_font_size="text-sm"
                    text_font_weight="font-medium"
                    text_color="text-gray-700"
                    fill_background_color="bg-white"
                    border_border="border border-gray-300"
                    border_border_radius="rounded-lg"
                    padding="py-2 px-4"
                    className="flex-1 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Copy size={16} />
                    <span>Copy Link</span>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
