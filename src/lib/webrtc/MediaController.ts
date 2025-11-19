// lib/webrtc/MediaController.ts
export class MediaController {
  private stream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;

  async init(): Promise<MediaStream | null> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      return this.stream;
    } catch (error) {
      console.error('Failed to get media stream:', error);
      return null;
    }
  }

  async shareScreen(): Promise<MediaStream | null> {
    try {
      console.log('🖥️ Requesting screen share...');
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          displaySurface: 'monitor', // or 'window', 'application'
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
        audio: false,
      });
      
      console.log('✅ Got screen stream:', {
        id: this.screenStream.id,
        tracks: this.screenStream.getTracks().map(t => ({
          kind: t.kind,
          enabled: t.enabled,
          readyState: t.readyState,
          label: t.label,
          settings: t.getSettings()
        }))
      });
      
      return this.screenStream;
    } catch (error) {
      console.error('❌ Failed to share screen:', error);
      return null;
    }
  }

  toggleAudio(): boolean {
    if (!this.stream) return false;
    const audioTrack = this.stream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      return audioTrack.enabled;
    }
    return false;
  }

  toggleVideo(): boolean {
    if (!this.stream) return false;
    const videoTrack = this.stream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      return videoTrack.enabled;
    }
    return false;
  }

  stopAll(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((track) => track.stop());
      this.screenStream = null;
    }
  }

  getStream(): MediaStream | null {
    return this.stream;
  }

  getScreenStream(): MediaStream | null {
    return this.screenStream;
  }
}