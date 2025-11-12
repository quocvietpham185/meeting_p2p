'use client';
import React, { useEffect, useRef } from 'react';
import { Participant } from '@/interfaces/models/room';

interface VideoGridProps {
  participants: Participant[];
  localStream: MediaStream | null;
  remoteStreams: Record<string, MediaStream>;
}

export default function VideoGrid({ participants, localStream, remoteStreams }: VideoGridProps) {
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  useEffect(() => {
    if (localStream && videoRefs.current['local']) {
      videoRefs.current['local']!.srcObject = localStream;
    }

    Object.entries(remoteStreams).forEach(([id, stream]) => {
      const video = videoRefs.current[id];
      if (video) video.srcObject = stream;
    });
  }, [localStream, remoteStreams]);

  const gridCols = () => {
    const count = participants.length;
    if (count <= 1) return 'grid-cols-1';
    if (count <= 2) return 'grid-cols-2';
    if (count <= 4) return 'grid-cols-2 md:grid-cols-2';
    if (count <= 6) return 'grid-cols-3';
    return 'grid-cols-4';
  };

  return (
    <div className={`grid ${gridCols()} gap-2 h-full p-4`}>
      {participants.map((p) => (
        <div key={p.id} className="relative bg-black rounded-lg overflow-hidden">
          <video
            ref={(el) => {
              videoRefs.current[p.id === '1' ? 'local' : p.id] = el;
            }}
            autoPlay
            playsInline
            muted={p.id === '1'}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 w-full bg-black/50 p-2 text-white text-sm">
            {p.name} {p.isHost && '(Host)'}
          </div>
        </div>
      ))}
    </div>
  );
}
