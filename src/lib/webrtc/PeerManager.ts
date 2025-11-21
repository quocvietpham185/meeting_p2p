// lib/webrtc/PeerManager.ts
import { socket } from '@/lib/socket'

export interface PeerEvents {
  onLocalCameraStream?: (stream: MediaStream) => void
  onLocalScreenStream?: (stream: MediaStream | null) => void
  onRemoteCameraStream?: (socketId: string, stream: MediaStream) => void
  onRemoteScreenStream?: (socketId: string, stream: MediaStream) => void
  onPeerDisconnected?: (socketId: string) => void
}

export class PeerManager {
  private peers = new Map<string, RTCPeerConnection>()
  private screenSenders = new Map<string, RTCRtpSender>()

  private cameraStream: MediaStream | null = null
  private screenStream: MediaStream | null = null

  // socketId đang share (do app-level signaling cập nhật)
  private currentSharingSocketId: string | null = null

  constructor(private readonly iceServers: RTCIceServer[], private readonly events: PeerEvents = {}) {}

  /* ---------- helper: đợi signaling stable ---------- */
  private waitForStable(pc: RTCPeerConnection, timeout = 2500): Promise<void> {
    if (pc.signalingState === 'stable') return Promise.resolve()
    return new Promise((resolve) => {
      const handler = () => {
        if (pc.signalingState === 'stable') {
          pc.removeEventListener('signalingstatechange', handler)
          resolve()
        }
      }
      pc.addEventListener('signalingstatechange', handler)
      setTimeout(() => {
        pc.removeEventListener('signalingstatechange', handler)
        resolve()
      }, timeout)
    })
  }

  /* =========================================================
     INIT CAMERA (user gesture)
  ========================================================= */
  async initCameraStream(): Promise<MediaStream | null> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      this.cameraStream = stream
      this.events.onLocalCameraStream?.(stream)
      console.log('🎥 Camera initialized:', stream.id)

      // push tracks to existing peers
      for (const [sid, pc] of this.peers.entries()) {
        try {
          stream.getTracks().forEach((t) => pc.addTrack(t, stream))
          console.log('➕ add camera tracks to', sid)
        } catch (err) {
          console.warn('addTrack camera failed for', sid, err)
        }
      }

