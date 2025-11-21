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

export default function MeetingRoomPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const meetingCode = params.id

  /* ==================== STATES ==================== */
  const [realRoomId, setRealRoomId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [joined, setJoined] = useState(false)

  const [currentUser, setCurrentUser] = useState<{
    id: string
    name: string
    avatar: string
  } | null>(null)

  const [participants, setParticipants] = useState<Participant[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])

  const [localCameraStream, setLocalCameraStream] =
    useState<MediaStream | null>(null)
  const [localScreenStream, setLocalScreenStream] =
    useState<MediaStream | null>(null)

  const [remoteCameraStreams, setRemoteCameraStreams] = useState<
    Record<string, MediaStream>
  >({})
  const [remoteScreenStreams, setRemoteScreenStreams] = useState<
    Record<string, MediaStream>
  >({})

  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isScreenShare, setIsScreenShare] = useState(false)

  const [showChat, setShowChat] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)

  const [hostId, setHostId] = useState<string | null>(null)
  const [popup, setPopup] = useState<{
    type: 'join' | 'leave'
    name: string
  } | null>(null)

  /* ==================== REFS ==================== */
  const peerManagerRef = useRef<PeerManager | null>(null)
  const mediaControllerRef = useRef<MediaController | null>(null)
  const chatManagerRef = useRef<ChatManager | null>(null)

  const cameraStreamRef = useRef<MediaStream | null>(null)
  const screenStreamRef = useRef<MediaStream | null>(null)

  /* ==================== LOAD USER + ROOM ==================== */
  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const [userRes, roomRes] = await Promise.all([
          api.get('/user/me'),
          api.get(`/meetings/by-code/${meetingCode}`),
        ])

        if (!mounted) return

        const meetingId = roomRes.data.data.id

        setCurrentUser({
          id: userRes.data.data.id,
          name: userRes.data.data.fullName,
          avatar: userRes.data.data.avatar,
        })

        setRealRoomId(meetingId)

        // load host id (optional)
        try {
          const detailRes = await api.get(`/meetings/${meetingId}`)
          setHostId(detailRes.data?.data?.organizer?.id ?? null)
        } catch (e) {
          // ignore
        }
      } catch (err) {
        console.error('Failed load user/room', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [meetingCode])

  /* ==================== JOIN ROOM (after user click) ==================== */
  useEffect(() => {
    // must have room, user, and user must have clicked join
    if (!realRoomId || !currentUser || !joined) return

    let mounted = true

    // create controller & manager
    const media = mediaControllerRef.current ?? new MediaController()
    mediaControllerRef.current = media

    const pm =
      peerManagerRef.current ??
      new PeerManager([{ urls: 'stun:stun.l.google.com:19302' }], {
        // called when local camera stream is ready (initCameraStream)
        onLocalCameraStream: (stream) => {
          if (!mounted) return
          cameraStreamRef.current = stream
          setLocalCameraStream(stream)
        },

        // called when a remote camera stream is received (peer ontrack with camera)
        onRemoteCameraStream: (socketId, stream) => {
          if (!mounted) return
          setRemoteCameraStreams((prev) => ({ ...prev, [socketId]: stream }))
        },

        // called when a remote screen stream is received (peer ontrack with screen)
        onRemoteScreenStream: (socketId, stream) => {
          if (!mounted) return
          setRemoteScreenStreams((prev) => ({ ...prev, [socketId]: stream }))
        },

        // peer disconnected cleanup
        onPeerDisconnected: (socketId) => {
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

    peerManagerRef.current = pm

    const chatManager = new ChatManager(
      realRoomId,
      currentUser.id,
      currentUser.name,
      currentUser.avatar
    )
    chatManagerRef.current = chatManager

    // connect socket after user gesture
    socket.connect()

    // ---------- named handlers so we can remove them ----------
    const handleUserJoined = (u: {
      socketId: string
      userId: string
      userName: string
      avatar?: string
    }) => {
      if (!mounted) return
      setParticipants((prev) => [
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
      ])

      // tie-breaker: only create offer if our socket.id < theirs
      try {
        if (socket.id && u.socketId && socket.id < u.socketId) {
          pm.createOffer(u.socketId)
        }
      } catch {}

      setPopup({ type: 'join', name: u.userName })
      setTimeout(() => setPopup(null), 3500)
    }

    const handleUserLeft = ({ socketId }: { socketId: string }) => {
      if (!mounted) return
      setParticipants((prev) => prev.filter((p) => p.socketId !== socketId))
      setRemoteCameraStreams((prev) => {
        const { [socketId]: _, ...rest } = prev
        return rest
      })
      setRemoteScreenStreams((prev) => {
        const { [socketId]: _, ...rest } = prev
        return rest
      })
      setPopup({ type: 'leave', name: 'Một người dùng' })
      setTimeout(() => setPopup(null), 3500)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSignalOffer = async (d: any) => {
      if (d?.sdp) await pm.handleOffer(d.from, d.sdp)
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSignalAnswer = async (d: any) => {
      if (d?.sdp) await pm.handleAnswer(d.from, d.sdp)
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSignalCandidate = async (d: any) => {
      if (d?.candidate) await pm.handleCandidate(d.from, d.candidate)
    }

    // 🔥 FIX: CHỈ MỘT LISTENER cho screen-share:update
    const handleScreenShareUpdate = (d: {
      socketId: string
      userId: string
      isSharing: boolean
    }) => {
      if (!mounted) return
      
      console.log('📡 screen-share:update received', d)
      
      // 🔥 SET PEER MANAGER FIRST - CRITICAL!
      peerManagerRef.current?.setScreenSharingUser(
        d.isSharing ? d.socketId : null
      )
      
      // 🔥 Reclassify existing streams if any
      if (d.isSharing && peerManagerRef.current) {
        peerManagerRef.current.reclassifyStream(d.socketId)
      }
      
      // Then update UI
      setParticipants((prev) =>
        prev.map((p) =>
          p.socketId === d.socketId || p.id === d.userId
            ? { ...p, isScreenSharing: d.isSharing }
            : { ...p, isScreenSharing: false }
        )
      )
      
      if (d.userId === currentUser.id) setIsScreenShare(d.isSharing)
    }

    // ---------- init media (user gesture) ----------
    ;(async function init() {
      try {
        const cam = await pm.initCameraStream()
        if (cam) {
          cameraStreamRef.current = cam
          setLocalCameraStream(cam)
        } else {
          // no camera: keep false
          setLocalCameraStream(null)
        }
        setIsMuted(false)
        setIsVideoOn(!!cam)
      } catch (err) {
        console.error('init camera failed', err)
      }

      // join room after media ready
      socket.emit(
        'join-room',
        {
          roomId: realRoomId,
          userId: currentUser.id,
          userName: currentUser.name,
          avatar: currentUser.avatar,
        },
        (res: JoinRoomAck) => {
          if (!mounted) return
          
          // 🔥 SET INITIAL SCREEN SHARING STATE FIRST
          if (res.screenSharing) {
            pm.setScreenSharingUser(res.screenSharing.socketId)
          }
          
          // Build participants list (self + peers)
          const me: Participant = {
            id: currentUser.id,
            socketId: socket.id ?? '',
            name: currentUser.name,
            avatar: currentUser.avatar,
            isHost: hostId ? currentUser.id === hostId : false,
            isMuted: false,
            isVideoOn: !!cameraStreamRef.current,
            isSpeaking: false,
            isScreenSharing: res.screenSharing?.userId === currentUser.id,
          }

          const peers = res.peers.map((p) => ({
            id: p.userId,
            socketId: p.socketId,
            name: p.userName,
            avatar: p.avatar ?? '',
            isHost: hostId ? p.userId === hostId : false,
            isMuted: false,
            isVideoOn: true,
            isSpeaking: false,
            isScreenSharing: res.screenSharing?.userId === p.userId,
          }))

          setParticipants([me, ...peers])

          if (res.messages) setMessages(res.messages)

          // create offers to existing peers with deterministic tie-breaker
          res.peers.forEach((p) => {
            try {
              if (socket.id && p.socketId && socket.id < p.socketId)
                pm.createOffer(p.socketId)
            } catch {}
          })
        }
      )
    })()

    // 🔥 FIX: CHỈ ĐĂNG KÝ SOCKET LISTENERS MỘT LẦN
    socket.on('user-joined', handleUserJoined)
    socket.on('user-left', handleUserLeft)
    socket.on('signal-offer', handleSignalOffer)
    socket.on('signal-answer', handleSignalAnswer)
    socket.on('signal-candidate', handleSignalCandidate)
    socket.on('screen-share:update', handleScreenShareUpdate)

    chatManager.onUpdate((msgs) => {
      if (!mounted) return
      setMessages(msgs)
    })

    // cleanup
    return () => {
      mounted = false

      socket.off('user-joined', handleUserJoined)
      socket.off('user-left', handleUserLeft)
      socket.off('signal-offer', handleSignalOffer)
      socket.off('signal-answer', handleSignalAnswer)
      socket.off('signal-candidate', handleSignalCandidate)
      socket.off('screen-share:update', handleScreenShareUpdate)

      try {
        peerManagerRef.current?.cleanup()
      } catch {}

      try {
        chatManagerRef.current?.clear()
      } catch {}

      try {
        mediaControllerRef.current?.stopAll()
      } catch {}

      if (screenStreamRef.current) {
        try {
          screenStreamRef.current.getTracks().forEach((t) => t.stop())
        } catch {}
        screenStreamRef.current = null
      }

      try {
        socket.disconnect()
      } catch {}
    }
  }, [realRoomId, currentUser, joined, hostId])

  /* ==================== HANDLERS ==================== */
  const handleJoinClick = () => setJoined(true)

  const handleToggleMic = () => {
    const pm = peerManagerRef.current
    let enabled = true

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (pm && typeof (pm as any).toggleAudio === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      enabled = (pm as any).toggleAudio()
    } else {
      const s = cameraStreamRef.current
      if (!s) return
      const audio = s.getAudioTracks()[0]
      if (!audio) return
      audio.enabled = !audio.enabled
      enabled = audio.enabled
    }

    setIsMuted(!enabled)
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === currentUser?.id ? { ...p, isMuted: !enabled } : p
      )
    )
  }

  const handleToggleVideo = () => {
    const pm = peerManagerRef.current
    let enabled = true

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (pm && typeof (pm as any).toggleVideo === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      enabled = (pm as any).toggleVideo()
    } else {
      const s = cameraStreamRef.current
      if (!s) return
      const v = s.getVideoTracks()[0]
      if (!v) return
      v.enabled = !v.enabled
      enabled = v.enabled
    }

    setIsVideoOn(enabled)
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === currentUser?.id ? { ...p, isVideoOn: enabled } : p
      )
    )
  }

  const stopScreenShare = async () => {
    const pm = peerManagerRef.current
    if (!pm) return

    await pm.removeScreenStream()

    setIsScreenShare(false)
    setLocalScreenStream(null)

    setParticipants((prev) =>
      prev.map((p) =>
        p.id === currentUser?.id ? { ...p, isScreenSharing: false } : p
      )
    )

    socket.emit('screen-share:stop', {
      roomId: realRoomId,
      userId: currentUser?.id,
      socketId: socket.id,
    })

    if (screenStreamRef.current) {
      try {
        screenStreamRef.current.getTracks().forEach((t) => t.stop())
      } catch {}
      screenStreamRef.current = null
    }
  }

  const handleToggleScreenShare = async () => {
    const pm = peerManagerRef.current
    const media = mediaControllerRef.current
    if (!pm || !media || !currentUser) return

    if (isScreenShare) {
      await stopScreenShare()
      return
    }

    const screen = await media.shareScreen()
    if (!screen) return

    screenStreamRef.current = screen
    setLocalScreenStream(screen)

    await pm.addScreenStream(screen)

    setIsScreenShare(true)
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === currentUser.id ? { ...p, isScreenSharing: true } : p
      )
    )

    socket.emit('screen-share:start', {
      roomId: realRoomId,
      userId: currentUser.id,
      userName: currentUser.name,
      socketId: socket.id,
    })

    const track = screen.getVideoTracks()[0]
    if (track) track.onended = () => stopScreenShare()
  }

  const participantsWithHost = participants.map((p) => ({
    ...p,
    isHost: hostId ? p.id === hostId : false,
  }))

  /* ==================== RENDER ==================== */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
          <p className="text-xl text-gray-300 font-medium">Đang tải phòng họp...</p>
        </div>
      </div>
    )
  }

  if (!joined) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white px-4">
        <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Tham gia phòng họp
            </h1>
            <p className="text-gray-400 text-lg mb-1">Mã phòng: <span className="font-mono font-semibold text-blue-400">{meetingCode}</span></p>
            <p className="text-gray-500 text-sm">Camera và micro sẽ được bật khi tham gia</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleJoinClick}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-blue-500/50 transform hover:scale-[1.02] transition-all duration-200"
            >
              Tham gia ngay
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full py-4 bg-gray-700/50 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl border border-gray-600 transition-all duration-200"
            >
              Quay lại trang chủ
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Popup notifications */}
      {popup && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className="bg-gray-800/95 backdrop-blur-xl border border-gray-700 rounded-xl shadow-2xl px-5 py-4 flex items-center gap-3 min-w-[280px]">
            <div className={`w-2 h-2 rounded-full animate-pulse ${popup.type === 'join' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <div className="flex-1">
              <p className="text-white font-medium">
                {popup.type === 'join' ? '🎉 Tham gia' : '👋 Rời phòng'}
              </p>
              <p className="text-gray-400 text-sm">{popup.name}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-xl border-b border-gray-700/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <div>
            <h1 className="font-semibold text-white text-lg">Phòng họp {meetingCode}</h1>
            <p className="text-gray-400 text-xs">{participants.length} người tham gia</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-gray-700/50 rounded-lg text-xs text-gray-300 font-mono">
            {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1">
          <VideoGrid
            participants={participantsWithHost}
            currentUserId={currentUser?.id ?? ''}
            localCameraStream={localCameraStream}
            localScreenStream={localScreenStream}
            remoteCameraStreams={remoteCameraStreams}
            remoteScreenStreams={remoteScreenStreams}
          />
        </div>

        {/* Sidebar */}
        {(showChat || showParticipants) && (
          <div className="w-80 border-l border-gray-700/50 bg-gray-800/30 backdrop-blur-xl flex flex-col">
            {showChat && currentUser && (
              <ChatPanel
                messages={messages}
                currentUserId={currentUser.id}
                onSendMessage={(msg) =>
                  socket.emit('chat:send', {
                    roomId: realRoomId,
                    userId: currentUser.id,
                    userName: currentUser.name,
                    userAvatar: currentUser.avatar,
                    message: msg,
                  })
                }
              />
            )}

            {showParticipants && currentUser && (
              <ParticipantsPanel
                participants={participantsWithHost}
                currentUserId={currentUser.id}
              />
            )}
          </div>
        )}
      </div>

      {/* Control bar */}
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
          } catch {}
          router.push('/')
        }}
      />

      <style jsx global>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}