// src/app/meeting/room/[id]/MeetingRoomPage.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { socket } from '@/lib/socket'
import { PeerManager } from '@/lib/webrtc/PeerManager'
import { ChatManager } from '@/lib/webrtc/ChatManager'
import { MediaController } from '@/lib/webrtc/MediaController'
import { ChatMessage, Participant } from '@/interfaces/models/room'
import VideoGrid from './VideoGrid'
import ChatPanel from './ChatPanel'
import ControlBar from './ControlBar'
import ParticipantsPanel from './ParticipantsPanel'
import api from '@/lib/api'

interface PeerInfo {
  socketId: string
  userId: string
  userName: string
  avatar?: string
}

interface ScreenShareState {
  userId: string
  socketId: string
  userName: string
}

interface JoinRoomAck {
  success: boolean
  peers: PeerInfo[]
  messages?: ChatMessage[]
  screenSharing?: ScreenShareState | null
}

interface SignalData {
  from: string
  to?: string
  sdp?: RTCSessionDescriptionInit
  candidate?: RTCIceCandidateInit
}

export default function MeetingRoomPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const meetingCode = params.id

  const [realRoomId, setRealRoomId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [popup, setPopup] = useState<{
    type: 'join' | 'leave'
    name: string
  } | null>(null)

  const [currentUser, setCurrentUser] = useState<{
    id: string
    name: string
    avatar: string
  } | null>(null)

  const [participants, setParticipants] = useState<Participant[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  
  const [remoteCameraStreams, setRemoteCameraStreams] = useState<Record<string, MediaStream>>({})
  const [remoteScreenStreams, setRemoteScreenStreams] = useState<Record<string, MediaStream>>({})

  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isScreenShare, setIsScreenShare] = useState(false)

  const [showChat, setShowChat] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)

  const [hostId, setHostId] = useState<string | null>(null)

  const mediaControllerRef = useRef<MediaController | null>(null)
  const peerManagerRef = useRef<PeerManager | null>(null)
  const cameraStreamRef = useRef<MediaStream | null>(null)
  const screenStreamRef = useRef<MediaStream | null>(null)
  const chatManagerRef = useRef<ChatManager | null>(null)

  /* ---------------- Load USER + UUID ---------------- */
  useEffect(() => {
    let mounted = true

    const loadAll = async () => {
      try {
        const [userRes, roomRes] = await Promise.all([
          api.get('/user/me'),
          api.get(`/meetings/by-code/${meetingCode}`),
        ])

        if (!mounted) return

        const meetingId = roomRes.data.data.id
        let organizerId: string | null = null
        try {
          const detailRes = await api.get(`/meetings/${meetingId}`)
          organizerId = detailRes.data?.data?.organizer?.id ?? null
        } catch (detailErr) {
          console.error('Failed to load meeting detail', detailErr)
        }

        setCurrentUser({
          id: userRes.data.data.id,
          name: userRes.data.data.fullName,
          avatar: userRes.data.data.avatar,
        })

        setHostId(organizerId)
        setRealRoomId(meetingId)
      } catch (err) {
        console.error('Failed to load user/room', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadAll()

    return () => {
      mounted = false
    }
  }, [meetingCode])

  /* ---------------- JOIN ROOM ---------------- */
  useEffect(() => {
    if (!realRoomId || !currentUser?.id) return

    // eslint-disable-next-line prefer-const
    let mounted = true
    let mediaInitialized = false

    const mediaController = mediaControllerRef.current ?? new MediaController()
    mediaControllerRef.current = mediaController

    const peerManager =
      peerManagerRef.current ??
      new PeerManager([{ urls: 'stun:stun.l.google.com:19302' }], {
        onLocalStream: (stream) => {
          console.log('🔔 onLocalStream callback:', stream.id)
          if (mounted) setLocalStream(stream)
        },
        onRemoteStream: (socketId, stream) => {
          console.log('🎉🎉🎉 onRemoteStream callback:', { 
            socketId, 
            streamId: stream.id,
            tracks: stream.getTracks().map(t => ({
              kind: t.kind,
              label: t.label,
              id: t.id
            }))
          })

          if (!mounted) return

          const videoTrack = stream.getVideoTracks()[0]
          if (!videoTrack) {
            console.warn('⚠️ No video track, adding as audio-only')
            setRemoteCameraStreams(prev => ({
              ...prev,
              [socketId]: stream
            }))
            return
          }

          const trackLabel = videoTrack.label.toLowerCase()
          const isScreenShare = 
            trackLabel.includes('screen') || 
            trackLabel.includes('monitor') ||
            trackLabel.includes('window') ||
            trackLabel.includes('display')

          console.log('📺 Stream classification:', {
            socketId,
            isScreenShare,
            trackLabel: videoTrack.label
          })

          if (isScreenShare) {
            setRemoteScreenStreams(prev => {
              console.log('➕ Adding screen stream:', socketId)
              return { ...prev, [socketId]: stream }
            })
          } else {
            setRemoteCameraStreams(prev => {
              console.log('➕ Adding camera stream:', socketId)
              return { ...prev, [socketId]: stream }
            })
          }
        },
        onPeerDisconnected: (socketId) => {
          console.log('👋 Peer disconnected:', socketId)
          if (!mounted) return
          
          setRemoteCameraStreams((prev) => {
            const { [socketId]: _, ...rest } = prev
            return rest
          })
          setRemoteScreenStreams((prev) => {
            const { [socketId]: _, ...rest } = prev
            return rest
          })
        },
      })
    peerManagerRef.current = peerManager

    const chatManager = new ChatManager(
      realRoomId,
      currentUser.id,
      currentUser.name,
      currentUser.avatar
    )
    chatManagerRef.current = chatManager

    socket.connect()

    // 🔥 FORCE INIT MEDIA - Only once
    const initAndJoin = async () => {
      if (mediaInitialized) {
        console.warn('Media already initialized, skipping')
        return
      }
      
      mediaInitialized = true
      
      console.log('🚀🚀🚀 STARTING MEDIA INIT')
      
      try {
        // Force init camera
        const stream = await peerManager.initLocalStream()
        
        console.log('📹📹📹 MEDIA INIT RESULT:', {
          hasStream: !!stream,
          streamId: stream?.id,
          audioTracks: stream?.getAudioTracks().length ?? 0,
          videoTracks: stream?.getVideoTracks().length ?? 0,
          tracks: stream?.getTracks().map(t => ({
            kind: t.kind,
            label: t.label,
            enabled: t.enabled,
            readyState: t.readyState
          })) ?? []
        })
        
        if (!mounted) return
        
        if (stream) {
          cameraStreamRef.current = stream
          setCameraStream(stream)
          setLocalStream(stream)
          setIsVideoOn(true)
          console.log('✅✅✅ CAMERA READY')
        } else {
          console.warn('⚠️⚠️⚠️ NO CAMERA - USING DUMMY AUDIO')
          setIsVideoOn(false)
        }

        setIsMuted(false)

      } catch (err) {
        console.error('❌❌❌ MEDIA INIT FAILED:', err)
        if (!mounted) return
        setIsVideoOn(false)
      }

      if (!mounted) return

      // NOW join the room
      console.log('📡 JOINING ROOM...')
      
      socket.emit(
        'join-room',
        {
          roomId: realRoomId,
          userId: currentUser.id,
          userName: currentUser.name,
          avatar: currentUser.avatar,
        },
        async (res: JoinRoomAck) => {
          if (!mounted) return
          
          try {
            if (!res.success) {
              console.warn('Failed to join room')
              return
            }

            console.log('✅ JOINED ROOM, peers:', res.peers.length)

            if (res.screenSharing) {
              const { userId: sharingUserId, socketId: sharingSocketId } = res.screenSharing
              
              setParticipants((prev) =>
                prev.map((p) =>
                  p.id === sharingUserId || p.socketId === sharingSocketId
                    ? { ...p, isScreenSharing: true }
                    : p
                )
              )
            }

            const stream = cameraStreamRef.current

            setParticipants((prev) => {
              const selfExists = prev.some((p) => p.id === currentUser.id)
              const selfEntry: Participant = {
                id: currentUser.id,
                socketId: socket.id || '',
                name: currentUser.name,
                avatar: currentUser.avatar,
                isHost: false,
                isMuted: false,
                isVideoOn: !!stream,
                isSpeaking: false,
                isScreenSharing: res.screenSharing?.userId === currentUser.id,
              }

              const peersEntries = res.peers.map((p) => ({
                id: p.userId,
                socketId: p.socketId,
                name: p.userName,
                avatar: p.avatar ?? '',
                isHost: false,
                isMuted: false,
                isVideoOn: true,
                isSpeaking: false,
                isScreenSharing: res.screenSharing?.userId === p.userId,
              }))

              const merged = [
                ...(selfExists
                  ? prev.filter((x) => x.id !== currentUser.id)
                  : prev),
                selfEntry,
                ...peersEntries.filter((peer) => peer.id !== currentUser.id),
              ]
              return merged
            })

            if (res.messages) setMessages(res.messages)

            // Create offers to existing peers
            if (res.peers.length > 0) {
              console.log('📤📤📤 CREATING OFFERS TO', res.peers.length, 'PEERS')
              res.peers.forEach((p) => {
                console.log('📤 Creating offer to:', p.socketId)
                peerManager.createOffer(p.socketId)
              })
            } else {
              console.log('ℹ️ No peers in room yet')
            }
          } catch (e) {
            console.error('❌ Error during join callback:', e)
          }
        }
      )
    }

    // Delay slightly to avoid React strict mode double-call
    const timer = setTimeout(() => {
      if (mounted) {
        void initAndJoin()
      }
    }, 100)

    const onUserJoined = (u: {
      socketId: string
      userId: string
      userName: string
      avatar?: string
    }) => {
      console.log('👤👤👤 USER JOINED:', u.userName, u.socketId)
      
      if (!mounted) return
      
      setParticipants((prev) => {
        if (prev.some((p) => p.id === u.userId)) {
          console.warn('User already in participants')
          return prev
        }
        return [
          ...prev,
          {
            id: u.userId,
            socketId: u.socketId,
            name: u.userName,
            avatar: u.avatar ?? '',
            isHost: false,
            isMuted: false,
            isVideoOn: true,
            isSpeaking: false,
            isScreenSharing: false,
          },
        ]
      })

      setPopup({ type: 'join', name: u.userName })
      setTimeout(() => setPopup(null), 5000)

      console.log('📤 Creating offer to new user:', u.socketId)
      peerManager.createOffer(u.socketId)
    }

    const onUserLeft = ({ socketId }: { socketId: string }) => {
      setRemoteCameraStreams((prev) => {
        const { [socketId]: _, ...rest } = prev
        return rest
      })
      setRemoteScreenStreams((prev) => {
        const { [socketId]: _, ...rest } = prev
        return rest
      })

      setParticipants((prev) => prev.filter((p) => p.socketId !== socketId))

      setPopup({ type: 'leave', name: 'Một người dùng' })
      setTimeout(() => setPopup(null), 5000)
    }

    const onSignalOffer = async (data: SignalData) => {
      if (data.sdp) {
        await peerManager.handleOffer(data.from, data.sdp)
      }
    }

    const onSignalAnswer = async (data: SignalData) => {
      if (data.sdp) {
        await peerManager.handleAnswer(data.from, data.sdp)
      }
    }

    const onSignalCandidate = async (data: SignalData) => {
      if (data.candidate) {
        await peerManager.handleCandidate(data.from, data.candidate)
      }
    }

    socket.on('user-joined', onUserJoined)
    socket.on('user-left', onUserLeft)
    socket.on('signal-offer', onSignalOffer)
    socket.on('signal-answer', onSignalAnswer)
    socket.on('signal-candidate', onSignalCandidate)

    const onScreenShareUpdate = (data: {
      socketId: string
      userId: string
      userName?: string
      isSharing: boolean
    }) => {
      console.log('📺 Screen share update:', data)

      setParticipants((prev) =>
        prev.map((p) => {
          if (p.socketId === data.socketId || p.id === data.userId) {
            return { ...p, isScreenSharing: data.isSharing }
          }
          return { ...p, isScreenSharing: false }
        })
      )

      if (data.userId === currentUser.id) {
        setIsScreenShare(data.isSharing)
      }
    }
    socket.on('screen-share:update', onScreenShareUpdate)

    chatManager.onUpdate((msgs) => setMessages(msgs))

    return () => {
      socket.off('user-joined', onUserJoined)
      socket.off('user-left', onUserLeft)
      socket.off('signal-offer', onSignalOffer)
      socket.off('signal-answer', onSignalAnswer)
      socket.off('signal-candidate', onSignalCandidate)
      socket.off('screen-share:update', onScreenShareUpdate)

      try {
        chatManager.clear()
      } catch (e) {
        console.warn('chatManager clear failed', e)
      }

      try {
        mediaController.stopAll()
      } catch (e) {
        console.warn('stopAll media failed', e)
      }

      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop())
        screenStreamRef.current = null
      }

      try {
        peerManager.cleanup()
      } catch (e) {
        console.warn('peerManager cleanup failed', e)
      }

      try {
        socket.disconnect()
      } catch (e) {
        console.warn('socket disconnect failed', e)
      }
    }
  }, [realRoomId, currentUser?.id])

  /* ---------------- CONTROLS ---------------- */
  const handleToggleMic = () => {
    const peerManager = peerManagerRef.current
    if (!peerManager || !currentUser) return
    
    try {
      const enabled = peerManager.toggleAudio()
      setIsMuted(!enabled)
      setParticipants((prev) =>
        prev.map((p) =>
          p.id === currentUser.id ? { ...p, isMuted: !enabled } : p
        )
      )
    } catch (err) {
      console.warn('Toggle mic failed:', err)
    }
  }

  const handleToggleVideo = () => {
    const peerManager = peerManagerRef.current
    if (!peerManager || !currentUser) return
    
    try {
      const enabled = peerManager.toggleVideo()
      setIsVideoOn(enabled)
      setParticipants((prev) =>
        prev.map((p) =>
          p.id === currentUser.id ? { ...p, isVideoOn: enabled } : p
        )
      )
    } catch (err) {
      console.warn('Toggle video failed:', err)
    }
  }

  const stopScreenShare = async () => {
    console.log('🛑 stopScreenShare called')
    const peerManager = peerManagerRef.current
    if (!peerManager) {
      console.error('❌ Missing peerManager')
      return
    }

    console.log('🔄 Removing screen stream from peers')
    await peerManager.removeScreenStream()

    setIsScreenShare(false)

    setParticipants((prev) =>
      prev.map((p) =>
        p.id === currentUser!.id ? { ...p, isScreenSharing: false } : p
      )
    )

    console.log('📡 Emitting screen-share:stop')
    socket.emit('screen-share:stop', {
      roomId: realRoomId,
      userId: currentUser!.id,
      socketId: socket.id,
    })

    if (screenStreamRef.current) {
      console.log('🧹 Cleaning up screen stream')
      screenStreamRef.current.getTracks().forEach((t) => t.stop())
      screenStreamRef.current = null
    }
  }

  const handleToggleScreenShare = async () => {
    const peerManager = peerManagerRef.current
    const media = mediaControllerRef.current
    if (!peerManager || !media) return

    if (isScreenShare) {
      console.log('🛑 Stopping screen share')
      await stopScreenShare()
      return
    }

    console.log('🎬 Starting screen share...')
    const screenStream = await media.shareScreen()
    if (!screenStream) {
      console.error('❌ Failed to get screen stream')
      return
    }

    console.log('✅ Got screen stream:', {
      id: screenStream.id,
      tracks: screenStream.getTracks().map(t => ({
        kind: t.kind,
        enabled: t.enabled,
        readyState: t.readyState,
        label: t.label
      }))
    })

    screenStreamRef.current = screenStream

    console.log('🔄 Adding screen stream to peers...')
    await peerManager.addScreenStream(screenStream)
    
    console.log('📺 Updating UI state')
    setIsScreenShare(true)
    setLocalStream(screenStream)

    setParticipants((prev) =>
      prev.map((p) =>
        p.id === currentUser!.id ? { ...p, isScreenSharing: true } : p
      )
    )

    console.log('📡 Emitting screen-share:start')
    socket.emit('screen-share:start', {
      roomId: realRoomId,
      userId: currentUser!.id,
      userName: currentUser!.name,
      socketId: socket.id,
    })

    const screenTrack = screenStream.getVideoTracks()[0]
    if (screenTrack) {
      screenTrack.onended = () => {
        console.log('🛑 Screen track ended')
        void stopScreenShare()
      }
    }
  }

  const participantsWithHost = participants.map((p) => ({
    ...p,
    isHost: hostId ? p.id === hostId : false,
  }))

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {popup && (
        <div className="absolute bottom-4 right-4 bg-gray-800 px-4 py-3 rounded-lg shadow-lg text-white animate-fade-in z-50">
          {popup.type === 'join'
            ? `${popup.name} đã tham gia phòng`
            : `${popup.name} đã rời phòng`}
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-lg">
          Đang tải phòng họp...
        </div>
      ) : (
        <>
          <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex justify-between">
            <h1 className="font-semibold">Phòng họp {meetingCode}</h1>
          </div>

          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 relative">
              <VideoGrid
                participants={participantsWithHost}
                localStream={localStream}
                cameraStream={cameraStream}
                remoteCameraStreams={remoteCameraStreams}
                remoteScreenStreams={remoteScreenStreams}
                currentUserId={currentUser?.id ?? ''}
                forceScreenFocus={participants.some((p) => p.isScreenSharing)}
              />
            </div>

            {(showChat || showParticipants) && (
              <div className="w-80 border-l border-gray-700 flex flex-col">
                {showChat && (
                  <ChatPanel
                    messages={messages}
                    onSendMessage={(msg) =>
                      socket.emit('chat:send', {
                        roomId: realRoomId,
                        userId: currentUser!.id,
                        userName: currentUser!.name,
                        userAvatar: currentUser!.avatar,
                        message: msg,
                      })
                    }
                    currentUserId={currentUser!.id}
                  />
                )}

                {showParticipants && (
                  <ParticipantsPanel
                    participants={participantsWithHost}
                    currentUserId={currentUser!.id}
                  />
                )}
              </div>
            )}
          </div>

          <ControlBar
            isMuted={isMuted}
            isVideoOn={isVideoOn}
            isScreenSharing={isScreenShare}
            onToggleMic={handleToggleMic}
            onToggleVideo={handleToggleVideo}
            onToggleScreenShare={handleToggleScreenShare}
            onToggleChat={() => {
              setShowChat((s) => !s)
              setShowParticipants(false)
            }}
            onToggleParticipants={() => {
              setShowParticipants((s) => !s)
              setShowChat(false)
            }}
            onLeave={() => {
              try {
                socket.emit('leave-room', { roomId: realRoomId })
              } catch (e) {
                // Ignore error on leave
              }
              router.push('/')
            }}
          />
        </>
      )}
    </div>
  )
}