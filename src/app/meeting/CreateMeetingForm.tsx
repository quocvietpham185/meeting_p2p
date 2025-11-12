'use client'
import React, { useState } from 'react'
import { Calendar, Video, Users, FileText } from 'lucide-react'
import Button from '@/components/common/Button'
import EditText from '@/components/common/EditText'
import { MeetingCreatePayload } from '@/interfaces/api/meeting'

interface CreateMeetingFormProps {
  onStartMeeting: (data: MeetingCreatePayload) => void
  onScheduleMeeting: (data: MeetingCreatePayload) => void
}

export default function CreateMeetingForm({
  onStartMeeting,
  onScheduleMeeting,
}: CreateMeetingFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    passcode: '',
    scheduledTime: '',
    duration: '30',
    maxParticipants: '50',
    enableRecording: false,
    enableWaitingRoom: true,
    inviteEmails: '',
    recurrence_type: 'none',
    recurrence_interval: '1',
    recurrence_days: [] as string[],
    end_date: '',
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value =
        e.target.type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : e.target.value
      setFormData((prev) => ({ ...prev, [field]: value }))
    }

  const handleToggle = (field: 'enableRecording' | 'enableWaitingRoom') => {
    setFormData((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const calculateEndTime = (start: string, durationMinutes: string) => {
    if (!start) return ''
    const startDate = new Date(start)
    const endDate = new Date(startDate.getTime() + Number(durationMinutes) * 60000)
    return endDate.toISOString()
  }

  const handleStartMeeting = async () => {
  if (!formData.title.trim()) return alert('Vui lòng nhập tên phòng!')
  setIsLoading(true)
  try {
    const now = new Date().toISOString()
    const end_time = calculateEndTime(now, formData.duration)

    const payload: MeetingCreatePayload = {
      title: formData.title,
      description: formData.description || '',
      passcode: formData.passcode || null,
      start_time: now,
      end_time,
      duration: Number(formData.duration),
      max_participants: Number(formData.maxParticipants),
      enable_recording: formData.enableRecording,
      enable_waiting_room: formData.enableWaitingRoom,
      inviteEmails: formData.inviteEmails,

      // 👇 thêm 4 trường recurrence mặc định
      recurrence_type: 'none',
      recurrence_interval: '1',
      recurrence_days: '',
      end_date: null,
    }

    onStartMeeting(payload)
  } catch (error) {
    console.error(error)
    alert('Có lỗi xảy ra!')
  } finally {
    setIsLoading(false)
  }
}


  const handleScheduleMeeting = async () => {
    if (!formData.title.trim()) return alert('Vui lòng nhập tên phòng!')
    if (!formData.scheduledTime) return alert('Vui lòng chọn thời gian!')
    setIsLoading(true)
    try {
      const start_time = new Date(formData.scheduledTime).toISOString()
      const end_time = calculateEndTime(start_time, formData.duration)

      const payload: MeetingCreatePayload = {
        title: formData.title,
        description: formData.description || '',
        passcode: formData.passcode || null,
        start_time,
        end_time,
        duration: Number(formData.duration),
        max_participants: Number(formData.maxParticipants),
        enable_recording: formData.enableRecording,
        enable_waiting_room: formData.enableWaitingRoom,
        inviteEmails: formData.inviteEmails || '',
        recurrence_type: formData.recurrence_type,
        recurrence_interval: formData.recurrence_interval,
        recurrence_days: formData.recurrence_days.join(','),
        end_date: formData.end_date || null,
      }

      onScheduleMeeting(payload)
    } catch (error) {
      console.error(error)
      alert('Có lỗi xảy ra!')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tạo cuộc họp mới</h1>
        <p className="text-gray-600">Thiết lập phòng họp mới hoặc lên lịch cho sau</p>
      </div>

      <div className="space-y-6">
        {/* Tên phòng */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tên phòng<span className="text-red-500">*</span>
          </label>
          <EditText
            type="text"
            placeholder="Nhập tên phòng họp"
            value={formData.title}
            onChange={handleInputChange('title')}
            text_font_size="text-base"
            text_color="text-gray-900"
            fill_background_color="bg-white"
            border_border="border border-gray-300"
            border_border_radius="rounded-lg"
            padding="py-3 px-4"
            className="w-full focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Mô tả */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mô tả cuộc họp
          </label>
          <div className="relative">
            <textarea
              placeholder="Nhập nội dung, mục tiêu hoặc ghi chú cho cuộc họp"
              value={formData.description}
              onChange={handleInputChange('description')}
              rows={3}
              className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base text-gray-900 resize-none"
            />
            <FileText size={18} className="absolute right-3 top-3 text-gray-400" />
          </div>
        </div>

        {/* Thời gian và thời lượng */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thời gian bắt đầu (tuỳ chọn)
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                value={formData.scheduledTime}
                onChange={handleInputChange('scheduledTime')}
                className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base text-gray-900"
              />
              <Calendar
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thời lượng (phút)
            </label>
            <select
              value={formData.duration}
              onChange={handleInputChange('duration')}
              className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base text-gray-900"
            >
              <option value="15">15 phút</option>
              <option value="30">30 phút</option>
              <option value="45">45 phút</option>
              <option value="60">1 giờ</option>
              <option value="90">1.5 giờ</option>
              <option value="120">2 giờ</option>
            </select>
          </div>
        </div>

        {/* Lặp lại */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lặp lại
          </label>
          <select
            value={formData.recurrence_type}
            onChange={handleInputChange('recurrence_type')}
            className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base text-gray-900"
          >
            <option value="none">Không lặp lại</option>
            <option value="daily">Hàng ngày</option>
            <option value="weekly">Hàng tuần</option>
            <option value="monthly">Hàng tháng</option>
          </select>
        </div>

        {formData.recurrence_type === 'weekly' && (
          <div className="mt-2 flex gap-2 flex-wrap">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <label key={day} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={formData.recurrence_days.includes(day)}
                  onChange={() =>
                    setFormData((prev) => ({
                      ...prev,
                      recurrence_days: prev.recurrence_days.includes(day)
                        ? prev.recurrence_days.filter((d) => d !== day)
                        : [...prev.recurrence_days, day],
                    }))
                  }
                />
                {day}
              </label>
            ))}
          </div>
        )}

        {formData.recurrence_type !== 'none' && (
          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày kết thúc lặp lại
            </label>
            <input
              type="date"
              value={formData.end_date}
              onChange={handleInputChange('end_date')}
              className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base text-gray-900"
            />
          </div>
        )}

        {/* Bật ghi hình & phòng chờ */}
        <div className="space-y-4 pt-2">
          {[ 
            {
              label: 'Bật ghi hình',
              desc: 'Tự động ghi lại cuộc họp',
              icon: <Video size={20} className="text-gray-700" />,
              field: 'enableRecording',
            },
            {
              label: 'Bật phòng chờ',
              desc: 'Duyệt thủ công người tham gia',
              icon: <Users size={20} className="text-gray-700" />,
              field: 'enableWaitingRoom',
            },
          ].map((opt) => (
            <div key={opt.field} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  {opt.icon}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{opt.label}</h4>
                  <p className="text-xs text-gray-500">{opt.desc}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleToggle(opt.field as 'enableRecording' | 'enableWaitingRoom')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData[opt.field as 'enableRecording' | 'enableWaitingRoom']
                    ? 'bg-blue-600'
                    : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData[opt.field as 'enableRecording' | 'enableWaitingRoom']
                      ? 'translate-x-6'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        {/* Nút hành động */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <Button
            onClick={handleStartMeeting}
            disabled={isLoading}
            text="Bắt đầu ngay"
            text_font_size="text-base"
            text_font_weight="font-semibold"
            text_color="text-white"
            fill_background_color="bg-blue-600"
            border_border_radius="rounded-lg"
            padding="py-3 px-4"
            className="w-full hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Video size={18} />
            {isLoading ? 'Đang tạo...' : 'Bắt đầu ngay'}
          </Button>

          <Button
            onClick={handleScheduleMeeting}
            disabled={isLoading}
            text="Lên lịch cuộc họp"
            text_font_size="text-base"
            text_font_weight="font-semibold"
            text_color="text-blue-600"
            fill_background_color="bg-white"
            border_border="border border-blue-600"
            border_border_radius="rounded-lg"
            padding="py-3 px-4"
            className="w-full hover:bg-blue-50 flex items-center justify-center gap-2"
          >
            <Calendar size={18} />
            {isLoading ? 'Đang lên lịch...' : 'Lên lịch cuộc họp'}
          </Button>
        </div>
      </div>
    </div>
  )
}
