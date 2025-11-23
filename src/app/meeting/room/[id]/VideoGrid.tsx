// src/app/meeting/room/[id]/VideoGrid.tsx
'use client'

import React, { useEffect, useRef, useState, useMemo } from 'react'
import { Participant } from '@/interfaces/models/room'

/* ===========================================================
   VideoTile — isolated <video> element with memo + safe play()
=========================================================== */
interface VideoTileProps {
  id: string
  stream: MediaStream | null
  muted?: boolean
  className?: string
}

const VideoTile = React.memo(
  function VideoTile({
    id,
    stream,
    muted = false,
    className = '',
  }: VideoTileProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const lastStreamId = useRef<string | null>(null)
    const [playError, setPlayError] = useState(false)

    useEffect(() => {
      const el = videoRef.current
      if (!el) return

      const sid = stream?.id ?? null
      if (sid === lastStreamId.current) return
      lastStreamId.current = sid

      if (!stream) {
        el.srcObject = null
        return
      }

      el.srcObject = stream

      el.play().catch(() => {
        setPlayError(true)
      })
    }, [stream])

    return (
      <div className={`relative bg-gradient-to-br from-gray-900 to-gray-950 ${className}`}>
        <video
          ref={videoRef}
          muted={muted}
          playsInline
          className="w-full h-full object-cover"
        />

        {playError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <button
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-lg text-white font-medium shadow-lg transition-all duration-200 hover:shadow-blue-500/50"
              onClick={() => videoRef.current?.play()}
            >
              ▶ Nhấn để bật video
            </button>
          </div>
        )}
      </div>
    )
  },
  (prev, next) =>
    prev.stream?.id === next.stream?.id && prev.muted === next.muted
)

/* ===========================================================
   MAIN GRID
=========================================================== */

interface VideoGridProps {
  participants: Participant[]
  currentUserId: string

  localCameraStream: MediaStream | null
  localScreenStream: MediaStream | null

  remoteCameraStreams: Record<string, MediaStream>
  remoteScreenStreams: Record<string, MediaStream>
}

