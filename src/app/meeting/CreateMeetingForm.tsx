// src/app/meeting/CreateMeetingForm.tsx

'use client'
import React, { useState } from 'react'
import { RefreshCw, Calendar, Video, Users } from 'lucide-react'
import Button from '@/components/common/Button'
import EditText from '@/components/common/EditText'
import { MeetingFormData } from '@/interfaces/models/meeting'

interface CreateMeetingFormProps {
  onStartMeeting: (data: MeetingFormData) => void
  onScheduleMeeting: (data: MeetingFormData) => void
}

function generateRoomId(): string {
  const randomNum = Math.floor(100000 + Math.random() * 900000)
  return `MTG-${randomNum}`
}

export default function CreateMeetingForm({
  onStartMeeting,
  onScheduleMeeting,
}: CreateMeetingFormProps) {
  const [formData, setFormData] = useState<MeetingFormData>({
    roomName: '',
    roomId: generateRoomId(),
    passcode: '',
    scheduledTime: '',
    duration: '30',
    maxParticipants: '50',
    enableRecording: false,
    enableWaitingRoom: true,
    inviteEmails: '',
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange =
    (field: keyof MeetingFormData) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }))
    }

  const handleToggle = (field: 'enableRecording' | 'enableWaitingRoom') => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const handleRefreshRoomId = () => {
    setFormData((prev) => ({
      ...prev,
      roomId: generateRoomId(),
    }))
  }

  const handleStartMeeting = async () => {
    if (!formData.roomName.trim()) {
      alert('Vui lòng nhập tên phòng!')
      return
    }

    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      onStartMeeting(formData)
    } catch (error) {
      console.error('Error:', error)
      alert('Có lỗi xảy ra!')
    } finally {
      setIsLoading(false)
    }
  }

  const handleScheduleMeeting = async () => {
    if (!formData.roomName.trim()) {
      alert('Vui lòng nhập tên phòng!')
      return
    }

    if (!formData.scheduledTime) {
      alert('Vui lòng chọn thời gian!')
      return
    }

    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      onScheduleMeeting(formData)
    } catch (error) {
      console.error('Error:', error)
      alert('Có lỗi xảy ra!')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Create Meeting
        </h1>
        <p className="text-gray-600">
          Set up a new meeting room or schedule one for later
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Room Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Room Name<span className="text-red-500">*</span>
          </label>
          <EditText
            type="text"
            placeholder="Enter meeting room name"
            value={formData.roomName}
            onChange={handleInputChange('roomName')}
            text_font_size="text-base"
            text_color="text-gray-900"
            fill_background_color="bg-white"
            border_border="border border-gray-300"
            border_border_radius="rounded-lg"
            padding="py-3 px-4"
            className="w-full focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Room ID and Passcode */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Room ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room ID
            </label>
            <div className="relative">
              <EditText
                type="text"
                value={formData.roomId}
                onChange={handleInputChange('roomId')}
                text_font_size="text-base"
                text_color="text-gray-900"
                fill_background_color="bg-gray-50"
                border_border="border border-gray-300"
                border_border_radius="rounded-lg"
                padding="py-3 px-4 pr-12"
                className="w-full focus:ring-blue-500 focus:border-blue-500"
                readOnly
              />
              <button
                type="button"
                onClick={handleRefreshRoomId}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                aria-label="Refresh Room ID"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>

          {/* Passcode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Passcode (Optional)
            </label>
            <EditText
              type="text"
              placeholder="Enter meeting passcode"
              value={formData.passcode}
              onChange={handleInputChange('passcode')}
              text_font_size="text-base"
              text_color="text-gray-900"
              fill_background_color="bg-white"
              border_border="border border-gray-300"
              border_border_radius="rounded-lg"
              padding="py-3 px-4"
              className="w-full focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Scheduled Time and Duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Scheduled Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scheduled Time (Optional)
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                value={formData.scheduledTime}
                onChange={handleInputChange('scheduledTime')}
                className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base text-gray-900"
              />
              <Calendar
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                size={18}
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (Minutes)
            </label>
            <select
              value={formData.duration}
              onChange={handleInputChange('duration')}
              className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base text-gray-900"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
            </select>
          </div>
        </div>

        {/* Max Participants */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Participants
          </label>
          <EditText
            type="number"
            value={formData.maxParticipants}
            onChange={handleInputChange('maxParticipants')}
            text_font_size="text-base"
            text_color="text-gray-900"
            fill_background_color="bg-white"
            border_border="border border-gray-300"
            border_border_radius="rounded-lg"
            padding="py-3 px-4"
            className="w-full focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Toggle Options */}
        <div className="space-y-4 pt-2">
          {/* Enable Recording */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <Video
                  size={20}
                  className="text-gray-700"
                />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  Enable Recording
                </h4>
                <p className="text-xs text-gray-500">
                  Automatically record this meeting
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('enableRecording')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.enableRecording ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.enableRecording ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Enable Waiting Room */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <Users
                  size={20}
                  className="text-gray-700"
                />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  Enable Waiting Room
                </h4>
                <p className="text-xs text-gray-500">
                  Admit participants manually
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('enableWaitingRoom')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.enableWaitingRoom ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.enableWaitingRoom ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Invite Participants */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Invite Participants (Optional)
          </label>
          <textarea
            placeholder="Enter email addresses separated by commas&#10;example@domain.com, user@company.com"
            value={formData.inviteEmails}
            onChange={handleInputChange('inviteEmails')}
            rows={3}
            className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base text-gray-900 resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            Separate multiple emails with commas
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <Button
            onClick={handleStartMeeting}
            disabled={isLoading}
            text={isLoading ? 'Creating...' : 'Start Meeting Now'}
            text_font_size="text-base"
            text_font_weight="font-semibold"
            text_color="text-white"
            fill_background_color="bg-blue-600"
            border_border_radius="rounded-lg"
            padding="py-3 px-4"
            className="w-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Video size={18} />
            <span>{isLoading ? 'Creating...' : 'Start Meeting Now'}</span>
          </Button>

          <Button
            onClick={handleScheduleMeeting}
            disabled={isLoading}
            text={isLoading ? 'Scheduling...' : 'Schedule Meeting'}
            text_font_size="text-base"
            text_font_weight="font-semibold"
            text_color="text-blue-600"
            fill_background_color="bg-white"
            border_border="border border-blue-600"
            border_border_radius="rounded-lg"
            padding="py-3 px-4"
            className="w-full hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Calendar size={18} />
            <span>{isLoading ? 'Scheduling...' : 'Schedule Meeting'}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
