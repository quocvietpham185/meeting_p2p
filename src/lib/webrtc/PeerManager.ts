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
  private screenSenders: Map<string, RTCRtpSender> = new Map()

  constructor(
    private readonly iceServers: RTCIceServer[], 
    private readonly events: PeerEvents = {}
  ) {}

  // 🔥 Create dummy audio track for connection establishment
  private createDummyAudioTrack(): MediaStreamTrack {
    const ctx = new AudioContext()
    const oscillator = ctx.createOscillator()
    const dst = ctx.createMediaStreamDestination()
    oscillator.connect(dst)
    oscillator.start()
    const track = dst.stream.getAudioTracks()[0]
    track.enabled = false // Mute it
    return track
  }

  async initLocalStream(): Promise<MediaStream | null> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      })
      this.cameraStream = stream
      this.localStream = stream
      this.events.onLocalStream?.(this.localStream)
      
      console.log('🎥 Camera initialized successfully')
      
      // Add to existing peers
      this.peers.forEach((pc, socketId) => {
        try {
          stream.getTracks().forEach((t) => pc.addTrack(t, stream))
          console.log('✅ Added camera tracks to peer:', socketId)
        } catch (err) {
          const error = err as Error
          console.warn('❌ addTrack failed for', socketId, error.message)
        }
      })
      
      return stream
    } catch (err) {
      const error = err as Error
      console.warn('⚠️ Camera not available:', error.message)
      
      // 🔥 Create dummy stream to establish connection
      const dummyAudio = this.createDummyAudioTrack()
      const dummyStream = new MediaStream([dummyAudio])
      this.localStream = dummyStream
      
      // 🔥 Add dummy track to existing peers
      this.peers.forEach((pc, socketId) => {
        try {
          pc.addTrack(dummyAudio, dummyStream)
          console.log('✅ Added dummy audio to peer:', socketId)
        } catch (err) {
          const error = err as Error
          console.warn('❌ addTrack dummy failed for', socketId, error.message)
        }
      })
      
      console.log('✅ Created dummy audio stream for connection')
      return null
    }
  }

  public updateLocalStream(stream: MediaStream) {
    this.localStream = stream

    if (!this.cameraStream && stream.getVideoTracks().length > 0) {
      this.cameraStream = stream
    }

    this.events.onLocalStream?.(stream)

    this.peers.forEach((pc, socketId) => {
      const senders = pc.getSenders()

      const audioTrack = stream.getAudioTracks()[0]
      if (audioTrack) {
        const audioSender = senders.find((s) => s.track?.kind === 'audio')
        if (audioSender) {
          audioSender.replaceTrack(audioTrack).catch((err) => {
            const error = err as Error
            console.warn('replaceTrack audio failed for', socketId, error.message)
          })
        } else {
          try {
            pc.addTrack(audioTrack, stream)
          } catch (err) {
            const error = err as Error
            console.warn('addTrack audio fallback failed for', socketId, error.message)
          }
        }
      }

      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        const videoSender = senders.find((s) => s.track?.kind === 'video')
        if (videoSender) {
          videoSender.replaceTrack(videoTrack).catch((err) => {
            const error = err as Error
            console.warn('replaceTrack video failed for', socketId, error.message)
          })
        } else {
          try {
            pc.addTrack(videoTrack, stream)
          } catch (err) {
            const error = err as Error
            console.warn('addTrack video fallback failed for', socketId, error.message)
          }
        }
      }
    })
  }

  async createPeerConnection(socketId: string): Promise<RTCPeerConnection> {
    let pc = this.peers.get(socketId)
    if (pc) {
      console.log('♻️ Reusing existing peer connection for:', socketId)
      return pc
    }

    console.log('🔧 Creating NEW peer connection for:', socketId)
    console.log('📊 Available streams:', {
      hasCameraStream: !!this.cameraStream,
      hasLocalStream: !!this.localStream,
      hasScreenStream: !!this.screenStream,
      localStreamTracks: this.localStream?.getTracks().length ?? 0,
    })
    
    pc = new RTCPeerConnection({ iceServers: this.iceServers })
    this.peers.set(socketId, pc)

    // 🔥 Always attach at least dummy audio for connection
    try {
      if (this.cameraStream) {
        console.log('📹 Attaching camera stream to new peer:', socketId)
        this.cameraStream.getTracks().forEach((t) => {
          try {
            pc!.addTrack(t, this.cameraStream!)
            console.log('✅ Added camera track:', t.kind, t.label)
          } catch (err) {
            const error = err as Error
            console.warn('❌ Failed to add camera track:', error.message)
          }
        })
      } else if (this.localStream) {
        console.log('📹 Attaching local stream (maybe dummy) to new peer:', socketId)
        this.localStream.getTracks().forEach((t) => {
          try {
            pc!.addTrack(t, this.localStream!)
            console.log('✅ Added local track:', t.kind, t.label)
          } catch (err) {
            const error = err as Error
            console.warn('❌ Failed to add local track:', error.message)
          }
        })
      } else {
        console.error('❌❌❌ NO STREAMS AVAILABLE! Connection will fail!')
      }

      if (this.screenStream) {
        console.log('🖥️ Attaching screen stream to new peer:', socketId)
        const screenTrack = this.screenStream.getVideoTracks()[0]
        if (screenTrack) {
          try {
            const sender = pc.addTrack(screenTrack, this.screenStream)
            this.screenSenders.set(socketId, sender)
            console.log('✅ Added screen track')
          } catch (err) {
            const error = err as Error
            console.warn('❌ addTrack screen failed for', socketId, error.message)
          }
        }
      }
    } catch (err) {
      const error = err as Error
      console.warn('❌ initial addTrack error for new pc', socketId, error.message)
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('signal-candidate', { 
          to: socketId, 
          from: socket.id, 
          candidate: event.candidate 
        })
      }
    }

    pc.ontrack = (event) => {
      console.log('🎉 ontrack fired for:', socketId, {
        streams: event.streams.length,
        track: event.track.kind,
        trackLabel: event.track.label,
        trackId: event.track.id,
      })
      
      const [stream] = event.streams
      if (stream) {
        console.log('📺 Stream received:', {
          id: stream.id,
          audioTracks: stream.getAudioTracks().length,
          videoTracks: stream.getVideoTracks().length,
          videoLabel: stream.getVideoTracks()[0]?.label,
        })
        this.events.onRemoteStream?.(socketId, stream)
      }
    }

    pc.onconnectionstatechange = () => {
      console.log('🔌 Connection state for', socketId, ':', pc?.connectionState)
      if (pc && (pc.connectionState === 'disconnected' || pc.connectionState === 'failed')) {
        console.log('❌ Peer disconnected:', socketId)
        this.events.onPeerDisconnected?.(socketId)
        try {
          pc.close()
        } catch (err) {
          // Ignore
        }
        this.peers.delete(socketId)
        this.screenSenders.delete(socketId)
      }
    }

    pc.oniceconnectionstatechange = () => {
      console.log('🧊 ICE state for', socketId, ':', pc?.iceConnectionState)
    }

    return pc
  }

  async createOffer(socketId: string): Promise<void> {
    console.log('📤 createOffer for:', socketId)
    const pc = await this.createPeerConnection(socketId)
    
    const senders = pc.getSenders()
    console.log('📊 Current senders:', senders.map(s => ({
      kind: s.track?.kind,
      label: s.track?.label,
      enabled: s.track?.enabled,
    })))
    
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    
    console.log('📤 Offer created, sending to:', socketId)
    socket.emit('signal-offer', { to: socketId, from: socket.id, sdp: offer })
  }

  async handleOffer(from: string, sdp: RTCSessionDescriptionInit): Promise<void> {
    console.log('📥 handleOffer from:', from)
    const pc = await this.createPeerConnection(from)
    
    await pc.setRemoteDescription(new RTCSessionDescription(sdp))
    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)
    
    console.log('📤 Sending answer to:', from)
    socket.emit('signal-answer', { to: from, from: socket.id, sdp: answer })
  }

  async handleAnswer(from: string, sdp: RTCSessionDescriptionInit): Promise<void> {
    console.log('📥 handleAnswer from:', from)
    const pc = this.peers.get(from)
    if (pc) {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp))
        console.log('✅ Answer set for:', from)
      } catch (err) {
        const error = err as Error
        console.warn('❌ setRemoteDescription failed', error.message)
      }
    }
  }

  async handleCandidate(from: string, candidate: RTCIceCandidateInit): Promise<void> {
    const pc = this.peers.get(from)
    if (pc && candidate) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate))
        console.log('✅ ICE candidate added for:', from)
      } catch (err) {
        const error = err as Error
        console.warn('❌ addIceCandidate failed', error.message)
      }
    }
  }

  toggleAudio(): boolean {
    if (!this.cameraStream) return false
    const audio = this.cameraStream.getAudioTracks()[0]
    if (audio) audio.enabled = !audio.enabled
    return audio?.enabled ?? false
  }

  toggleVideo(): boolean {
    if (!this.cameraStream) return false
    const video = this.cameraStream.getVideoTracks()[0]
    if (video) video.enabled = !video.enabled
    return video?.enabled ?? false
  }

