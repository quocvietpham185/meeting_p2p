// src/app/schedule/DayView.tsx

'use client'
import React from 'react'
import { ChevronLeft, ChevronRight, Clock, Users, Video } from 'lucide-react'
import { ScheduledMeeting } from '@/interfaces/models/schedule'

interface DayViewProps {
  meetings: ScheduledMeeting[]
  currentDate: Date
  onDateChange: (date: Date) => void
  onMeetingClick: (meeting: ScheduledMeeting) => void
}

export default function DayView({
  meetings,
  currentDate,
  onDateChange,
  onMeetingClick,
}: DayViewProps) {
  const previousDay = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - 1)
    onDateChange(newDate)
  }

  const nextDay = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 1)
    onDateChange(newDate)
  }

  const goToToday = () => {
    onDateChange(new Date())
  }

  const isToday = (): boolean => {
    const today = new Date()
    return (
      currentDate.getDate() === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  // Check if meeting appears on current date
  const isMeetingOnDate = (meeting: ScheduledMeeting): boolean => {
    const meetingStart = new Date(meeting.startTime)
    meetingStart.setHours(0, 0, 0, 0)
    
    const check = new Date(currentDate)
    check.setHours(0, 0, 0, 0)

    if (!meeting.isRecurring) {
      return meetingStart.getTime() === check.getTime()
    }

    const pattern = meeting.recurringPattern?.toLowerCase()
    
    if (check < meetingStart) return false

    if (meeting.endTime) {
      const recurringEnd = new Date(meeting.endTime)
      recurringEnd.setHours(0, 0, 0, 0)
      
      const daysDiff = Math.floor(
        (recurringEnd.getTime() - meetingStart.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (daysDiff > 1 && check > recurringEnd) {
        return false
      }
    }

    switch (pattern) {
      case 'daily':
        return true
      case 'weekly':
        return meetingStart.getDay() === check.getDay()
      case 'monthly':
        return meetingStart.getDate() === check.getDate()
      default:
        return false
    }
  }

  const dayMeetings = meetings
    .filter(meeting => isMeetingOnDate(meeting))
    .sort((a, b) => {
      const timeA = new Date(a.startTime).getHours() * 60 + new Date(a.startTime).getMinutes()
      const timeB = new Date(b.startTime).getHours() * 60 + new Date(b.startTime).getMinutes()
      return timeA - timeB
    })

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDateLong = (): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    
    return `${days[currentDate.getDay()]}, ${months[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-700'
      case 'in-progress': return 'bg-green-100 text-green-700'
      case 'completed': return 'bg-gray-100 text-gray-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {formatDateLong()}
          </h2>
          {isToday() && (
            <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded">
              Today
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={previousDay}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Previous day"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <button
            onClick={goToToday}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            onClick={nextDay}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Next day"
          >
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Day Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm font-semibold text-gray-900">
          {dayMeetings.length === 0 ? (
            'No meetings scheduled'
          ) : (
            <>
              {dayMeetings.length} {dayMeetings.length === 1 ? 'meeting' : 'meetings'} today
            </>
          )}
        </p>
      </div>

      {/* Meetings List */}
      {dayMeetings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">
            <Clock size={48} className="mx-auto" />
          </div>
          <p className="text-gray-500">No meetings scheduled for this day</p>
          <p className="text-sm text-gray-400 mt-1">Enjoy your free time!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {dayMeetings.map((meeting, index) => (
            <button
              key={`${meeting.id}-${index}`}
              onClick={() => onMeetingClick(meeting)}
              className="w-full text-left p-4 rounded-lg border-2 hover:shadow-lg transition-all"
              style={{
                borderColor: meeting.color,
                backgroundColor: meeting.color + '10',
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {meeting.isRecurring && (
                      <span className="text-sm">🔁</span>
                    )}
                    <h3 className="text-lg font-semibold text-gray-900">
                      {meeting.title}
                    </h3>
                  </div>
                  {meeting.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {meeting.description}
                    </p>
                  )}
                </div>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(meeting.status)}`}
                >
                  {meeting.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                {/* Time */}
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock size={16} className="text-gray-400" />
                  <span>
                    {formatTime(new Date(meeting.startTime))} - {formatTime(new Date(meeting.endTime))}
                  </span>
                </div>

                {/* Participants */}
                <div className="flex items-center gap-2 text-gray-700">
                  <Users size={16} className="text-gray-400" />
                  <span>
                    {meeting.participants.length === 0 
                      ? 'No participants' 
                      : `${meeting.participants.length} participant${meeting.participants.length > 1 ? 's' : ''}`
                    }
                  </span>
                </div>

                {/* Meeting Link */}
                {meeting.meetingLink && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Video size={16} className="text-gray-400" />
                    <span className="text-blue-600 hover:underline">
                      Join meeting
                    </span>
                  </div>
                )}
              </div>

              {/* Organizer */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <img
                    src={meeting.organizer.avatar || '/default-avatar.png'}
                    alt={meeting.organizer.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm text-gray-600">
                    Organized by <strong>{meeting.organizer.name}</strong>
                  </span>
                </div>
              </div>

              {/* Recurring Pattern */}
              {meeting.isRecurring && meeting.recurringPattern && (
                <div className="mt-2">
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                    Repeats {meeting.recurringPattern}
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}