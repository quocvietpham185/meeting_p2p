'use client';
import React, { useEffect, useRef } from 'react';
import { Participant } from '@/interfaces/models/room';

interface VideoGridProps {
  participants: Participant[];
  localStream: MediaStream | null;
  remoteStreams: Record<string, MediaStream>;
  currentUserId: string;
}

export default function VideoGrid({
  participants,
  localStream,
  remoteStreams,
  currentUserId,
}: VideoGridProps) {
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  useEffect(() => {
    // Gán stream cho local video
    if (localStream && videoRefs.current['local']) {
      videoRefs.current['local']!.srcObject = localStream;
    }

    // Gán stream cho remote videos
    Object.entries(remoteStreams).forEach(([socketId, stream]) => {
      const video = videoRefs.current[socketId];
      if (video) video.srcObject = stream;
    });
  }, [localStream, remoteStreams]);

  // Tính số cột tùy theo số người
  const gridCols = () => {
    const count = participants.length;
    if (count <= 1) return 'grid-cols-1';
    if (count <= 2) return 'grid-cols-2';
    if (count <= 4) return 'grid-cols-2 md:grid-cols-2';
    if (count <= 6) return 'grid-cols-3';
    return 'grid-cols-4';
  };

  return (
    <div className={`grid ${gridCols()} gap-3 h-full p-4`}>
      {participants.map((p) => {
        const isLocal = p.id === currentUserId;
        const refKey = isLocal ? 'local' : p.id;

        return (
          <div key={p.id} className="relative bg-black rounded-lg overflow-hidden shadow-lg">
            <video
              ref={(el) => {
                videoRefs.current[refKey] = el;
              }}
              autoPlay
              playsInline
              muted={isLocal} // local phải muted
              className="w-full h-full object-cover"
            />

            {/* Label người dùng */}
            <div className="absolute bottom-0 left-0 w-full bg-black/50 p-2 text-white text-sm">
              {p.name} {p.isHost && '(Host)'}
            </div>
          </div>
        );
      })}
    </div>
  );
}
