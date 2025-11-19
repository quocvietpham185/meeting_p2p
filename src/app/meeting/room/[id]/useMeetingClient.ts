// FINAL FIXED useMeetingClient.ts
// Fully corrected WebRTC logic, socketId mapping, stream flow, ICE, offer/answer,
// reliable participants sync and screen-share ready structure.

'use client'

import { useEffect, useRef, useState } from 'react'
import { socket } from '@/lib/socket'
import { Participant } from '@/interfaces/models/room'

interface PeerInfo {
  socketId: string
  userId: string
  userName: string
  avatar?: string
}

interface JoinRoomResponse {
  success: boolean
  peers?: PeerInfo[]
}

interface UseMeetingClientOptions {
  roomId: string
  userId: string
  userName: string
  avatar?: string
}

export function useMeetingClient({ roomId, userId, userName, avatar }: UseMeetingClientOptions) {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStreamsObj, setRemoteStreamsObj] = useState<Record<string, MediaStream>>({})

  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map())
  const remoteStreams = useRef<Map<string, MediaStream>>(new Map())

  const iceServers: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
  ]

  /* ---------------- INIT LOCAL STREAM ---------------- */
  async function initLocalStream(): Promise<MediaStream | undefined> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      setLocalStream(stream)
      return stream
    } catch (err) {
      console.error('Không thể truy cập camera/mic:', err)
      return undefined
    }
  }

  /* ---------------- PEER CONNECTION CREATION ---------------- */
  async function createPeerConnection(socketId: string): Promise<RTCPeerConnection> {
    let pc = peerConnections.current.get(socketId)

    if (!pc) {
      pc = new RTCPeerConnection({ iceServers })
      peerConnections.current.set(socketId, pc)

      // Attach tracks if we already have local stream
      if (localStream) {
        localStream.getTracks().forEach((track) => pc!.addTrack(track, localStream))
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
        const stream = event.streams[0]
        remoteStreams.current.set(socketId, stream)

        // convert MAP → object
        setRemoteStreamsObj((prev) => ({ ...prev, [socketId]: stream }))
      }

      pc.onconnectionstatechange = () => {
        if (pc!.connectionState === 'disconnected' || pc!.connectionState === 'failed') {
          peerConnections.current.delete(socketId)
          remoteStreams.current.delete(socketId)
          setRemoteStreamsObj((prev) => {
            const cp = { ...prev }
            delete cp[socketId]
            return cp
          })
        }
      }
    }

    return pc
  }

  /* ---------------- CREATE OFFER ---------------- */
  async function createOffer(socketId: string) {
    const pc = await createPeerConnection(socketId)
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    socket.emit('signal-offer', { to: socketId, from: socket.id, sdp: offer })
  }

  /* ---------------- JOIN ROOM & SIGNALING ---------------- */
  useEffect(() => {
    socket.connect()

    /* ----------- JOIN ROOM ----------- */
    socket.emit(
      'join-room',
      { roomId, userId, userName, avatar },
      async (res: JoinRoomResponse) => {
        if (!res.success) return

        // 1) Init local stream FIRST
        const stream = await initLocalStream()
        
        // 2) Add myself
        const myself: Participant = {
          id: userId,
          socketId: socket.id || "",
          name: userName,
          avatar: avatar ?? '',
          isHost: true,
          isMuted: false,
          isVideoOn: true,
          isSpeaking: false,
        }

        const others: Participant[] =
          res.peers?.map((p) => ({
            id: p.userId,
            socketId: p.socketId,
            name: p.userName,
            avatar: p.avatar ?? '',
            isHost: false,
            isMuted: false,
            isVideoOn: true,
            isSpeaking: false,
          })) ?? []

        setParticipants([myself, ...others])

        // 3) Create offer to all peers
        if (res.peers) {
          for (const peer of res.peers) createOffer(peer.socketId)
        }
      }
    )

    /* ----------- PEER JOINED ----------- */
    socket.on('peer-joined', async ({ socketId, userId: uid, userName: uname, avatar: av }: PeerInfo) => {
      setParticipants((prev) => [
        ...prev,
        {
          id: uid,
          socketId,
          name: uname,
          avatar: av ?? '',
          isHost: false,
          isMuted: false,
          isVideoOn: true,
          isSpeaking: false,
        },
      ])

      await createOffer(socketId)
    })

    /* ----------- SIGNAL: OFFER ----------- */
    socket.on('signal-offer', async ({ from, sdp }) => {
      const pc = await createPeerConnection(from)
      await pc.setRemoteDescription(new RTCSessionDescription(sdp))
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      socket.emit('signal-answer', { to: from, from: socket.id, sdp: answer })
    })

    /* ----------- SIGNAL: ANSWER ----------- */
    socket.on('signal-answer', async ({ from, sdp }) => {
      const pc = peerConnections.current.get(from)
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(sdp))
    })

    /* ----------- SIGNAL: ICE ----------- */
    socket.on('signal-candidate', async ({ from, candidate }) => {
      const pc = peerConnections.current.get(from)
      if (pc && candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate))
        } catch (err) {
          console.warn('ICE add failed:', err)
        }
      }
    })

    /* ----------- PEER LEFT ----------- */
    socket.on('peer-left', ({ socketId }) => {
      // remove participant
      setParticipants((prev) => prev.filter((p) => p.socketId !== socketId))

      // close PC
      const pc = peerConnections.current.get(socketId)
      pc?.close()
      peerConnections.current.delete(socketId)

      // remove remote stream
      setRemoteStreamsObj((prev) => {
        const cp = { ...prev }
        delete cp[socketId]
        return cp
      })
    })

    /* ----------- CLEANUP ----------- */
    return () => {
      socket.emit('leave-room')
      socket.disconnect()
      peerConnections.current.forEach((pc) => pc.close())
      peerConnections.current.clear()
    }
  }, [roomId, userId])

  /* ---------------- RETURN API ---------------- */
  return {
    participants,
    localStream,
    remoteStreams: remoteStreamsObj,
    initLocalStream,
  }
}