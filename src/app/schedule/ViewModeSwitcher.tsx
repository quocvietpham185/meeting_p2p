// src/app/schedule/ViewModeSwitcher.tsx - UPDATED

'use client'
import React from 'react'
import { Calendar, List, Clock, CalendarDays } from 'lucide-react'
import { ViewMode } from '@/interfaces/models/schedule'

interface ViewModeSwitcherProps {
  currentView: ViewMode
  onViewChange: (view: ViewMode) => void
}

export default function ViewModeSwitcher({
  currentView,
  onViewChange,
}: ViewModeSwitcherProps) {
  const views: { mode: ViewMode; icon: React.ReactNode; label: string }[] = [
    { mode: 'month', icon: <Calendar size={16} />, label: 'Month' },
    { mode: 'week', icon: <CalendarDays size={16} />, label: 'Week' },
    { mode: 'day', icon: <Clock size={16} />, label: 'Day' },
    { mode: 'list', icon: <List size={16} />, label: 'List' },
  ]

  return (
    <div className="flex gap-2 bg-gray-100 p-1 rounded-lg inline-flex">
      {views.map((view) => (
        <button
          key={view.mode}
          onClick={() => onViewChange(view.mode)}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            currentView === view.mode
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {view.icon}
          <span className="hidden sm:inline">{view.label}</span>
        </button>
      ))}
    </div>
  )
}