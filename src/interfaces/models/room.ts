export interface Participant {
  id: string;
  socketId: string;
  name: string;
  avatar: string;
  isMuted: boolean;
  isVideoOn: boolean;
  isHost: boolean;
  isSpeaking: boolean;
  isScreenSharing?: boolean;
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