// lib/webrtc/PeerManager.ts
import { socket } from '../socket'

export interface PeerEvents {
  onLocalStream?: (stream: MediaStream) => void
  onRemoteStream?: (socketId: string, stream: MediaStream) => void
  onPeerDisconnected?: (socketId: string) => void
}

export class PeerManager {
  private peers: Map<string, RTCPeerConnection> = new Map()
  private localStream: MediaStream | null = null
  private cameraStream: MediaStream | null = null
  private screenStream: MediaStream | null = null

  constructor(
    private readonly iceServers: RTCIceServer[],
    private readonly events: PeerEvents = {}
  ) {}

  /** Init camera+mic and set cameraStream */
  async initLocalStream(): Promise<MediaStream> {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    })
    this.cameraStream = stream
    this.updateLocalStream(stream)
    return stream
  }

  /**
   * Update local stream (camera or screen). This will:
   * - set this.localStream
   * - call onLocalStream callback
   * - replace existing senders' tracks where possible
   */
  public updateLocalStream(stream: MediaStream) {
    this.localStream = stream

    // keep cameraStream if we don't have one yet and this stream contains camera
    if (!this.cameraStream && stream.getVideoTracks().length > 0) {
      this.cameraStream = stream
    }

    // If this stream looks like screen (only video and maybe no audio), keep as screenStream
    // Heuristic: if it has video track but no audio track OR one track labelled like "Screen",
    // we can choose to set screenStream — but we don't override cameraStream here.
    const hasAudio = stream.getAudioTracks().length > 0
    const hasVideo = stream.getVideoTracks().length > 0
    if (hasVideo && !hasAudio) {
      // likely a screen stream (displayMedia often has no audio)
      this.screenStream = stream
    }

    this.events.onLocalStream?.(stream)

    // Replace tracks on existing peer connections (prefer replaceTrack)
    this.peers.forEach((pc) => {
      const senders = pc.getSenders()

      // Audio
      const audioTrack = stream.getAudioTracks()[0]
      if (audioTrack) {
        const audioSender = senders.find((s) => s.track?.kind === 'audio')
        if (audioSender) audioSender.replaceTrack(audioTrack).catch((e) => {
          console.warn('replaceTrack audio failed', e)
        })
        else pc.addTrack(audioTrack, stream)
      }

      // Video
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        const videoSender = senders.find((s) => s.track?.kind === 'video')
        if (videoSender) {
          videoSender.replaceTrack(videoTrack).catch((e) => {
            console.warn('replaceTrack video failed', e)
          })
        } else {
          try {
            pc.addTrack(videoTrack, stream)
          } catch (e) {
            console.warn('pc.addTrack fallback failed', e)
          }
        }
      }
    })
  }

  /** Create or return existing RTCPeerConnection for socketId */
  async createPeerConnection(socketId: string): Promise<RTCPeerConnection> {
    let pc = this.peers.get(socketId)
    if (pc) return pc

    pc = new RTCPeerConnection({ iceServers: this.iceServers })
    this.peers.set(socketId, pc)

    // If we already have a localStream, add its tracks (initial attach)
    if (this.localStream) {
      try {
        this.localStream.getTracks().forEach((t) => pc!.addTrack(t, this.localStream!))
      } catch (e) {
        // ignore addTrack errors
        console.warn('addTrack initial failed', e)
      }
    }

    // Auto-negotiation handler (ensure offer is created when needed)
    pc.onnegotiationneeded = async () => {
      try {
        console.log('📡 onnegotiationneeded -> creating offer for', socketId)
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        socket.emit('signal-offer', { to: socketId, from: socket.id, sdp: offer })
      } catch (err) {
        console.warn('❌ negotiationneeded error for', socketId, err)
      }
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('signal-candidate', {
          to: socketId,
          from: socket.id,
          candidate: event.candidate,
        })
      }
    }

    pc.ontrack = (event) => {
      const [stream] = event.streams
      if (stream) {
        this.events.onRemoteStream?.(socketId, stream)
      }
    }

    pc.onconnectionstatechange = () => {
      if (pc?.connectionState === 'disconnected' || pc?.connectionState === 'failed') {
        this.events.onPeerDisconnected?.(socketId)
        try {
          pc.close()
        } catch {}
        this.peers.delete(socketId)
      }
    }

    return pc
  }

  /** Create offer to peer */
  async createOffer(socketId: string): Promise<void> {
    const pc = await this.createPeerConnection(socketId)
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    socket.emit('signal-offer', { to: socketId, from: socket.id, sdp: offer })
  }

  /** Handle incoming offer (answer locally and send answer) */
  async handleOffer(from: string, sdp: RTCSessionDescriptionInit): Promise<void> {
    const pc = await this.createPeerConnection(from)
    await pc.setRemoteDescription(new RTCSessionDescription(sdp))
    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)
    socket.emit('signal-answer', { to: from, from: socket.id, sdp: answer })
  }

  /** Handle incoming answer */
  async handleAnswer(from: string, sdp: RTCSessionDescriptionInit): Promise<void> {
    const pc = this.peers.get(from)
    if (pc) {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp))
      } catch (e) {
        console.warn('setRemoteDescription(answer) failed', e)
      }
    }
  }

  /** Handle incoming ICE candidate */
  async handleCandidate(from: string, candidate: RTCIceCandidateInit): Promise<void> {
    const pc = this.peers.get(from)
    if (pc && candidate) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate))
      } catch (e) {
        console.warn('addIceCandidate failed', e)
      }
    }
  }

  toggleAudio(): boolean {
    if (!this.localStream) return false
    const audio = this.localStream.getAudioTracks()[0]
    if (audio) audio.enabled = !audio.enabled
    return audio?.enabled ?? false
  }

  toggleVideo(): boolean {
    if (!this.localStream) return false
    const video = this.localStream.getVideoTracks()[0]
    if (video) video.enabled = !video.enabled
    return video?.enabled ?? false
  }

  /**
   * Replace the current outgoing video track (used for screen sharing).
   * - newTrack: MediaStreamTrack from screen (or camera) to be used as outgoing video
   */
  public async replaceVideoTrack(newTrack: MediaStreamTrack) {
    console.log('🔄 replaceVideoTrack called:', {
      label: newTrack.label,
      kind: newTrack.kind,
      enabled: newTrack.enabled,
    })

    // Ensure localStream exists (create container if needed)
    if (!this.localStream) this.localStream = new MediaStream()

    // store screenStream (so we can restore camera later)
    // If newTrack came from displayMedia (no audio), we store as screenStream
    this.screenStream = new MediaStream([newTrack])

    // remove old video tracks from localStream
    const oldVideoTracks = this.localStream.getVideoTracks()
    oldVideoTracks.forEach((t) => {
      try {
        this.localStream!.removeTrack(t)
      } catch {}
    })

    // add the new track
    try {
      this.localStream.addTrack(newTrack)
    } catch (e) {
      console.warn('localStream.addTrack failed', e)
    }

    // notify UI
    this.events.onLocalStream?.(this.localStream)

    // Replace sender track for each peer; then ensure renegotiation
    for (const [socketId, pc] of this.peers.entries()) {
      try {
        const sender = pc.getSenders().find((s) => s.track?.kind === 'video')
        if (sender) {
          await sender.replaceTrack(newTrack)
          console.log('🔁 replaced sender track for', socketId)
        } else {
          pc.addTrack(newTrack, this.localStream)
        }

        // create offer to renegotiate (some browsers need explicit offer)
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        socket.emit('signal-offer', { to: socketId, from: socket.id, sdp: offer })
      } catch (err) {
        console.warn('❌ Error replacing track / renegotiating for', socketId, err)
      }
    }
  }

  /** Get camera stream (useful for local sidebar while screen-sharing) */
  getCameraStream(): MediaStream | null {
    return this.cameraStream
  }

  /** Restore camera (call when stopping screen share): provide cameraTrack to replace */
  public async restoreCameraTrack(cameraTrack: MediaStreamTrack) {
    if (!this.localStream) this.localStream = new MediaStream()
    // remove current video tracks
    this.localStream.getVideoTracks().forEach((t) => {
      try {
        this.localStream!.removeTrack(t)
      } catch {}
    })
    this.localStream.addTrack(cameraTrack)
    this.events.onLocalStream?.(this.localStream)

    // Replace on peers and renegotiate
    for (const [socketId, pc] of this.peers.entries()) {
      try {
        const sender = pc.getSenders().find((s) => s.track?.kind === 'video')
        if (sender) await sender.replaceTrack(cameraTrack)
        else pc.addTrack(cameraTrack, this.localStream)

        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        socket.emit('signal-offer', { to: socketId, from: socket.id, sdp: offer })
      } catch (e) {
        console.warn('restoreCameraTrack failed for', socketId, e)
      }
    }
  }

  cleanup(): void {
    this.localStream?.getTracks().forEach((t) => t.stop())
    this.cameraStream?.getTracks().forEach((t) => t.stop())
    this.screenStream?.getTracks().forEach((t) => t.stop())
    this.peers.forEach((pc) => {
      try {
        pc.close()
      } catch {}
    })
    this.peers.clear()
  }
}
