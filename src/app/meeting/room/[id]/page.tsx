'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { socket } from '@/lib/socket';
import { PeerManager } from '@/lib/webrtc/PeerManager';
import { ChatManager } from '@/lib/webrtc/ChatManager';
import { MediaController } from '@/lib/webrtc/MediaController';
import { ChatMessage, Participant } from '@/interfaces/models/room';
import VideoGrid from './VideoGrid';
import ChatPanel from './ChatPanel';
import ControlBar from './ControlBar';
import ParticipantsPanel from './ParticipantsPanel';
import api from '@/lib/api'; // <-- để lấy user thật

interface PeerInfo {
  socketId: string;
  userId: string;
  userName: string;
  avatar?: string;
}
interface JoinRoomAck {
  success: boolean;
  peers: PeerInfo[];
  messages?: ChatMessage[];
}

export default function MeetingRoomPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const roomId = id!;
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; avatar: string } | null>(null);

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  useEffect(() => {
    // ✅ Lấy user thật
    const fetchUser = async () => {
      const res = await api.get('/user/me');
      setCurrentUser({
        id: res.data.id,
        name: res.data.full_name,
        avatar: res.data.avatar,
      });
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const mediaController = new MediaController();
    const peerManager = new PeerManager([{ urls: 'stun:stun.l.google.com:19302' }], {
      onLocalStream: (stream) => setLocalStream(stream),
      onRemoteStream: (socketId, stream) =>
        setRemoteStreams((prev) => ({ ...prev, [socketId]: stream })),
      onPeerDisconnected: (socketId) =>
        setRemoteStreams((prev) => {
          const copy = { ...prev };
          delete copy[socketId];
          return copy;
        }),
    });

    const chatManager = new ChatManager(roomId, currentUser.id, currentUser.name, currentUser.avatar);

    socket.connect();

    socket.emit('join-room', { roomId, userId: currentUser.id, userName: currentUser.name, avatar: currentUser.avatar },
      async (res: JoinRoomAck) => {
        if (res.success) {
          await mediaController.init();
          await peerManager.initLocalStream();

          setParticipants([
            { id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar, isHost: true, isMuted: false, isVideoOn: true, isSpeaking: false },
            ...res.peers.map((p) => ({
              id: p.userId,
              name: p.userName,
              avatar: p.avatar ?? '',
              isHost: false,
              isMuted: false,
              isVideoOn: true,
              isSpeaking: false,
            })),
          ]);

          if (res.messages) setMessages(res.messages);
          res.peers.forEach((p) => peerManager.createOffer(p.socketId));
        }
      });

    chatManager.onUpdate((msgs) => setMessages(msgs));

    socket.on('signal-offer', async ({ from, sdp }) => peerManager.handleOffer(from, sdp));
    socket.on('signal-answer', async ({ from, sdp }) => peerManager.handleAnswer(from, sdp));
    socket.on('signal-candidate', async ({ from, candidate }) => peerManager.handleCandidate(from, candidate));

    return () => {
      chatManager.clear();
      mediaController.stopAll();
      peerManager.cleanup();
      socket.emit('leave-room');
      socket.disconnect();
    };
  }, [currentUser]);

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <h1 className="text-white font-semibold">Phòng họp {roomId}</h1>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative">
          <VideoGrid participants={participants} localStream={localStream} remoteStreams={remoteStreams} />
        </div>

        {(showChat || showParticipants) && (
          <div className="w-80 border-l border-gray-700 flex flex-col">
            {showChat && (
              <ChatPanel
                messages={messages}
                onSendMessage={(msg) => socket.emit('chat:send', {
                  roomId,
                  userId: currentUser?.id,
                  userName: currentUser?.name,
                  userAvatar: currentUser?.avatar,
                  message: msg,
                })}
                currentUserId={currentUser?.id ?? ''}
              />
            )}
            {showParticipants && (
              <ParticipantsPanel participants={participants} currentUserId={currentUser?.id ?? ''} />
            )}
          </div>
        )}
      </div>

      <ControlBar
        isMuted={isMuted}
        isVideoOn={isVideoOn}
        isScreenSharing={false}
        onToggleMic={() => setIsMuted(!isMuted)}
        onToggleVideo={() => setIsVideoOn(!isVideoOn)}
        onToggleScreenShare={() => {}}
        onToggleChat={() => {
          setShowChat(!showChat);
          setShowParticipants(false);
        }}
        onToggleParticipants={() => {
          setShowParticipants(!showParticipants);
          setShowChat(false);
        }}
        onLeave={() => router.push('/')}
      />
    </div>
  );
}
