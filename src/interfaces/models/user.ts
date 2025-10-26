export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  avatar: string;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
}

export interface ConnectedAccount {
  id: string;
  provider: string;
  email: string;
  isConnected: boolean;
}

export interface Preferences {
  theme: 'light' | 'dark' | 'system';
  defaultCamera: string;
  defaultMicrophone: string;
}
