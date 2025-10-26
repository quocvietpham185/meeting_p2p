'use client';
import React from 'react';
import { Mic, MicOff, Video, VideoOff, Pin } from 'lucide-react';
import Image from 'next/image';
import { Participant } from '@/interfaces/models/room';

interface VideoGridProps {
  participants: Participant[];
  onPinParticipant?: (id: string) => void;
}

export default function VideoGrid({ participants, onPinParticipant }: VideoGridProps) {
  const getGridClass = () => {
    const count = participants.length;
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-1 md:grid-cols-2';
    if (count <= 4) return 'grid-cols-2';
    if (count <= 6) return 'grid-cols-2 md:grid-cols-3';
    return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
  };

  return (
    <div className={`grid ${getGridClass()} gap-2 h-full p-4`}>
      {participants.map((participant) => (
        <div
          key={participant.id}
          className={`relative bg-gradient-to-br ${
            participant.isSpeaking
              ? 'from-purple-600 to-pink-600'
              : participant.isHost
              ? 'from-green-600 to-teal-600'
              : 'from-blue-600 to-indigo-700'
          } rounded-lg overflow-hidden group`}
        >
          {/* Video/Avatar */}
          <div className="absolute inset-0 flex items-center justify-center">
            {participant.isVideoOn ? (
              <div className="w-full h-full bg-gray-900">
                {/* Video stream placeholder */}
                <div className="w-full h-full flex items-center justify-center">
                  <Image
                    src={participant.avatar}
                    alt={participant.name}
                    width={80}
                    height={80}
                    className="rounded-full"
                  />
                </div>
              </div>
            ) : (
              <Image
                src={participant.avatar}
                alt={participant.name}
                width={80}
                height={80}
                className="rounded-full"
              />
            )}
          </div>

          {/* Pin Button */}
          <button
            onClick={() => onPinParticipant?.(participant.id)}
            className="absolute top-2 right-2 p-2 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
          >
            <Pin size={16} className="text-white" />
          </button>

          {/* Name & Status Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium text-sm">
                  {participant.name}
                  {participant.isHost && (
                    <span className="ml-2 text-xs bg-yellow-500 px-2 py-0.5 rounded">
                      Host
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {!participant.isMuted ? (
                  <div className="p-1 bg-green-500 rounded">
                    <Mic size={14} className="text-white" />
                  </div>
                ) : (
                  <div className="p-1 bg-red-500 rounded">
                    <MicOff size={14} className="text-white" />
                  </div>
                )}
                {!participant.isVideoOn && (
                  <div className="p-1 bg-red-500 rounded">
                    <VideoOff size={14} className="text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Speaking Indicator */}
          {participant.isSpeaking && (
            <div className="absolute inset-0 border-4 border-green-400 rounded-lg pointer-events-none animate-pulse" />
          )}
        </div>
      ))}
    </div>
  );
}