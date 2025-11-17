import { socket } from "../socket";

export interface PeerEvents {
  onLocalStream?: (stream: MediaStream) => void;
  onRemoteStream?: (socketId: string, stream: MediaStream) => void;
  onPeerDisconnected?: (socketId: string) => void;
}

export class PeerManager {
  private peers: Map<string, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;

  constructor(
    private readonly iceServers: RTCIceServer[],
    private readonly events: PeerEvents
  ) {}

  async initLocalStream(): Promise<MediaStream> {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    this.attachLocalStream(stream);
    return stream;
  }

  attachLocalStream(stream: MediaStream): void {
    this.localStream = stream;
    this.events.onLocalStream?.(stream);
    // Attach tracks to any existing peer connections
    this.peers.forEach((pc) => {
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    });
  }

  async createPeerConnection(socketId: string): Promise<RTCPeerConnection> {
    let pc = this.peers.get(socketId);
    if (!pc) {
      pc = new RTCPeerConnection({ iceServers: this.iceServers });
      this.peers.set(socketId, pc);

      if (this.localStream) {
        this.localStream.getTracks().forEach((track) =>
          pc!.addTrack(track, this.localStream!)
        );
      }

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("signal-candidate", {
            to: socketId,
            from: socket.id,
            candidate: event.candidate,
          });
        }
      };

      pc.ontrack = (event) => {
        const [stream] = event.streams;
        this.events.onRemoteStream?.(socketId, stream);
      };

      pc.onconnectionstatechange = () => {
        if (pc?.connectionState === "disconnected") {
          this.events.onPeerDisconnected?.(socketId);
          pc.close();
          this.peers.delete(socketId);
        }
      };
    }
    return pc;
  }

  async createOffer(socketId: string): Promise<void> {
    const pc = await this.createPeerConnection(socketId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit("signal-offer", { to: socketId, from: socket.id, sdp: offer });
  }

  async handleOffer(from: string, sdp: RTCSessionDescriptionInit): Promise<void> {
    const pc = await this.createPeerConnection(from);
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit("signal-answer", { to: from, from: socket.id, sdp: answer });
  }

  async handleAnswer(from: string, sdp: RTCSessionDescriptionInit): Promise<void> {
    const pc = this.peers.get(from);
    if (pc) await pc.setRemoteDescription(new RTCSessionDescription(sdp));
  }

  async handleCandidate(from: string, candidate: RTCIceCandidateInit): Promise<void> {
    const pc = this.peers.get(from);
    if (pc && candidate) await pc.addIceCandidate(new RTCIceCandidate(candidate));
  }

  toggleAudio(): boolean {
    if (!this.localStream) return false;
    const [track] = this.localStream.getAudioTracks();
    if (track) track.enabled = !track.enabled;
    return track?.enabled ?? false;
  }

  toggleVideo(): boolean {
    if (!this.localStream) return false;
    const [track] = this.localStream.getVideoTracks();
    if (track) track.enabled = !track.enabled;
    return track?.enabled ?? false;
  }

  replaceVideoTrack(track: MediaStreamTrack): void {
    this.peers.forEach((pc) => {
      const sender = pc
        .getSenders()
        .find((s) => s.track && s.track.kind === "video");
      sender?.replaceTrack(track);
    });
  }

  cleanup(): void {
    this.localStream?.getTracks().forEach((t) => t.stop());
    this.peers.forEach((pc) => pc.close());
    this.peers.clear();
  }
}
