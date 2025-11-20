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
      console.log('✅ Camera and mic initialized');
      return this.stream;
    } catch (error) {
      const err = error as Error;
      console.warn('⚠️ Camera/mic permission denied:', err.message);
      
      // Try audio only
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true,
        });
        console.log('✅ Audio-only initialized');
        return this.stream;
      } catch (audioError) {
        console.warn('⚠️ Audio also denied');
        return null;
      }
    }
  }

  async shareScreen(): Promise<MediaStream | null> {
    try {
      console.log('🖥️ Requesting screen share...');
      
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      
      console.log('✅ Screen stream obtained:', {
        id: this.screenStream.id,
        tracks: this.screenStream.getTracks().map(t => ({
          kind: t.kind,
          label: t.label,
          enabled: t.enabled,
          readyState: t.readyState,
        }))
      });
      
      return this.screenStream;
    } catch (error) {
      const err = error as Error;
      console.error('❌ Screen share failed:', err.message);
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