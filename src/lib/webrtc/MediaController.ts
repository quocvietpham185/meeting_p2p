export class MediaController {
  private stream: MediaStream | null = null;

  /** Khởi tạo mic + camera */
  async init(): Promise<MediaStream> {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    return this.stream;
  }

  getStream(): MediaStream | null {
    return this.stream;
  }

  /** Bật / tắt micro, trả về trạng thái hiện tại */
  toggleAudio(): boolean {
    if (!this.stream) return false;
    const track = this.stream.getAudioTracks()[0];
    if (track) track.enabled = !track.enabled;
    return track?.enabled ?? false;
  }

  /** Bật / tắt camera, trả về trạng thái hiện tại */
  toggleVideo(): boolean {
    if (!this.stream) return false;
    const track = this.stream.getVideoTracks()[0];
    if (track) track.enabled = !track.enabled;
    return track?.enabled ?? false;
  }

  /** Chia sẻ màn hình (screen sharing) */
  async shareScreen(): Promise<MediaStream | null> {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      return screenStream;
    } catch (err) {
      console.warn('Người dùng hủy chia sẻ màn hình:', err);
      return null;
    }
  }

  /** Dừng toàn bộ track */
  stopAll(): void {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
  }
}