public async addScreenStream(screenStream: MediaStream): Promise<void> {
  this.screenStream = screenStream;

  const screenTrack = screenStream.getVideoTracks()[0];
  if (!screenTrack) return;

  for (const [socketId, pc] of this.peers.entries()) {
    const videoSender = pc.getSenders().find(s => s.track?.kind === "video");

    if (videoSender) {
      console.log("🔄 replace camera → screen for peer:", socketId);
      await videoSender.replaceTrack(screenTrack);
      this.screenSenders.set(socketId, videoSender);
    }
  }

  // Local UI preview cho màn hình
  this.events.onLocalStream?.(screenStream);
}



  public async removeScreenStream(): Promise<void> {
  const cameraTrack = this.cameraStream?.getVideoTracks()[0];

  for (const [socketId, pc] of this.peers.entries()) {
    const sender = this.screenSenders.get(socketId);

    if (sender && cameraTrack) {
      console.log("🔄 restore screen → camera for peer:", socketId);
      await sender.replaceTrack(cameraTrack);
    }
  }

  this.screenStream = null;
  this.events.onLocalStream?.(this.cameraStream!);
}


  public getCameraStream(): MediaStream | null {
    return this.cameraStream
  }

  cleanup(): void {
    console.log('🧹 Cleanup - closing', this.peers.size, 'peers')
    try {
      this.localStream?.getTracks().forEach((t) => t.stop())
      this.cameraStream?.getTracks().forEach((t) => t.stop())
      this.screenStream?.getTracks().forEach((t) => t.stop())
    } catch (err) {
      // Ignore
    }

    this.peers.forEach((pc) => {
      try {
        pc.close()
      } catch (err) {
        // Ignore
      }
    })
    this.peers.clear()
    this.screenSenders.clear()
  }
}