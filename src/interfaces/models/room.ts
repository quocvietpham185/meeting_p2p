export interface Participant {
  id: string;
  name: string;
  avatar: string;
  isMuted: boolean;
  isVideoOn: boolean;
  isHost: boolean;
  isSpeaking: boolean;
}

export interface ChatMessage {
  id: string;
  userId: string;
  roomId: string;
  userName: string;
  userAvatar: string;
  message: string;
  timestamp: string;
}

export interface RoomSettings {
  roomId: string;
  roomName: string;
  isRecording: boolean;
  startTime: string;
}