// src/app/schedule/CalendarView.tsx

'use client';
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ScheduledMeeting } from '@/interfaces/models/schedule';

interface CalendarViewProps {
  meetings: ScheduledMeeting[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onMeetingClick: (meeting: ScheduledMeeting) => void;
}

export default function CalendarView({
  meetings,
  currentDate,
  onDateChange,
  onMeetingClick,
}: CalendarViewProps) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const previousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onDateChange(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onDateChange(newDate);
  };

  const getMeetingsForDate = (day: number) => {
    return meetings.filter((meeting) => {
      const meetingDate = new Date(meeting.startTime);
      return (
        meetingDate.getDate() === day &&
        meetingDate.getMonth() === currentDate.getMonth() &&
        meetingDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

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
          const dayMeetings = getMeetingsForDate(day);
          const isTodayDate = isToday(day);

          return (
            <div
              key={day}
              className={`aspect-square p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer ${
                isTodayDate ? 'bg-blue-50 border-blue-500' : ''
              }`}
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
                  {dayMeetings.slice(0, 2).map((meeting) => (
                    <button
                      key={meeting.id}
                      onClick={() => onMeetingClick(meeting)}
                      className="w-full text-left px-1 py-0.5 rounded text-xs truncate"
                      style={{ backgroundColor: meeting.color + '20', color: meeting.color }}
                    >
                      {meeting.title}
                    </button>
                  ))}
                  {dayMeetings.length > 2 && (
                    <div className="text-xs text-gray-500 px-1">
                      +{dayMeetings.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
