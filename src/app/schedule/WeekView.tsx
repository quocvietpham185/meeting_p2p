// src/app/schedule/WeekView.tsx

'use client'
import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ScheduledMeeting } from '@/interfaces/models/schedule'

interface WeekViewProps {
  meetings: ScheduledMeeting[]
  currentDate: Date
  onDateChange: (date: Date) => void
  onMeetingClick: (meeting: ScheduledMeeting) => void
}

export default function WeekView({
  meetings,
  currentDate,
  onDateChange,
  onMeetingClick,
}: WeekViewProps) {
  // Get start of week (Sunday)
  const getStartOfWeek = (date: Date): Date => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day
    return new Date(d.setDate(diff))
  }

  // Get week days array
  const getWeekDays = (startDate: Date): Date[] => {
    const days: Date[] = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate)
      day.setDate(startDate.getDate() + i)
      days.push(day)
    }
    return days
  }

  const startOfWeek = getStartOfWeek(currentDate)
  const weekDays = getWeekDays(startOfWeek)

  const previousWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - 7)
    onDateChange(newDate)
  }

  const nextWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 7)
    onDateChange(newDate)
  }

  const goToToday = () => {
    onDateChange(new Date())
  }

  const isToday = (date: Date): boolean => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  // Check if meeting appears on this date
  const isMeetingOnDate = (meeting: ScheduledMeeting, checkDate: Date): boolean => {
    const meetingStart = new Date(meeting.startTime)
    meetingStart.setHours(0, 0, 0, 0)
    
    const check = new Date(checkDate)
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

  const getMeetingsForDate = (date: Date): ScheduledMeeting[] => {
    return meetings
      .filter(meeting => isMeetingOnDate(meeting, date))
      .sort((a, b) => {
        const timeA = new Date(a.startTime).getHours() * 60 + new Date(a.startTime).getMinutes()
        const timeB = new Date(b.startTime).getHours() * 60 + new Date(b.startTime).getMinutes()
        return timeA - timeB
      })
  }

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const getWeekRange = (): string => {
    const start = weekDays[0]
    const end = weekDays[6]
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]

    if (start.getMonth() === end.getMonth()) {
      return `${monthNames[start.getMonth()]} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`
    } else {
      return `${monthNames[start.getMonth()]} ${start.getDate()} - ${monthNames[end.getMonth()]} ${end.getDate()}, ${start.getFullYear()}`
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">{getWeekRange()}</h2>
        <div className="flex gap-2">
          <button
            onClick={previousWeek}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Previous week"
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
            onClick={nextWeek}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Next week"
          >
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-3">
        {weekDays.map((day, index) => {
          const dayMeetings = getMeetingsForDate(day)
          const isTodayDate = isToday(day)

          return (
            <div key={index} className="flex flex-col">
              {/* Day Header */}
              <div
                className={`text-center pb-3 border-b-2 mb-3 ${
                  isTodayDate ? 'border-blue-600' : 'border-gray-200'
                }`}
              >
                <div className="text-xs font-semibold text-gray-600 uppercase">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index]}
                </div>
                <div
                  className={`text-2xl font-bold mt-1 ${
                    isTodayDate ? 'text-blue-600' : 'text-gray-900'
                  }`}
                >
                  {day.getDate()}
                </div>
              </div>

              {/* Meetings for this day */}
              <div className="space-y-2 min-h-[200px]">
                {dayMeetings.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center mt-4">No meetings</p>
                ) : (
                  dayMeetings.map((meeting, idx) => (
                    <button
                      key={`${meeting.id}-${day.toDateString()}-${idx}`}
                      onClick={() => onMeetingClick(meeting)}
                      className="w-full text-left p-2 rounded-lg hover:shadow-md transition-all"
                      style={{
                        backgroundColor: meeting.color + '20',
                        borderLeft: `4px solid ${meeting.color}`,
                      }}
                    >
                      <div className="flex items-start gap-1 mb-1">
                        {meeting.isRecurring && (
                          <span className="text-xs">🔁</span>
                        )}
                        <p
                          className="text-xs font-semibold truncate flex-1"
                          style={{ color: meeting.color }}
                        >
                          {meeting.title}
                        </p>
                      </div>
                      <p className="text-xs text-gray-600">
                        {formatTime(new Date(meeting.startTime))}
                      </p>
                      {meeting.participants.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {meeting.participants.length} participants
                        </p>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          <strong>
            {meetings.filter(m => 
              weekDays.some(day => isMeetingOnDate(m, day))
            ).length}
          </strong>{' '}
          meetings this week
        </p>
      </div>
    </div>
  )
}