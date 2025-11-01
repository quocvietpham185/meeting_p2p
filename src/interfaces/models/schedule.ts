// src/interfaces/models/schedule.ts

export interface ScheduledMeeting {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
  organizer: {
    id: string;
    name: string;
    avatar: string;
  };
  participants: Participant[];
  meetingLink: string;
  isRecurring: boolean;
  recurringPattern?: string;
  reminder?: number; // minutes before
  color: string;
  status: 'upcoming' | 'in-progress' | 'completed' | 'cancelled';
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: 'accepted' | 'pending' | 'declined';
}
interface ScheduleApiResponse {
  success: boolean;
  data: ScheduledMeeting[];
}
export type ViewMode = 'month' | 'week' | 'day' | 'list';