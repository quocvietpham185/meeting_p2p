'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import CreateMeetingForm from './CreateMeetingForm'
import { MeetingCreatePayload } from '@/interfaces/api/meeting'
import MainLayout from '@/components/layout/MainLayout'
import api from '@/lib/api'

export default function CreateMeetingPage() {
  const router = useRouter()

  const handleStartMeeting = async (data: MeetingCreatePayload) => {
    try {
      const response = await api.post('/meetings', data)
      const result = response.data

      if (!result.success) throw new Error(result.message)
      alert('Tạo cuộc họp thành công!')
      router.push(`/meeting/room/${result.data.meetingId}`)
    } catch (error) {
      console.error('Error starting meeting:', error)
      alert('Lỗi khi tạo cuộc họp!')
    }
  }

  const handleScheduleMeeting = async (data: MeetingCreatePayload) => {
    try {
      const response = await api.post('/schedule', data)
      const result = response.data

      if (!result.success) throw new Error(result.message)
      alert('Lên lịch cuộc họp thành công!')
      router.push('/schedule')
    } catch (error) {
      console.error('Error scheduling meeting:', error)
      alert('Lỗi khi lên lịch cuộc họp!')
    }
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
