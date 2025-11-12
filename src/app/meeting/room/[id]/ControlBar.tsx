// src/app/meeting/room/[id]/ControlBar.tsx

'use client'
import React from 'react'
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MessageSquare,
  Users,
  Settings,
  PhoneOff,
  MoreVertical,
} from 'lucide-react'

interface ControlBarProps {
  isMuted: boolean
  isVideoOn: boolean
  isScreenSharing: boolean
  onToggleMic: () => void
  onToggleVideo: () => void
  onToggleScreenShare: () => void
  onToggleChat: () => void
  onToggleParticipants: () => void
  onLeave: () => void
}

export default function ControlBar({
  isMuted,
  isVideoOn,
  isScreenSharing,
  onToggleMic,
  onToggleVideo,
  onToggleScreenShare,
  onToggleChat,
  onToggleParticipants,
  onLeave,
}: ControlBarProps) {
  return (
    <div className="bg-gray-900 border-t border-gray-800 px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMic}
            className={`p-3 rounded-lg transition-colors ${
              isMuted
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <MicOff
                size={20}
                className="text-white"
              />
            ) : (
              <Mic
                size={20}
                className="text-white"
              />
            )}
          </button>

          <button
            onClick={onToggleVideo}
            className={`p-3 rounded-lg transition-colors ${
              !isVideoOn
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            aria-label={isVideoOn ? 'Turn off video' : 'Turn on video'}
          >
            {isVideoOn ? (
              <Video
                size={20}
                className="text-white"
              />
            ) : (
              <VideoOff
                size={20}
                className="text-white"
              />
            )}
          </button>

          <button
            onClick={onToggleScreenShare}
            className={`p-3 rounded-lg transition-colors ${
              isScreenSharing
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            aria-label="Share screen"
          >
            <Monitor
              size={20}
              className="text-white"
            />
          </button>
        </div>

        {/* Center Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleChat}
            className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            aria-label="Chat"
          >
            <MessageSquare
              size={20}
              className="text-white"
            />
          </button>

          <button
            onClick={onToggleParticipants}
            className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            aria-label="Participants"
          >
            <Users
              size={20}
              className="text-white"
            />
          </button>

          <button
            className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            aria-label="Settings"
          >
            <Settings
              size={20}
              className="text-white"
            />
          </button>

          <button
            className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            aria-label="More"
          >
            <MoreVertical
              size={20}
              className="text-white"
            />
          </button>
        </div>

        {/* Right Controls */}
        <div>
          <button
            onClick={onLeave}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <PhoneOff
              size={20}
              className="text-white"
            />
            <span className="text-white font-semibold">Kết thúc</span>
          </button>
        </div>
      </div>
    </div>
  )
}
