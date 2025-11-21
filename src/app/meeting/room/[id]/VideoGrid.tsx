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
      <div className={`relative bg-black ${className}`}>
        <video
          ref={videoRef}
          muted={muted}
          playsInline
          autoPlay
          className="w-full h-full object-cover"
        />

        {playError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-10">
            <button
              className="px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors shadow-lg"
              onClick={() => {
                setPlayError(false)
                videoRef.current?.play()
              }}
            >
              Bật video
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
  const sharingUser = participants.find((p) => p.isScreenSharing)
  const spotlight = Boolean(sharingUser)

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
    if (n === 2) return 'grid-cols-1 sm:grid-cols-2'
    if (n <= 4) return 'grid-cols-2'
    if (n <= 6) return 'grid-cols-2 md:grid-cols-3'
    if (n <= 9) return 'grid-cols-3'
    return 'grid-cols-3 md:grid-cols-4'
  }, [participants.length])

  /* ----------------------------------------------------
      ⭐ SPOTLIGHT MODE: Screen sharing active
  ---------------------------------------------------- */
  if (spotlight && sharingUser) {
    const isLocal = sharingUser.id === currentUserId

    const screenStream = isLocal
      ? localScreenStream
      : remoteScreenStreams[sharingUser.socketId] ?? null

    return (
      <div className="w-full h-full flex flex-col md:flex-row gap-2 p-2 bg-gray-900">
        {/* MAIN SCREEN SHARE */}
        <div className="flex-1 min-h-0 relative border border-gray-700/50 rounded-lg md:rounded-xl overflow-hidden shadow-2xl bg-black">
          {screenStream ? (
            <VideoTile
              id={isLocal ? 'local-screen' : `screen-${sharingUser.socketId}`}
              stream={screenStream}
              muted={isLocal}
              className="w-full h-full"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
              <div className="text-center p-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-xs sm:text-sm">Đang tải màn hình...</p>
              </div>
            </div>
          )}

          {/* Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-lg flex-shrink-0">
                {sharingUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white font-semibold text-xs sm:text-sm truncate">
                  {sharingUser.name} {isLocal && '(Bạn)'}
                </p>
                <p className="text-gray-300 text-[10px] sm:text-xs flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse flex-shrink-0"></span>
                  <span className="truncate">Đang chia sẻ màn hình</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR CAMERAS */}
        <div className="w-full md:w-48 lg:w-60 xl:w-72 h-32 md:h-auto flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800 flex-shrink-0">
          {participants.map((p) => {
            const isSelf = p.id === currentUserId

            let camStream = isSelf
              ? localCameraStream
              : remoteCameraStreams[p.socketId] ?? null

            // Filter out screen stream from camera
            if (p.isScreenSharing && camStream) {
              const screenStreamForUser = isSelf
                ? localScreenStream
                : remoteScreenStreams[p.socketId]
              
              if (screenStreamForUser) {
                if (camStream.id === screenStreamForUser.id) {
                  camStream = null
                } else {
                  const camVideoTrack = camStream.getVideoTracks()[0]
                  const screenVideoTrack = screenStreamForUser.getVideoTracks()[0]
                  
                  if (camVideoTrack && screenVideoTrack && camVideoTrack.id === screenVideoTrack.id) {
                    camStream = null
                  }
                }
              }
            }

            return (
              <div
                key={p.socketId}
                className="relative w-32 md:w-full h-full md:h-auto flex-shrink-0 md:flex-shrink md:aspect-video bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 rounded-lg overflow-hidden shadow-lg hover:border-blue-500/50 transition-all"
              >
                {!camStream ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-base sm:text-lg font-bold shadow-lg">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                ) : (
                  <VideoTile
                    id={isSelf ? 'local-cam' : `cam-${p.socketId}`}
                    stream={camStream}
                    muted={isSelf}
                    className="w-full h-full"
                  />
                )}

                <div className="absolute bottom-0 left-0 right-0 p-1.5 sm:p-2 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white text-[10px] sm:text-xs font-medium truncate">
                    {p.name} {isSelf && '(Bạn)'} {p.isHost && '👑'}
                  </p>
                  {p.isMuted && (
                    <div className="inline-flex items-center gap-0.5 mt-0.5 text-[9px] sm:text-[10px] text-red-400">
                      <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                      </svg>
                      <span className="truncate">Tắt mic</span>
                    </div>
                  )}
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
    <div className="w-full h-full overflow-auto">
      <div className={`grid ${gridCols} gap-2 sm:gap-3 p-2 sm:p-3 min-h-full`}>
        {participants.map((p) => {
          const isSelf = p.id === currentUserId

          const stream = isSelf
            ? localCameraStream
            : remoteCameraStreams[p.socketId] ?? null

          return (
            <div
              key={p.socketId}
              className="relative bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800/50 rounded-lg sm:rounded-xl overflow-hidden shadow-lg hover:border-blue-500/50 transition-all aspect-video"
            >
              {!stream ? (
                <div className="absolute inset-0 flex items-center justify-center p-2">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl md:text-3xl font-bold shadow-xl">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                </div>
              ) : (
                <VideoTile
                  id={isSelf ? 'local' : p.socketId}
                  stream={stream}
                  muted={isSelf}
                  className="w-full h-full"
                />
              )}

              {/* Name Overlay - ALWAYS VISIBLE */}
              <div className="absolute bottom-0 left-0 right-0 p-1.5 sm:p-2 md:p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-white text-[10px] sm:text-xs md:text-sm font-semibold truncate flex-1">
                    {p.name} {isSelf && '(Bạn)'} {p.isHost && '👑'}
                  </p>
                  {p.isMuted && (
                    <div className="bg-red-500/90 backdrop-blur-sm rounded-full p-1 flex-shrink-0">
                      <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Speaking Indicator */}
              {p.isSpeaking && (
                <div className="absolute top-0 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-green-500 to-blue-500 animate-pulse"></div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}