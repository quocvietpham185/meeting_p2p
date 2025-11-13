'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/api'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/common/Button'
import { Calendar, Users, Video } from 'lucide-react'

export default function EditMeetingPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // FORM state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [passcode, setPasscode] = useState('')
  const [maxParticipants, setMaxParticipants] = useState(50)

  const [enableRecording, setEnableRecording] = useState(false)
  const [enableWaitingRoom, setEnableWaitingRoom] = useState(true)

  const [recurrenceType, setRecurrenceType] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none')
  const [recurrenceInterval, setRecurrenceInterval] = useState(1)
  const [recurrenceDays, setRecurrenceDays] = useState<string[]>([])
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('')

  const WEEK_MAP = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']

  // --- Fetch meeting ---
  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const res = await api.get(`/schedule/${id}`)
        const m = res.data.data

        setTitle(m.title)
        setDescription(m.description ?? '')

        setStartTime(m.start_time?.slice(0, 16))
        setEndTime(m.end_time?.slice(0, 16))

        setPasscode(m.passcode ?? '')
        setMaxParticipants(m.max_participants ?? 50)
        setEnableRecording(m.is_recorded === 1)
        setEnableWaitingRoom(m.waiting_room_enabled === 1)

        setRecurrenceType(m.recurrence_type ?? 'none')
        setRecurrenceInterval(m.recurrence_interval ?? 1)

        setRecurrenceDays(m.recurrence_days ? m.recurrence_days.split(',') : [])
        setRecurrenceEndDate(m.end_date?.slice(0, 10) ?? '')

      } catch (err) {
        console.error(err)
        alert('Cannot load meeting')
      } finally {
        setLoading(false)
      }
    }

    fetchMeeting()
  }, [id])

  // ------------------------
  // VALIDATE
  // ------------------------
  const validate = () => {
    if (!title.trim()) {
      alert('Title is required')
      return false
    }

    if (!startTime || !endTime) {
      alert('Start and end time are required')
      return false
    }

    if (new Date(startTime).getTime() < Date.now()) {
      alert('Cannot set meeting in the past!')
      return false
    }

    if (new Date(endTime).getTime() <= new Date(startTime).getTime()) {
      alert('End time must be greater than start time!')
      return false
    }

    if (recurrenceType !== 'none') {
      if (recurrenceType === 'weekly' && recurrenceDays.length === 0) {
        alert('Please choose at least 1 weekday for weekly recurrence!')
        return false
      }

      if (recurrenceEndDate) {
        if (new Date(recurrenceEndDate).getTime() < new Date(startTime).getTime()) {
          alert('Recurrence end date must be after start time!')
          return false
        }
      }
    }

    return true
  }

  // ------------------------
  // SAVE
  // ------------------------
  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)

    try {
      await api.put(`/schedule/${id}`, {
        title,
        description,
        start_time: startTime,
        end_time: endTime,
        passcode,
        max_participants: maxParticipants,
        enable_recording: enableRecording,
        enable_waiting_room: enableWaitingRoom,
        recurrence_type: recurrenceType,
        recurrence_interval: recurrenceInterval,
        recurrence_days: recurrenceDays.join(','),
        end_date: recurrenceEndDate || null,
      })

      alert('Meeting updated!')
      router.push('/schedule')

    } catch (err) {
      console.error(err)
      alert('Update failed')
    } finally {
      setSaving(false)
    }
  }

  // ---- UI ----
  if (loading) {
    return (
      <MainLayout>
        <div className="text-center py-16 text-gray-500">Loading meeting...</div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-200">

        <h1 className="text-2xl font-bold mb-6">Edit Meeting</h1>

        {/* TITLE */}
        <label className="block mb-4">
          <span className="font-medium">Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full mt-1 p-3 border rounded-lg"
          />
        </label>

        {/* DESCRIPTION */}
        <label className="block mb-4">
          <span className="font-medium">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full mt-1 p-3 border rounded-lg"
            rows={3}
          />
        </label>

        {/* DATETIME */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <label>
            <span className="font-medium">Start Time</span>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full mt-1 p-3 border rounded-lg"
            />
          </label>

          <label>
            <span className="font-medium">End Time</span>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full mt-1 p-3 border rounded-lg"
            />
          </label>
        </div>

        {/* PASSCODE */}
        <label className="block mb-4">
          <span className="font-medium">Passcode</span>
          <input
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            className="w-full mt-1 p-3 border rounded-lg"
          />
        </label>

        {/* MAX PARTICIPANTS */}
        <label className="block mb-4">
          <span className="font-medium">Max Participants</span>
          <input
            type="number"
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(Number(e.target.value))}
            className="w-full mt-1 p-3 border rounded-lg"
          />
        </label>

        {/* TOGGLE OPTIONS */}
        <div className="space-y-3 mt-4">
          {[
            {
              label: 'Enable Recording',
              field: enableRecording,
              setter: setEnableRecording,
              icon: <Video size={18} className="text-gray-700" />,
            },
            {
              label: 'Enable Waiting Room',
              field: enableWaitingRoom,
              setter: setEnableWaitingRoom,
              icon: <Users size={18} className="text-gray-700" />,
            },
          ].map((opt) => (
            <div
              key={opt.label}
              className="flex items-center justify-between p-4 bg-gray-50 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  {opt.icon}
                </div>
                <span className="text-sm font-medium">{opt.label}</span>
              </div>

              <button
                onClick={() => opt.setter(!opt.field)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  opt.field ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform bg-white rounded-full transition-transform ${
                    opt.field ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        {/* RECURRENCE */}
        <div className="mt-6 border-t pt-4">
          <h2 className="font-semibold mb-3">Recurrence</h2>

          <label className="block mb-3">
            <span className="font-medium">Repeat</span>
            <select
              value={recurrenceType}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={(e) => setRecurrenceType(e.target.value as any)}
              className="w-full mt-1 p-3 border rounded-lg"
            >
              <option value="none">None</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </label>

          {recurrenceType === 'weekly' && (
            <div className="flex gap-2 flex-wrap mb-3">
              {WEEK_MAP.map((d, i) => (
                <label key={d} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={recurrenceDays.includes(d)}
                    onChange={() =>
                      setRecurrenceDays((prev) =>
                        prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
                      )
                    }
                  />
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]}
                </label>
              ))}
            </div>
          )}

          {recurrenceType !== 'none' && (
            <>
              <label className="block mb-3">
                <span className="font-medium">Interval</span>
                <input
                  type="number"
                  min={1}
                  value={recurrenceInterval}
                  onChange={(e) => setRecurrenceInterval(Number(e.target.value))}
                  className="w-full mt-1 p-3 border rounded-lg"
                />
              </label>

              <label className="block mb-3">
                <span className="font-medium">End Date</span>
                <input
                  type="date"
                  value={recurrenceEndDate}
                  onChange={(e) => setRecurrenceEndDate(e.target.value)}
                  className="w-full mt-1 p-3 border rounded-lg"
                />
              </label>
            </>
          )}
        </div>

        {/* ACTIONS */}
        <div className="mt-6 flex gap-3">
          <Button
            text="Save"
            text_color="text-white"
            fill_background_color="bg-blue-600"
            className="px-5 py-3"
            onClick={handleSave}
            disabled={saving}
          />

          <Button
            text="Cancel"
            fill_background_color="bg-gray-200"
            className="px-5 py-3"
            onClick={() => router.push('/schedule')}
          />
        </div>
      </div>
    </MainLayout>
  )
}
