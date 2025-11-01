// src/app/schedule/UpcomingList.tsx

'use client'
import React from 'react'
import Image from 'next/image'
import {
  Calendar,
  Clock,
  Users,
  Video,
  MoreVertical,
  Copy,
  Edit,
  Trash2,
} from 'lucide-react'
import { ScheduledMeeting } from '@/interfaces/models/schedule'
import Button from '@/components/common/Button'

interface UpcomingListProps {
  meetings: ScheduledMeeting[]
  onJoin: (id: string) => void
  onEdit: (id: string) => void
  onCancel: (id: string) => void
  onCopyLink: (link: string) => void
}

export default function UpcomingList({
  meetings,
  onJoin,
  onEdit,
  onCancel,
  onCopyLink,
}: UpcomingListProps) {
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null)

  const formatTime = (date: Date) =>
    new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Ho_Chi_Minh',
    })

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()

  const getDateGroup = (date: Date) => {
    if (isSameDay(date, today)) return 'Today'
    if (isSameDay(date, tomorrow)) return 'Tomorrow'
    return formatDate(date)
  }

  const groupedMeetings: Record<string, ScheduledMeeting[]> = {}
  meetings.forEach((m) => {
  const start = new Date(m.startTime);

  // Nếu daily, tạo các ngày từ startTime tới vài ngày tới
  if (m.isRecurring && m.recurringPattern === 'Daily') {
    const daysToShow = 30; // ví dụ 30 ngày tới
    for (let i = 0; i < daysToShow; i++) {
      const meetingDate = new Date(start);
      meetingDate.setDate(start.getDate() + i);
      const group = getDateGroup(meetingDate);
      if (!groupedMeetings[group]) groupedMeetings[group] = [];
      groupedMeetings[group].push({ ...m, startTime: meetingDate });
    }
  } else {
    const group = getDateGroup(start);
    if (!groupedMeetings[group]) groupedMeetings[group] = [];
    groupedMeetings[group].push(m);
  }
});


  const canJoinNow = (meeting: ScheduledMeeting) => {
    const now = new Date()
    const startTime = new Date(meeting.startTime)
    const diffMinutes = (startTime.getTime() - now.getTime()) / (1000 * 60)
    return diffMinutes <= 15 && diffMinutes >= -60
  }

  const renderMeetingCard = (meeting: ScheduledMeeting) => (
    <div
      key={meeting.id}
      className="bg-white rounded-xl shadow-md p-5 border-l-4"
      style={{ borderLeftColor: meeting.color }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900">{meeting.title}</h3>
          {meeting.description && (
            <p className="text-sm text-gray-500 line-clamp-2 mt-1">
              {meeting.description}
            </p>
          )}
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() =>
              setOpenMenuId(openMenuId === meeting.id ? null : meeting.id)
            }
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <MoreVertical size={18} className="text-gray-500" />
          </button>
          {openMenuId === meeting.id && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setOpenMenuId(null)}
              />
              <div className="absolute right-0 mt-2 w-44 bg-white shadow-lg rounded-lg z-20 py-1 border border-gray-200">
                <button
                  onClick={() => {
                    onCopyLink(meeting.meetingLink)
                    setOpenMenuId(null)
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Copy size={16} /> Copy link
                </button>
                <button
                  onClick={() => {
                    onEdit(meeting.id)
                    setOpenMenuId(null)
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Edit size={16} /> Edit
                </button>
                <div className="border-t border-gray-200 my-1" />
                <button
                  onClick={() => {
                    onCancel(meeting.id)
                    setOpenMenuId(null)
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={16} /> Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Meeting Info */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-1">
          <Calendar size={16} /> {formatDate(meeting.startTime)}
        </div>
        <div className="flex items-center gap-1">
          <Clock size={16} /> {formatTime(meeting.startTime)} -{' '}
          {formatTime(meeting.endTime)}
        </div>
        <div className="flex items-center gap-1">
          <Users size={16} /> {meeting.participants.length} participants
        </div>
      </div>

      {/* Participants */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex -space-x-2">
          {meeting.participants.slice(0, 4).map((p) => (
            <Image
              key={p.id}
              src={p.avatar}
              alt={p.name}
              width={32}
              height={32}
              className="rounded-full border-2 border-white hover:scale-110 transition"
            />
          ))}
          {meeting.participants.length > 4 && (
            <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-600">
              +{meeting.participants.length - 4}
            </div>
          )}
        </div>
        <span className="text-sm text-gray-600">with {meeting.organizer.name}</span>
      </div>

      {/* Recurring Badge */}
      {meeting.isRecurring && (
        <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded mb-4">
          <Video size={12} /> {meeting.recurringPattern}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {canJoinNow(meeting) ? (
          <Button
            onClick={() => onJoin(meeting.id)}
            text="Join Now"
            text_color="text-white"
            fill_background_color="bg-green-600"
            border_border_radius="rounded-lg"
            className="flex-1 hover:bg-green-700 transition flex items-center justify-center gap-2"
          >
            <Video size={16} /> Join Now
          </Button>
        ) : (
          <Button
            onClick={() => onCopyLink(meeting.meetingLink)}
            text="Copy Link"
            text_color="text-gray-700"
            fill_background_color="bg-white"
            border_border="border border-gray-300"
            border_border_radius="rounded-lg"
            className="flex-1 hover:bg-gray-50 transition flex items-center justify-center gap-2"
          >
            <Copy size={16} /> Copy Link
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Upcoming Meetings</h2>
      {meetings.length === 0 ? (
        <div className="text-center py-12">
          <Calendar size={48} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No upcoming meetings scheduled</p>
        </div>
      ) : (
        Object.entries(groupedMeetings).map(([group, items]) => (
          <div key={group} className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">{group}</h3>
            <div className="space-y-4">
              {items.map((meeting) => renderMeetingCard(meeting))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
