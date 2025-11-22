export interface UserProfile {
  id: string;
  fullName:string,
  email: string;
  avatar: string;
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
