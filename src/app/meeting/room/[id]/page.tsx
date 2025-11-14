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

  const [popup, setPopup] = useState<{
    type: "join" | "leave";
    name: string;
  } | null>(null);

  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    avatar: string;
  } | null>(null);

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenShare, setIsScreenShare] = useState(false);

  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  /* ---------------- Load USER + UUID ---------------- */
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

        setRealRoomId(roomRes.data.data.id);
      } catch (err) {
        console.error(err);
      }

      setLoading(false);
    };

    loadAll();
  }, [meetingCode]);

  /* ---------------- JOIN ROOM ---------------- */
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
        if (!res.success) return;

        await mediaController.init();
        await peerManager.initLocalStream();

        // Add self
        setParticipants([
          {
            id: currentUser.id,
            socketId: socket.id,
            name: currentUser.name,
            avatar: currentUser.avatar,
            isHost: true,
            isMuted: false,
            isVideoOn: true,
            isSpeaking: false,
          }
        ]);

        if (res.messages) setMessages(res.messages);

        // Call existing peers
        res.peers.forEach((p) => peerManager.createOffer(p.socketId));
      }
    );

    /* ---------------- USER JOINED ---------------- */
    socket.on("user-joined", (u) => {
      setParticipants((prev) => {
        if (prev.some((p) => p.id === u.userId)) return prev;

        return [
          ...prev,
          {
            id: u.userId,
            socketId: u.socketId,
            name: u.userName,
            avatar: u.avatar ?? "",
            isHost: false,
            isMuted: false,
            isVideoOn: true,
            isSpeaking: false,
          },
        ];
      });

      setPopup({ type: "join", name: u.userName });
      setTimeout(() => setPopup(null), 5000);

      peerManager.createOffer(u.socketId);
    });

    /* ---------------- USER LEFT ---------------- */
    socket.on("user-left", ({ socketId }) => {
      // Remove remote stream
      setRemoteStreams((prev) => {
        const cp = { ...prev };
        delete cp[socketId];
        return cp;
      });

      // Remove participant
      setParticipants((prev) => prev.filter((p) => p.id !== socketId && p.socketId !== socketId));

      setPopup({ type: "leave", name: "Một người dùng" });
      setTimeout(() => setPopup(null), 5000);
    });

    /* ---------------- SIGNALING ---------------- */
    socket.on("signal-offer", async ({ from, sdp }) =>
      peerManager.handleOffer(from, sdp)
    );
    socket.on("signal-answer", async ({ from, sdp }) =>
      peerManager.handleAnswer(from, sdp)
    );
    socket.on("signal-candidate", async ({ from, candidate }) =>
      peerManager.handleCandidate(from, candidate)
    );

    chatManager.onUpdate((msgs) => setMessages(msgs));

    return () => {
      socket.off("user-joined");
      socket.off("user-left");
      socket.off("signal-offer");
      socket.off("signal-answer");
      socket.off("signal-candidate");

      chatManager.clear();
      mediaController.stopAll();
      peerManager.cleanup();
      socket.disconnect();
    };
  }, [realRoomId, currentUser]);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">

      {/* ⭐ Popup góc phải dưới */}
      {popup && (
        <div className="absolute bottom-4 right-4 bg-gray-800 px-4 py-3 rounded-lg shadow-lg text-white animate-fade-in">
          {popup.type === "join"
            ? `${popup.name} đã tham gia phòng`
            : `${popup.name} đã rời phòng`}
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-lg">
          Đang tải phòng họp...
        </div>
      ) : (
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
            onToggleScreenShare={() => setIsScreenShare(!isScreenShare)}
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