      return stream
    } catch (err) {
      console.warn('❌ initCameraStream failed', err)
      return null
    }
  }

  /* =========================================================
     CREATE / REUSE PEER CONNECTION
  ========================================================= */
  async createPeerConnection(socketId: string): Promise<RTCPeerConnection> {
    let pc = this.peers.get(socketId)
    if (pc) {
      // reuse
      return pc
    }

    pc = new RTCPeerConnection({ iceServers: this.iceServers })
    this.peers.set(socketId, pc)

    // attach camera if available
    if (this.cameraStream) {
      for (const t of this.cameraStream.getTracks()) {
        try {
          pc.addTrack(t, this.cameraStream)
        } catch (err) {
          console.warn('addTrack(camera) failed for', socketId, err)
        }
      }
    }

    // 🔥 FIX: ADD screen track as ADDITIONAL track (không replace)
    if (this.screenStream) {
      const screenTrack = this.screenStream.getVideoTracks()[0]
      if (screenTrack) {
        try {
          const sender = pc.addTrack(screenTrack, this.screenStream)
          this.screenSenders.set(socketId, sender)
          console.log('➕ added screen track for', socketId)
        } catch (err) {
          console.warn('addTrack(screen) failed for', socketId, err)
        }
      }
    }

    // ICE
    pc.onicecandidate = (ev) => {
      if (ev.candidate) {
        socket.emit('signal-candidate', { to: socketId, from: socket.id, candidate: ev.candidate })
      }
    }

    // track
    pc.ontrack = (ev) => {
      // Prefer streams[0], fallback create from tracks
      let stream: MediaStream | null = null
      if (ev.streams && ev.streams.length > 0) stream = ev.streams[0]
      else if (ev.track) stream = new MediaStream([ev.track])

      if (!stream) {
        console.warn('⚠ ontrack but no stream/track for', socketId)
        return
      }

      // 🔥 DEBUG LOG
      console.log('🎬 ontrack received', {
        socketId,
        currentSharingSocketId: this.currentSharingSocketId,
        trackKind: ev.track.kind,
        trackLabel: ev.track.label,
        streamId: stream.id
      })

      // classify: nếu app-level đã báo socket này đang share, treat as screen
      const isScreen = this.currentSharingSocketId === socketId

      // Fallback: label heuristic (only for video tracks)
      if (!isScreen && ev.track.kind === 'video') {
        try {
          const vt = stream.getVideoTracks()[0]
          const lbl = vt?.label?.toLowerCase() ?? ''
          if (lbl.includes('screen') || lbl.includes('window') || 
              lbl.includes('monitor') || lbl.includes('display')) {
            console.log('✅ Detected screen share by label:', lbl)
            this.events.onRemoteScreenStream?.(socketId, stream)
            return
          }
        } catch {}
      }

      // 🔥 FINAL DECISION
      if (isScreen && ev.track.kind === 'video') {
        console.log('✅ Treating as SCREEN (app-level signal)')
        this.events.onRemoteScreenStream?.(socketId, stream)
      } else {
        console.log('✅ Treating as CAMERA')
        this.events.onRemoteCameraStream?.(socketId, stream)
      }
    }

    pc.onconnectionstatechange = () => {
      if (pc!.connectionState === 'failed' || pc!.connectionState === 'closed' || pc!.connectionState === 'disconnected') {
        this.peers.delete(socketId)
        this.screenSenders.delete(socketId)
        this.events.onPeerDisconnected?.(socketId)
      }
    }

    pc.oniceconnectionstatechange = () => {
      // optional debug
      // console.log('ICE state', socketId, pc!.iceConnectionState)
    }

    return pc
  }

  /* =========================================================
     OFFER / ANSWER
  ========================================================= */
  async createOffer(socketId: string) {
    try {
      const pc = await this.createPeerConnection(socketId)
      await this.waitForStable(pc)
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      socket.emit('signal-offer', { to: socketId, from: socket.id, sdp: offer })
    } catch (err) {
      console.warn('createOffer failed for', socketId, err)
    }
  }

  async handleOffer(from: string, offer: RTCSessionDescriptionInit) {
    try {
      const pc = await this.createPeerConnection(from)
      await pc.setRemoteDescription(new RTCSessionDescription(offer))
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      socket.emit('signal-answer', { to: from, from: socket.id, sdp: answer })
    } catch (err) {
      console.warn('handleOffer failed from', from, err)
    }
  }

  async handleAnswer(from: string, answer: RTCSessionDescriptionInit) {
    try {
      const pc = this.peers.get(from)
      if (!pc) return
      await pc.setRemoteDescription(new RTCSessionDescription(answer))
    } catch (err) {
      console.warn('handleAnswer failed for', from, err)
    }
  }

  async handleCandidate(from: string, cand: RTCIceCandidateInit) {
    try {
      const pc = this.peers.get(from)
      if (!pc) return
      await pc.addIceCandidate(new RTCIceCandidate(cand))
    } catch (err) {
      console.warn('addIceCandidate failed for', from, err)
    }
  }

  /* =========================================================
     RECLASSIFY STREAM - Fix race condition
  ========================================================= */
  reclassifyStream(socketId: string) {
    console.log('🔄 Reclassifying stream for', socketId)
    
    const pc = this.peers.get(socketId)
    if (!pc) {
      console.warn('No peer connection found for', socketId)
      return
    }
    
    const isScreen = this.currentSharingSocketId === socketId
    
    pc.getReceivers().forEach(receiver => {
      const track = receiver.track
      if (!track || track.kind !== 'video') return
      
      const stream = new MediaStream([track])
      
      console.log('🔄 Reclassifying video track', {
        socketId,
        isScreen,
        trackLabel: track.label,
        streamId: stream.id
      })
      
      if (isScreen) {
        this.events.onRemoteScreenStream?.(socketId, stream)
      } else {
        this.events.onRemoteCameraStream?.(socketId, stream)
      }
    })
  }

  /* =========================================================
     SCREEN SHARE CONTROL - GỬI THÊM track thay vì replace
  ========================================================= */
  setSharingSocketId(socketId: string | null) {
    console.log('🔧 setSharingSocketId:', socketId)
    this.currentSharingSocketId = socketId
  }

  setScreenSharingUser(socketId: string | null) {
    this.setSharingSocketId(socketId)
  }

  async addScreenStream(screen: MediaStream) {
    this.screenStream = screen
    this.events.onLocalScreenStream?.(screen)

    const screenTrack = screen.getVideoTracks()[0]
    if (!screenTrack) return

    // 🔥 FIX: ADD screen track as SEPARATE track (không replace camera)
    for (const [socketId, pc] of this.peers.entries()) {
      try {
        await this.waitForStable(pc)
        const sender = pc.addTrack(screenTrack, screen)
        this.screenSenders.set(socketId, sender)
        console.log('➕ added screen track for', socketId)
      } catch (err) {
        console.warn('addTrack(screen) failed for', socketId, err)
      }
    }
  }

  async removeScreenStream() {
    if (!this.screenStream) return

    // 🔥 FIX: REMOVE screen sender (không cần restore camera vì nó vẫn còn)
    for (const [socketId, pc] of this.peers.entries()) {
      const sender = this.screenSenders.get(socketId)
      if (!sender) continue

      try {
        await this.waitForStable(pc)
        pc.removeTrack(sender)
        console.log('🗑️ removed screen track for', socketId)
      } catch (err) {
        console.warn('removeTrack(screen) failed for', socketId, err)
      } finally {
        this.screenSenders.delete(socketId)
      }
    }

    // stop local screen tracks
    try { this.screenStream.getTracks().forEach((t) => t.stop()) } catch {}
    this.screenStream = null
    this.events.onLocalScreenStream?.(null)
  }

  /* =========================================================
     CAMERA CONTROLS
  ========================================================= */
  toggleAudio(): boolean {
    const t = this.cameraStream?.getAudioTracks()[0]
    if (!t) return false
    t.enabled = !t.enabled
    return t.enabled
  }

  toggleVideo(): boolean {
    const t = this.cameraStream?.getVideoTracks()[0]
    if (!t) return false
    t.enabled = !t.enabled
    return t.enabled
  }

  getCamera() { return this.cameraStream }
  getScreen() { return this.screenStream }

  /* =========================================================
     CLEANUP
  ========================================================= */
  cleanup() {
    // stop local streams
    try { this.cameraStream?.getTracks().forEach((t) => t.stop()) } catch {}
    try { this.screenStream?.getTracks().forEach((t) => t.stop()) } catch {}

    for (const pc of this.peers.values()) {
      try { pc.close() } catch {}
    }
    this.peers.clear()
    this.screenSenders.clear()
    this.cameraStream = null
    this.screenStream = null
    this.currentSharingSocketId = null
  }
}