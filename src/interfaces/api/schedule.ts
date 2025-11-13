// interfaces/api/schedules
export interface ApiParticipant {
  id: string
  name: string
  email: string
  avatar?: string
  status: 'accepted' | 'pending' | 'declined' | 'invited'
}

export interface ApiMeeting {
  id: string
  title: string
  meeting_id: string
  description?: string
  start_time: string
  end_time: string
  duration: number
  organizer_id: string
  full_name: string
  organizer_avatar?: string
  participants?: ApiParticipant[]
  meeting_link?: string
  recurrence_type?: string
  reminder_minutes?: number
  color?: string
  status: 'scheduled' | 'cancelled' | 'completed'
}

export interface ScheduleApiResponse {
  success: boolean
  data: ApiMeeting[]
}
