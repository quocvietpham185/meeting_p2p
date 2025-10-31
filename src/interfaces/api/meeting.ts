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
}