export default function VideoGrid({
  participants,
  currentUserId,

  localCameraStream,
  localScreenStream,

  remoteCameraStreams,
  remoteScreenStreams,
}: VideoGridProps) {
  // Ai đang share màn hình?
  const sharingUser = participants.find((p) => p.isScreenSharing)
  const spotlight = Boolean(sharingUser)

  // Debug nhẹ
  useEffect(() => {
    console.log('🎬 VideoGrid render', {
      spotlight,
      sharingUser: sharingUser?.name,
      remoteScreens: Object.keys(remoteScreenStreams),
      remoteCameras: Object.keys(remoteCameraStreams),
    })
  }, [spotlight, sharingUser, remoteScreenStreams, remoteCameraStreams])

  const gridCols = useMemo(() => {
    const n = participants.length
    if (n <= 1) return 'grid-cols-1'
    if (n <= 2) return 'grid-cols-2'
    if (n <= 4) return 'grid-cols-2 md:grid-cols-3'
    return 'grid-cols-3 md:grid-cols-4'
  }, [participants.length])

  /* ----------------------------------------------------
      ⭐ SPOTLIGHT MODE: Một người đang share màn hình
  ---------------------------------------------------- */
  if (spotlight && sharingUser) {
    const isLocal = sharingUser.id === currentUserId

    // 🟩 MAIN SCREEN STREAM
    const screenStream = isLocal
      ? localScreenStream
      : remoteScreenStreams[sharingUser.socketId] ?? null

    return (
      <div className="w-full h-full flex gap-4 p-4 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        {/* MAIN SCREEN SHARE */}
        <div className="flex-1 relative border-2 border-gray-800/50 rounded-2xl overflow-hidden shadow-2xl bg-black backdrop-blur-sm">
          <VideoTile
            id={isLocal ? 'local-screen' : `screen-${sharingUser.socketId}`}
            stream={screenStream}
            muted={isLocal}
            className="w-full h-full"
          />

          {/* Info overlay with glassmorphism */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ring-2 ring-blue-400/30">
                {sharingUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-white font-semibold text-base flex items-center gap-2">
                  {sharingUser.name} {isLocal && <span className="text-blue-400">(Bạn)</span>}
                </p>
                <p className="text-gray-300 text-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Đang chia sẻ màn hình
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR CAMERAS */}
        <div className="w-80 flex flex-col gap-3 overflow-y-auto custom-scrollbar">
          {participants.map((p) => {
            const isSelf = p.id === currentUserId

            // Get camera stream
            let camStream = isSelf
              ? localCameraStream
              : remoteCameraStreams[p.socketId] ?? null

            // 🔥 FIX: Xử lý cả LOCAL và REMOTE user đang share
            if (p.isScreenSharing && camStream) {
              const screenStreamForUser = isSelf
                ? localScreenStream
                : remoteScreenStreams[p.socketId]
              
              if (screenStreamForUser) {
                if (camStream.id === screenStreamForUser.id) {
                  camStream = null
                }
                else {
                  const camVideoTrack = camStream.getVideoTracks()[0]
                  const screenVideoTrack = screenStreamForUser.getVideoTracks()[0]
                  
                  if (camVideoTrack && screenVideoTrack && camVideoTrack.id === screenVideoTrack.id) {
                    camStream = null
                  }
                }
              }
            }

            // Nếu không có camera stream (hoặc bị filter), hiện avatar
            if (!camStream) {
              return (
                <div
                  key={p.socketId}
                  className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 rounded-xl overflow-hidden flex items-center justify-center shadow-lg hover:border-gray-600/50 transition-all duration-200"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl ring-4 ring-blue-400/20">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/90 via-black/60 to-transparent backdrop-blur-sm">
                    <p className="text-white text-sm font-medium flex items-center gap-1.5">
                      {p.name} {isSelf && <span className="text-blue-400 text-xs">(Bạn)</span>} {p.isHost && <span className="text-yellow-400">👑</span>}
                    </p>
                  </div>
                </div>
              )
            }

            return (
              <div
                key={p.socketId}
                className="relative aspect-video bg-gray-900 border border-gray-700/50 rounded-xl overflow-hidden shadow-lg hover:border-gray-600/50 hover:shadow-xl transition-all duration-200"
              >
                <VideoTile
                  id={isSelf ? 'local-cam' : `cam-${p.socketId}`}
                  stream={camStream}
                  muted={isSelf}
                />

                <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/90 via-black/60 to-transparent backdrop-blur-sm">
                  <p className="text-white text-sm font-medium flex items-center gap-1.5">
                    {p.name} {isSelf && <span className="text-blue-400 text-xs">(Bạn)</span>} {p.isHost && <span className="text-yellow-400">👑</span>}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  /* ----------------------------------------------------
      ⭐ NORMAL GRID MODE
  ---------------------------------------------------- */

  return (
    <div
      className={`grid ${gridCols} gap-4 p-4 h-full auto-rows-[minmax(0,1fr)] bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950`}
    >
      {participants.map((p) => {
        const isSelf = p.id === currentUserId

        const stream = isSelf
          ? localCameraStream
          : remoteCameraStreams[p.socketId] ?? null

        return (
          <div
            key={p.socketId}
            className="relative bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800/50 rounded-2xl overflow-hidden aspect-video shadow-xl hover:border-gray-700/50 hover:shadow-2xl transition-all duration-300 group"
          >
            <VideoTile
              id={isSelf ? 'local' : p.socketId}
              stream={stream}
              muted={isSelf}
              className="w-full h-full"
            />

            {/* Glassmorphism overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent backdrop-blur-sm group-hover:from-black/95 transition-all duration-200">
              <p className="text-white text-sm font-medium flex items-center gap-2">
                {p.name} {isSelf && <span className="text-blue-400 text-xs">(Bạn)</span>} {p.isHost && <span className="text-yellow-400">👑</span>}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
