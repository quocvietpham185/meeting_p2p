// src/app/history/page.tsx

'use client'
import React, { useState } from 'react'
import { Download, FileText } from 'lucide-react'
import FilterBar from './FilterBar'
import MeetingHistoryCard from './MeetingHistoryCard'
import StatsSummary from './StatsSummary'
import Button from '@/components/common/Button'
import { MeetingHistory, HistoryFilters } from '@/interfaces/models/history'
import MainLayout from '@/components/layout/MainLayout'

export default function HistoryPage() {
  const [filters, setFilters] = useState<HistoryFilters>({
    dateRange: 'all',
    recorded: 'all',
    searchQuery: '',
  })

  // Mock data
  const meetings: MeetingHistory[] = [
    {
      id: '1',
      title: 'Daily Standup Meeting',
      meetingId: 'MTG-2024-001',
      date: 'Oct 25, 2024',
      startTime: '15:30',
      endTime: '16:00',
      duration: '30 min',
      participantCount: 5,
      organizer: {
        id: '1',
        name: 'Nguyễn Văn A',
        avatar: '/images/avatar1.png',
      },
      participants: [
        { id: '1', name: 'User 1', avatar: '/images/avatar1.png' },
        { id: '2', name: 'User 2', avatar: '/images/avatar2.png' },
        { id: '3', name: 'User 3', avatar: '/images/avatar3.png' },
        { id: '4', name: 'User 4', avatar: '/images/avatar4.png' },
        { id: '5', name: 'User 5', avatar: '/images/avatar5.png' },
      ],
      isRecorded: true,
      recordingSize: '125 MB',
      transcriptAvailable: true,
      status: 'completed',
      tags: ['Daily', 'Team'],
    },
    {
      id: '2',
      title: 'Client Presentation - Q4 Review',
      meetingId: 'MTG-2024-002',
      date: 'Oct 24, 2024',
      startTime: '14:00',
      endTime: '15:30',
      duration: '1h 30m',
      participantCount: 8,
      organizer: {
        id: '2',
        name: 'Trần Thị B',
        avatar: '/images/avatar2.png',
      },
      participants: [
        { id: '1', name: 'User 1', avatar: '/images/avatar1.png' },
        { id: '2', name: 'User 2', avatar: '/images/avatar2.png' },
        { id: '3', name: 'User 3', avatar: '/images/avatar3.png' },
      ],
      isRecorded: true,
      recordingSize: '340 MB',
      transcriptAvailable: false,
      status: 'completed',
      tags: ['Client', 'Presentation', 'Q4'],
    },
    {
      id: '3',
      title: 'Sprint Planning',
      meetingId: 'MTG-2024-003',
      date: 'Oct 23, 2024',
      startTime: '10:00',
      endTime: '11:30',
      duration: '1h 30m',
      participantCount: 6,
      organizer: {
        id: '1',
        name: 'Nguyễn Văn A',
        avatar: '/images/avatar1.png',
      },
      participants: [
        { id: '1', name: 'User 1', avatar: '/images/avatar1.png' },
        { id: '2', name: 'User 2', avatar: '/images/avatar2.png' },
      ],
      isRecorded: false,
      transcriptAvailable: false,
      status: 'completed',
      tags: ['Planning', 'Sprint'],
    },
  ]

  const handleDownload = (id: string) => {
    console.log('Download recording:', id)
    alert('Downloading recording...')
  }

  const handleViewDetails = (id: string) => {
    console.log('View details:', id)
    alert('Opening meeting details...')
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this meeting?')) {
      console.log('Delete meeting:', id)
      alert('Meeting deleted!')
    }
  }

  const handleShare = (id: string) => {
    console.log('Share meeting:', id)
    alert('Share link copied to clipboard!')
  }

  const handleExportAll = () => {
    console.log('Export all meetings')
    alert('Exporting all meetings to CSV...')
  }

  // Filter meetings
  const filteredMeetings = meetings.filter((meeting) => {
    // Search filter
    if (
      filters.searchQuery &&
      !meeting.title.toLowerCase().includes(filters.searchQuery.toLowerCase())
    ) {
      return false
    }

    // Recorded filter
    if (filters.recorded === 'yes' && !meeting.isRecorded) return false
    if (filters.recorded === 'no' && meeting.isRecorded) return false

    return true
  })

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Meeting History
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                View and manage your past meetings
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleExportAll}
                text="Export"
                text_font_size="text-sm"
                text_font_weight="font-medium"
                text_color="text-gray-700"
                fill_background_color="bg-white"
                border_border="border border-gray-300"
                border_border_radius="rounded-lg"
                padding="py-2 px-4"
                className="hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <StatsSummary
          totalMeetings={meetings.length}
          totalDuration="12.5 hrs"
          totalParticipants={45}
          recordedMeetings={meetings.filter((m) => m.isRecorded).length}
        />

        {/* Filter Bar */}
        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
        />

        {/* Meeting List */}
        <div className="space-y-4">
          {filteredMeetings.length > 0 ? (
            filteredMeetings.map((meeting) => (
              <MeetingHistoryCard
                key={meeting.id}
                meeting={meeting}
                onDownload={handleDownload}
                onViewDetails={handleViewDetails}
                onDelete={handleDelete}
                onShare={handleShare}
              />
            ))
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <FileText
                size={48}
                className="text-gray-400 mx-auto mb-4"
              />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No meetings found
              </h3>
              <p className="text-gray-500">
                Try adjusting your filters or search query
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredMeetings.length > 0 && (
          <div className="mt-6 flex justify-center">
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                Previous
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                1
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                2
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                3
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
