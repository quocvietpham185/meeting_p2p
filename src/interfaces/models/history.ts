// src/interfaces/models/history.ts

export interface MeetingHistory {
  id: string;
  title: string;
  meetingId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  participants: Participant[];
  participantCount: number;
  organizer: {
    id: string;
    name: string;
    avatar: string;
  };
  isRecorded: boolean;
  recordingUrl?: string;
  recordingSize?: string;
  transcriptAvailable: boolean;
  status: 'completed' | 'cancelled' | 'no-show';
  tags?: string[];
}

export interface Participant {
  id: string;
  name: string;
  avatar: string;
  joinTime?: string;
  leaveTime?: string;
}

export interface HistoryFilters {
  dateRange: 'all' | 'today' | 'week' | 'month' | 'custom';
  startDate?: string;
  endDate?: string;
  recorded: 'all' | 'yes' | 'no';
  searchQuery: string;
}
