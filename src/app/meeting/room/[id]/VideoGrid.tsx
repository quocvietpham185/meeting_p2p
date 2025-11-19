// src/app/meeting/room/[id]/VideoGrid.tsx
"use client";

import React, { useEffect, useRef } from "react";
import { Participant } from "@/interfaces/models/room";

interface VideoGridProps {
  participants: Participant[];
  localStream: MediaStream | null;
  cameraStream: MediaStream | null;
  remoteStreams: Record<string, MediaStream | undefined>;
  currentUserId: string;
  forceScreenFocus?: boolean;
}

export default function VideoGrid({
  participants,
  localStream,
  cameraStream,
  remoteStreams,
  currentUserId,
}: VideoGridProps) {
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  /* ---------------------------------------------------
      GÁN STREAM CHO VIDEO TAG
  --------------------------------------------------- */
  useEffect(() => {
    console.log('🎥 VideoGrid useEffect:', {
      localStream: localStream?.id,
      cameraStream: cameraStream?.id,
      remoteStreamsCount: Object.keys(remoteStreams).length,
      remoteStreamKeys: Object.keys(remoteStreams)
    });

    // Set all video elements
    Object.entries(videoRefs.current).forEach(([key, videoEl]) => {
      if (!videoEl) return;

      let targetStream: MediaStream | null = null;

      // Determine which stream to use for this video element
      if (key === "local" || key === "local-screen") {
        targetStream = localStream;
      } else if (key === "local-cam") {
        targetStream = cameraStream;
      } else if (key.startsWith("cam-")) {
        // Extract socketId from "cam-socketId"
        const socketId = key.replace("cam-", "");
        targetStream = remoteStreams[socketId] ?? null;
      } else {
        // Regular remote stream
        targetStream = remoteStreams[key] ?? null;
      }

      if (targetStream && videoEl.srcObject !== targetStream) {
        console.log(`🔧 Setting stream for ${key}:`, targetStream.id);
        try {
          videoEl.srcObject = targetStream;
          videoEl.play()
            .then(() => console.log(`✅ Video ${key} playing`))
            .catch(e => console.error(`❌ Video ${key} play failed:`, e));
        } catch (e) {
          console.warn(`Could not set video ${key} srcObject`, e);
        }
      }
    });
  }, [localStream, cameraStream, remoteStreams]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(videoRefs.current).forEach((el) => {
        if (el) {
          try {
            el.srcObject = null;
          } catch {
            // ignore
          }
        }
      });
    };
  }, []);

  /* ---------------------------------------------------
      KIỂM TRA XEM CÓ AI SHARE MÀN HÌNH KHÔNG
  --------------------------------------------------- */
  const sharingUser = participants.find((p) => p.isScreenSharing === true);
  const spotlightMode = Boolean(sharingUser);

  console.log('🎬 VideoGrid render:', {
    spotlightMode,
    sharingUser: sharingUser?.name,
    sharingUserSocketId: sharingUser?.socketId,
    participantsCount: participants.length,
  });

  /* ---------------------------------------------------
      SPOTLIGHT MODE: Screen share ở giữa, camera bên phải
  --------------------------------------------------- */
  if (spotlightMode && sharingUser) {
    const isLocalSharing = sharingUser.id === currentUserId;
    
    // 🔥 Xác định stream cho màn hình share
    let screenStream: MediaStream | null = null;
    let screenRefKey: string = "";
    
    if (isLocalSharing) {
      // Tôi đang share -> localStream đã là screen stream
      screenRefKey = "local-screen";
      screenStream = localStream;
      console.log('📺 I am sharing, using localStream as screen');
    } else {
      // Người khác đang share -> lấy remote stream của họ
      screenRefKey = sharingUser.socketId ?? "";
      screenStream = remoteStreams[screenRefKey] ?? null;
      console.log('📺 Remote user sharing:', {
        socketId: screenRefKey,
        hasStream: !!screenStream,
        streamId: screenStream?.id
      });
    }

    return (
      <div className="w-full h-full flex gap-3 p-3 bg-gray-900">
        {/* 🔥 MAIN SCREEN SHARE (Bên trái - chiếm phần lớn) */}
        <div className="flex-1 relative border border-gray-700 rounded-xl overflow-hidden shadow-lg bg-black">
          {screenStream ? (
            <video
              ref={(el) => {
                videoRefs.current[screenRefKey] = el;
              }}
              autoPlay
              playsInline
              muted={false} // Don't mute screen share to hear system audio if enabled
              className="w-full h-full object-contain"
              style={{ backgroundColor: '#000' }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-white text-xl">
                🖥️ Đang tải màn hình chia sẻ...
              </div>
            </div>
          )}

          {/* Info bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold shadow-lg">
                {sharingUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-white font-semibold">
                  {sharingUser.name} {isLocalSharing && "(Bạn)"}
                </p>
                <p className="text-gray-300 text-sm">Đang chia sẻ màn hình</p>
              </div>
            </div>
          </div>
        </div>

        {/* 🔥 SIDEBAR CAMERAS (Bên phải) */}
        <div className="w-80 flex flex-col gap-3 overflow-y-auto">
          {participants.map((p) => {
            const isLocal = p.id === currentUserId;
            
            // 🔥 Xác định stream cho camera trong sidebar
            let stream: MediaStream | null = null;
            let refKey: string = "";
            
            if (isLocal) {
              // Tôi -> dùng cameraStream nếu tôi đang share, hoặc localStream nếu không
              refKey = "local-cam";
              stream = isLocalSharing ? cameraStream : localStream;
              console.log('📹 My camera in sidebar:', {
                isSharing: isLocalSharing,
                usingCameraStream: isLocalSharing,
                hasStream: !!stream
              });
            } else {
              // Người khác
              refKey = `cam-${p.socketId}`;
              
              if (p.isScreenSharing) {
                // Người này đang share -> remoteStream là screen, cần camera riêng
                // ⚠️ Hiện tại chưa có cách lấy camera của người đang share
                // Tạm thời không hiển thị hoặc hiển thị avatar
                stream = null;
                console.log('⚠️ Participant is sharing, no separate camera stream available');
              } else {
                // Người này không share -> remoteStream là camera
                stream = remoteStreams[p.socketId ?? ""] ?? null;
                console.log('📹 Remote camera:', {
                  socketId: p.socketId,
                  hasStream: !!stream
                });
              }
            }

            return (
              <div
                key={p.socketId ?? p.id}
                className="relative bg-gray-800 border-2 border-gray-700 rounded-lg overflow-hidden shadow-lg aspect-video flex-shrink-0"
              >
                {/* Video */}
                {stream ? (
                  <video
                    ref={(el) => {
                      videoRefs.current[refKey] = el;
                    }}
                    autoPlay
                    playsInline
                    muted={isLocal}
                    className="w-full h-full object-cover"
                    style={{ backgroundColor: '#1f2937' }}
                  />
                ) : (
                  // Avatar fallback
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600">
                    <div className="text-white text-4xl font-bold">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                )}

                {/* Name overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <p className="text-white text-sm font-medium truncate">
                    {p.name} {isLocal && "(Bạn)"} {p.isHost && "👑"}
                    {p.isScreenSharing && " 🖥️"}
                  </p>
                </div>

                {/* Status indicators */}
                <div className="absolute top-2 right-2 flex gap-1">
                  {p.isMuted && (
                    <div className="bg-red-600 rounded-full p-1.5 shadow-lg">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  {!p.isVideoOn && (
                    <div className="bg-red-600 rounded-full p-1.5 shadow-lg">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Speaking indicator */}
                {p.isSpeaking && (
                  <div className="absolute inset-0 border-4 border-green-400 rounded-lg pointer-events-none animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------
      GRID BÌNH THƯỜNG (Không có ai share màn hình)
  --------------------------------------------------- */
  const gridCols = () => {
    const count = participants.length;
    if (count <= 1) return "grid-cols-1";
    if (count <= 2) return "grid-cols-2";
    if (count <= 4) return "grid-cols-2 md:grid-cols-2";
    if (count <= 6) return "grid-cols-3";
    return "grid-cols-4";
  };

  return (
    <div
      className={`grid ${gridCols()} gap-4 h-full p-4 auto-rows-[minmax(0,1fr)]`}
    >
      {participants.map((p) => {
        const isLocal = p.id === currentUserId;
        const refKey = isLocal ? "local" : p.socketId ?? "";
        const stream = refKey === "local" ? localStream : remoteStreams[refKey];

        return (
          <div
            key={p.socketId ?? p.id}
            className="relative bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-lg aspect-video"
          >
            {/* Video element */}
            {stream ? (
              <video
                ref={(el) => {
                  videoRefs.current[refKey] = el;
                }}
                autoPlay
                playsInline
                muted={isLocal}
                className="w-full h-full object-cover bg-black"
              />
            ) : (
              // Avatar fallback
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600">
                <div className="text-white text-6xl font-bold">
                  {p.name.charAt(0).toUpperCase()}
                </div>
              </div>
            )}

            {/* Bottom info bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
              <p className="text-white text-sm font-medium truncate">
                {p.name} {isLocal && "(Bạn)"} {p.isHost && "👑"}
              </p>
            </div>

            {/* Status indicators (top right) */}
            <div className="absolute top-3 right-3 flex gap-2">
              {p.isMuted && (
                <div className="bg-red-600 rounded-full p-2 shadow-lg">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              {!p.isVideoOn && (
                <div className="bg-red-600 rounded-full p-2 shadow-lg">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Speaking indicator */}
            {p.isSpeaking && (
              <div className="absolute inset-0 border-4 border-green-400 rounded-xl pointer-events-none animate-pulse" />
            )}
          </div>
        );
      })}
    </div>
  );
}