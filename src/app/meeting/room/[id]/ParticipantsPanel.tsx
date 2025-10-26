// src/app/meeting/room/[id]/ParticipantsPanel.tsx

'use client';
import React from 'react';
import { Mic, MicOff, Video, VideoOff, MoreVertical, Crown } from 'lucide-react';
import Image from 'next/image';
import { Participant } from '@/interfaces/models/room';

interface ParticipantsPanelProps {
  participants: Participant[];
  currentUserId: string;
  onMuteParticipant?: (id: string) => void;
}

export default function ParticipantsPanel({
  participants,
  currentUserId,
  onMuteParticipant,
}: ParticipantsPanelProps) {
  return (
    <div className="flex flex-col h-full bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-white font-semibold">
          Thành viên ({participants.length})
        </h3>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700 transition-colors group"
          >
            <div className="relative">
              <Image
                src={participant.avatar}
                alt={participant.name}
                width={40}
                height={40}
                className="rounded-full"
              />
              {participant.isSpeaking && (
                <div className="absolute inset-0 border-2 border-green-400 rounded-full animate-pulse" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-white text-sm font-medium truncate">
                  {participant.name}
                  {participant.id === currentUserId && ' (Bạn)'}
                </p>
                {participant.isHost && (
                  <Crown size={14} className="text-yellow-500 flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                {participant.isMuted ? (
                  <MicOff size={12} className="text-red-500" />
                ) : (
                  <Mic size={12} className="text-green-500" />
                )}
                {!participant.isVideoOn && (
                  <VideoOff size={12} className="text-gray-400" />
                )}
              </div>
            </div>

            <button className="p-2 opacity-0 group-hover:opacity-100 hover:bg-gray-600 rounded transition-all">
              <MoreVertical size={16} className="text-gray-400" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}