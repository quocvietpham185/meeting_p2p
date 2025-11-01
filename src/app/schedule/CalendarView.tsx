// src/app/schedule/CalendarView.tsx - COMPLETELY REWRITTEN

'use client'
import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ScheduledMeeting } from '@/interfaces/models/schedule'

interface CalendarViewProps {
  meetings: ScheduledMeeting[]
  currentDate: Date
  onDateChange: (date: Date) => void
  onMeetingClick: (meeting: ScheduledMeeting) => void
}

export default function CalendarView({
  meetings,
  currentDate,
  onDateChange,
  onMeetingClick,
}: CalendarViewProps) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const previousMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() - 1)
    onDateChange(newDate)
  }

  const nextMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + 1)
    onDateChange(newDate)
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  // Helper: Tạo Date object từ year/month/day (giờ = 0)
  const createDate = (year: number, month: number, day: number): Date => {
    const d = new Date(year, month, day)
    d.setHours(0, 0, 0, 0)
    return d
  }

  // Helper: So sánh 2 date (chỉ ngày, bỏ qua giờ)
  const isSameDate = (d1: Date, d2: Date): boolean => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    )
  }

  // Kiểm tra meeting có xuất hiện trong ngày này không
  const isMeetingOnDate = (meeting: ScheduledMeeting, checkDate: Date): boolean => {
    // Chuẩn bị dates
    const meetingStart = new Date(meeting.startTime)
    meetingStart.setHours(0, 0, 0, 0)
    
    // Check date phải được reset hours
    const check = new Date(checkDate)
    check.setHours(0, 0, 0, 0)

    

    // Case 1: Meeting không lặp lại
    if (!meeting.isRecurring) {
      return isSameDate(meetingStart, check)
    }

    // Case 2: Meeting có recurring
    const pattern = meeting.recurringPattern?.toLowerCase()
    
    // Ngày check phải >= ngày bắt đầu
    if (check < meetingStart) {
      return false
    }

    // CRITICAL FIX: Đối với recurring meetings, endTime thường là meeting end time
    // chứ KHÔNG PHẢI là ngày kết thúc của series
    // Nên ta sẽ KHÔNG check endTime, hoặc chỉ check nếu endTime khác ngày với startTime
    
    if (meeting.endTime) {
      const recurringEnd = new Date(meeting.endTime)
      recurringEnd.setHours(0, 0, 0, 0)
      
      // Chỉ check nếu endTime khác ngày với startTime (tức là có recurring end date)
      const daysDiff = Math.floor((recurringEnd.getTime() - meetingStart.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff > 1 && check > recurringEnd) {
        // endTime là ngày kết thúc series
        return false
      }
      // Nếu daysDiff <= 1: endTime là thời gian kết thúc meeting, bỏ qua check
    }

    // Kiểm tra pattern
    switch (pattern) {
      case 'daily':
        // Mỗi ngày từ start date trở đi
        return true

      case 'weekly': {
        // Cùng thứ trong tuần
        const meetingDay = meetingStart.getDay()
        const checkDay = check.getDay()
        return meetingDay === checkDay
      }

      case 'monthly': {
        // Cùng ngày trong tháng
        const meetingDate = meetingStart.getDate()
        const checkDateNum = check.getDate()
        return meetingDate === checkDateNum
      }

      default:
        console.warn(`Unknown recurring pattern: ${pattern}`)
        return false
    }
  }

  // Lấy tất cả meetings cho một ngày
  const getMeetingsForDate = (day: number): ScheduledMeeting[] => {
    const checkDate = createDate(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    )

    const result = meetings.filter(meeting => isMeetingOnDate(meeting, checkDate))
    
    
    return result
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <button
            onClick={() => onDateChange(new Date())}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Next month"
          >
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Weekday Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-gray-600 py-2"
          >
            {day}
          </div>
        ))}

        {/* Empty Days */}
        {emptyDays.map((_, idx) => (
          <div key={`empty-${idx}`} className="aspect-square" />
        ))}

        {/* Calendar Days */}
        {days.map((day) => {
          const dayMeetings = getMeetingsForDate(day)
          const isTodayDate = isToday(day)

          return (
            <div
              key={day}
              className={`aspect-square p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer ${
                isTodayDate ? 'bg-blue-50 border-blue-500' : ''
              } ${dayMeetings.length > 0 ? 'border-l-4' : ''}`}
              style={{
                borderLeftColor: dayMeetings.length > 0 ? dayMeetings[0].color : undefined
              }}
            >
              <div className="flex flex-col h-full">
                <span
                  className={`text-sm font-medium ${
                    isTodayDate ? 'text-blue-600' : 'text-gray-900'
                  }`}
                >
                  {day}
                </span>
                <div className="flex-1 mt-1 space-y-1 overflow-hidden">
                  {dayMeetings.slice(0, 2).map((meeting, idx) => (
                    <button
                      key={`${meeting.id}-${day}-${idx}`}
                      onClick={() => onMeetingClick(meeting)}
                      className="w-full text-left px-1 py-0.5 rounded text-xs truncate hover:opacity-80 transition-opacity"
                      style={{
                        backgroundColor: meeting.color + '20',
                        color: meeting.color,
                      }}
                      title={`${meeting.title}${meeting.isRecurring ? ` (${meeting.recurringPattern})` : ''}`}
                    >
                      {meeting.isRecurring && <span className="mr-1">🔁</span>}
                      {meeting.title}
                    </button>
                  ))}
                  {dayMeetings.length > 2 && (
                    <div className="text-xs text-gray-500 px-1 font-medium">
                      +{dayMeetings.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      
    </div>
  )
}
