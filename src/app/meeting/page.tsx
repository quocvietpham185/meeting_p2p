'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import CreateMeetingForm from './CreateMeetingForm'
import { MeetingCreatePayload } from '@/interfaces/api/meeting'
import MainLayout from '@/components/layout/MainLayout'
import api from '@/lib/api'

export default function CreateMeetingPage() {
  const router = useRouter()

  // ✅ Giờ type là MeetingCreatePayload, khớp với CreateMeetingForm
  const handleStartMeeting = async (data: MeetingCreatePayload) => {
    try {
      console.log('Start meeting now:', data)

      const response = await api.post('/meetings', data)
      const result = await response.data

      if (!result.success) {
        throw new Error(result.message || 'Failed to create meeting')
      }

      alert('Tạo cuộc họp thành công!')
      router.push(`/meeting/room/${result.data.meetingId}`)
    } catch (error) {
      console.error('Error starting meeting:', error)
      alert('Error creating meeting. Please try again.')
    }
  }

  const handleScheduleMeeting = async (data: MeetingCreatePayload) => {
    console.log('Schedule meeting:', data)
    alert('Meeting scheduled! (TODO: Navigate to schedule)')
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-6">
        <CreateMeetingForm
          onStartMeeting={handleStartMeeting}
          onScheduleMeeting={handleScheduleMeeting}
        />
      </div>
    </MainLayout>
  )
}
