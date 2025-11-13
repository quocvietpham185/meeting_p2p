"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { socket } from "@/lib/socket";
import { PeerManager } from "@/lib/webrtc/PeerManager";
import { ChatManager } from "@/lib/webrtc/ChatManager";
import { MediaController } from "@/lib/webrtc/MediaController";
import { ChatMessage, Participant } from "@/interfaces/models/room";
import VideoGrid from "./VideoGrid";
import ChatPanel from "./ChatPanel";
import ControlBar from "./ControlBar";
import ParticipantsPanel from "./ParticipantsPanel";
import api from "@/lib/api";

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
  const params = useParams<{ id: string }>();
  const meetingCode = params.id;

  const [realRoomId, setRealRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    avatar: string;
  } | null>(null);

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenShare, setIsScreenShare] = useState(false);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  /* ---------------- 1️⃣ FETCH USER + UUID PHÒNG SONG SONG ---------------- */
  useEffect(() => {
    const loadAll = async () => {
      try {
        const [userRes, roomRes] = await Promise.all([
          api.get("/user/me"),
          api.get(`/meetings/by-code/${meetingCode}`)
        ]);

        setCurrentUser({
          id: userRes.data.data.id,
          name: userRes.data.data.fullName,
          avatar: userRes.data.data.avatar,
        });

        setRealRoomId(roomRes.data.data.id); // UUID
      } catch (err) {
        console.error(err);
      }

      setLoading(false);
    };

    loadAll();
  }, [meetingCode]);

  /* ---------------- 2️⃣ JOIN ROOM SAU KHI ĐÃ LOAD USER + UUID ---------------- */
  useEffect(() => {
    if (!realRoomId || !currentUser) return;

    const mediaController = new MediaController();
    const peerManager = new PeerManager(
      [{ urls: "stun:stun.l.google.com:19302" }],
      {
        onLocalStream: (stream) => setLocalStream(stream),
        onRemoteStream: (socketId, stream) =>
          setRemoteStreams((prev) => ({ ...prev, [socketId]: stream })),
        onPeerDisconnected: (socketId) =>
          setRemoteStreams((prev) => {
            const cp = { ...prev };
            delete cp[socketId];
            return cp;
          }),
      }
    );

    const chatManager = new ChatManager(
      realRoomId,
      currentUser.id,
      currentUser.name,
      currentUser.avatar
    );

    socket.connect();

    socket.emit(
      "join-room",
      {
        roomId: realRoomId,
        userId: currentUser.id,
        userName: currentUser.name,
        avatar: currentUser.avatar,
      },
      async (res: JoinRoomAck) => {
        if (res.success) {
          await mediaController.init();
          await peerManager.initLocalStream();

          setParticipants([
            {
              id: currentUser.id,
              name: currentUser.name,
              avatar: currentUser.avatar,
              isHost: true,
              isMuted: false,
              isVideoOn: true,
              isSpeaking: false,
            },
            ...res.peers.map((p) => ({
              id: p.userId,
              name: p.userName,
              avatar: p.avatar ?? "",
              isHost: false,
              isMuted: false,
              isVideoOn: true,
              isSpeaking: false,
            })),
          ]);

          if (res.messages) setMessages(res.messages);

          res.peers.forEach((p) => peerManager.createOffer(p.socketId));
        }
      }
    );

    chatManager.onUpdate((msgs) => setMessages(msgs));

    socket.on("signal-offer", async ({ from, sdp }) => peerManager.handleOffer(from, sdp));
    socket.on("signal-answer", async ({ from, sdp }) =>
      peerManager.handleAnswer(from, sdp)
    );
    socket.on("signal-candidate", async ({ from, candidate }) =>
      peerManager.handleCandidate(from, candidate)
    );

    return () => {
      chatManager.clear();
      mediaController.stopAll();
      peerManager.cleanup();
      socket.disconnect();
    };
  }, [realRoomId, currentUser]);

  /* ---------------- RENDER UI ---------------- */
  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">

      {/* Loading UI nhưng KHÔNG return early → ✔ không lỗi useEffect  */}
      {loading && (
        <div className="flex-1 flex items-center justify-center text-lg">
          Đang tải phòng họp...
        </div>
      )}

      {!loading && (
        <>
          <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex justify-between">
            <h1 className="font-semibold">Phòng họp {meetingCode}</h1>
          </div>

          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 relative">
              <VideoGrid
                participants={participants}
                localStream={localStream}
                remoteStreams={remoteStreams}
                currentUserId={currentUser?.id ?? ""}
              />
            </div>

            {(showChat || showParticipants) && (
              <div className="w-80 border-l border-gray-700 flex flex-col">
                {showChat && (
                  <ChatPanel
                    messages={messages}
                    onSendMessage={(msg) =>
                      socket.emit("chat:send", {
                        roomId: realRoomId,
                        userId: currentUser!.id,
                        userName: currentUser!.name,
                        userAvatar: currentUser!.avatar,
                        message: msg,
                      })
                    }
                    currentUserId={currentUser!.id}
                  />
                )}

                {showParticipants && (
                  <ParticipantsPanel
                    participants={participants}
                    currentUserId={currentUser!.id}
                  />
                )}
              </div>
            )}
          </div>

          <ControlBar
            isMuted={isMuted}
            isVideoOn={isVideoOn}
            isScreenSharing={isScreenShare}
            onToggleMic={() => setIsMuted(!isMuted)}
            onToggleVideo={() => setIsVideoOn(!isVideoOn)}
            onToggleScreenShare={() => setIsScreenShare(!isScreenShare)}  // ⭐ FIXED
            onToggleChat={() => {
              setShowChat(!showChat);
              setShowParticipants(false);
            }}
            onToggleParticipants={() => {
              setShowParticipants(!showParticipants);
              setShowChat(false);
            }}
            onLeave={() => router.push("/")}
          />
        </>
      )}
    </div>
  );
}
