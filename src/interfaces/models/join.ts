// src/interfaces/models/join.ts

export interface MeetingInfo {
  id: string;
  title: string;
  organizer: {
    name: string;
    avatar: string;
  };
  scheduledTime?: string;
  participants: number;
  isLocked: boolean;
  requiresPassword: boolean;
}

export interface JoinSettings {
  displayName: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
  password?: string;
}

export interface DeviceInfo {
  cameras: MediaDeviceInfo[];
  microphones: MediaDeviceInfo[];
  speakers: MediaDeviceInfo[];
  selectedCamera: string;
  selectedMicrophone: string;
  selectedSpeaker: string;
}