'use client'
import React, { useState } from 'react'
import { Plus, LogIn } from 'lucide-react'
import Button from '@/components/common/Button'

interface MeetingActionsProps {
  onCreateMeeting?: () => void
  onJoinMeeting?: (meetingCode: string) => void
}

export default function MeetingActions({
  onCreateMeeting,
  onJoinMeeting,
}: MeetingActionsProps) {
  const [joinCode, setJoinCode] = useState('')

  const handleJoin = () => {
    if (joinCode.trim()) {
      onJoinMeeting?.(joinCode)
      setJoinCode('')
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Create Meeting */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Plus
              size={20}
              className="text-blue-600"
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Tạo phòng mới</h3>
            <p className="text-xs text-gray-500">
              Bắt đầu cuộc họp ngay lập tức
            </p>
          </div>
        </div>
        <Button
          onClick={onCreateMeeting}
          text="Tạo phòng"
          text_font_size="text-sm"
          text_font_weight="font-semibold"
          text_color="text-white"
          fill_background_color="bg-blue-600"
          border_border_radius="rounded-lg"
          padding="py-2.5 px-4"
          className="w-full hover:bg-blue-700 transition-colors"
        />
      </div>

      {/* Join Meeting */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <LogIn
              size={20}
              className="text-purple-600"
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Tham gia phòng</h3>
            <p className="text-xs text-gray-500">Nhập mã phòng để tham gia</p>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nhập mã phòng"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          />
          <Button
            onClick={handleJoin}
            text="Tham gia"
            text_font_size="text-sm"
            text_font_weight="font-semibold"
            text_color="text-white"
            fill_background_color="bg-purple-600"
            border_border_radius="rounded-lg"
            padding="py-2.5 px-4"
            className="hover:bg-purple-700 transition-colors"
          />
        </div>
      </div>
    </div>
  )
}
