export interface User {
  id: string;
  name: string;
  avatar: string;
}

export interface Meeting {
  id: string;
  title: string;
  meetingId: string;
  organizer: User;
  participants: number;
  timeRemaining?: string;
  startTime?: string;
  endTime?: string;
}

export interface UpcomingMeeting {
  id: string;
  title: string;
  time: string;
  participants: User[];
  status: 'today' | 'tomorrow';
}

export interface Stats {
  totalMeetings: number;
  avgDuration: string;
  roomsCreated: number;
}