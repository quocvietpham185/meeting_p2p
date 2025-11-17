export interface MeetingCreatePayload {
  title: string;
  description?: string | null;
  meeting_id?: string | null;
  passcode?: string | null;
  start_time: string; 
  end_time: string;   
  duration: number;
  max_participants: number;
  enable_recording: boolean;
  enable_waiting_room: boolean;
  inviteEmails: string;
  recurrence_type: string,
  recurrence_interval: string, // có thể thêm select nếu muốn chỉnh khoảng cách
  recurrence_days: string,
  end_date: string | null,
}
