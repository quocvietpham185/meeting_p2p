'use client';
import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

import { X } from 'lucide-react';
import { ChatMessage, Participant } from '@/interfaces/models/room';
import ChatPanel from './ChatPanel';
import VideoGrid from './VideoGrid';
import ControlBar from './ControlBar';
import ParticipantsPanel from './ParticipantsPanel';

export default function MeetingRoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  // Mock data
  const currentUserId = '1';

  const [participants] = useState<Participant[]>([
    {
      id: '1',
      name: 'Nguyễn Văn A',
      avatar: '/images/avatar1.png',
      isMuted: false,
      isVideoOn: true,
      isHost: true,
      isSpeaking: true,
    },
    {
      id: '2',
      name: 'Trần B',
      avatar: '/images/avatar2.png',
      isMuted: false,
      isVideoOn: true,
      isHost: false,
      isSpeaking: false,
    },
    {
      id: '3',
      name: 'Lê C',
      avatar: '/images/avatar3.png',
      isMuted: true,
      isVideoOn: false,
      isHost: false,
      isSpeaking: false,
    },
    {
      id: '4',
      name: 'Phạm D',
      avatar: '/images/avatar4.png',
      isMuted: false,
      isVideoOn: true,
      isHost: false,
      isSpeaking: false,
    },
    {
      id: '5',
      name: 'Vũ E',
      avatar: '/images/avatar5.png',
      isMuted: false,
      isVideoOn: true,
      isHost: false,
      isSpeaking: false,
    },
    {
      id: '6',
      name: 'Đỗ F',
      avatar: '/images/avatar6.png',
      isMuted: true,
      isVideoOn: false,
      isHost: false,
      isSpeaking: false,
    },
  ]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      userId: '1',
      userName: 'Nguyễn Văn A',
      userAvatar: '/images/avatar1.png',
      message: 'Chào mọi người, Chúng ta bắt đầu cuộc họp nhé!',
      timestamp: '07:34',
    },
    {
      id: '2',
      userId: '2',
      userName: 'Trần B',
      userAvatar: '/images/avatar2.png',
      message: 'Tôi đã chuẩn bị tài liệu sẵn sàng rồi ạ',
      timestamp: '10:52',
    },
    {
      id: '3',
      userId: '3',
      userName: 'Lê C',
      userAvatar: '/images/avatar3.png',
      message: 'Có thể chia sẻ màn hình được không?',
      timestamp: '10:55',
    },
  ]);

  const handleSendMessage = (message: string) => {
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      userId: currentUserId,
      userName: 'Nguyễn Văn A',
      userAvatar: '/images/avatar1.png',
      message,
      timestamp: new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setMessages([...messages, newMsg]);
  };

  const handleLeave = () => {
    if (confirm('Bạn có chắc muốn rời khỏi cuộc họp?')) {
      router.push('/');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-white font-semibold">Cuộc họp Dự án X</h1>
          <span className="text-gray-400 text-sm">05:02:28</span>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-500 text-sm">Recording</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Grid */}
        <div className="flex-1 relative">
          <VideoGrid participants={participants} />
        </div>

        {/* Side Panel */}
        {(showChat || showParticipants) && (
          <div className="w-80 lg:w-96 border-l border-gray-700 flex flex-col">
            <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
              <h3 className="text-white font-semibold">
                {showChat ? 'Chat' : 'Thành viên'}
              </h3>
              <button
                onClick={() => {
                  setShowChat(false);
                  setShowParticipants(false);
                }}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            {showChat && (
              <ChatPanel
                messages={messages}
                onSendMessage={handleSendMessage}
                currentUserId={currentUserId}
              />
            )}
            {showParticipants && (
              <ParticipantsPanel
                participants={participants}
                currentUserId={currentUserId}
              />
            )}
          </div>
        )}
      </div>

      {/* Control Bar */}
      <ControlBar
        isMuted={isMuted}
        isVideoOn={isVideoOn}
        isScreenSharing={isScreenSharing}
        onToggleMic={() => setIsMuted(!isMuted)}
        onToggleVideo={() => setIsVideoOn(!isVideoOn)}
        onToggleScreenShare={() => setIsScreenSharing(!isScreenSharing)}
        onToggleChat={() => {
          setShowChat(!showChat);
          setShowParticipants(false);
        }}
        onToggleParticipants={() => {
          setShowParticipants(!showParticipants);
          setShowChat(false);
        }}
        onLeave={handleLeave}
      />
    </div>
  );
}