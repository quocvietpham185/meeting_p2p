"use client";

import { useEffect, useRef, useState } from "react";
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

  const [hostId, setHostId] = useState<string | null>(null);

  const mediaControllerRef = useRef<MediaController | null>(null);
  const peerManagerRef = useRef<PeerManager | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  /* ---------------- Load USER + UUID ---------------- */
  useEffect(() => {
    const loadAll = async () => {
      try {
        const [userRes, roomRes] = await Promise.all([
          api.get("/user/me"),
          api.get(`/meetings/by-code/${meetingCode}`)
        ]);

        const meetingId = roomRes.data.data.id;
        let organizerId: string | null = null;
        try {
          const detailRes = await api.get(`/meetings/${meetingId}`);
          organizerId = detailRes.data?.data?.organizer?.id ?? null;
        } catch (detailErr) {
          console.error("Failed to load meeting detail", detailErr);
        }

        setCurrentUser({
          id: userRes.data.data.id,
          name: userRes.data.data.fullName,
          avatar: userRes.data.data.avatar,
        });

        setHostId(organizerId);
        setRealRoomId(meetingId);
      } catch (err) {
        console.error(err);
      }

      setLoading(false);
    };

    loadAll();
  }, [meetingCode]);

  useEffect(() => {
    if (!hostId) return;
    setParticipants((prev) =>
      prev.map((p) => ({
        ...p,
        isHost: p.id === hostId,
      }))
    );
  }, [hostId]);

  /* ---------------- JOIN ROOM ---------------- */
  useEffect(() => {
    if (!realRoomId || !currentUser) return;

    const mediaController =
      mediaControllerRef.current ?? new MediaController();
    mediaControllerRef.current = mediaController;

    const peerManager =
      peerManagerRef.current ??
      new PeerManager([{ urls: "stun:stun.l.google.com:19302" }], {
        onLocalStream: (stream) => setLocalStream(stream),
        onRemoteStream: (socketId, stream) =>
          setRemoteStreams((prev) => ({ ...prev, [socketId]: stream })),
        onPeerDisconnected: (socketId) =>
          setRemoteStreams((prev) => {
            const cp = { ...prev };
            delete cp[socketId];
            return cp;
          }),
      });
    peerManagerRef.current = peerManager;

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

        const stream = await mediaController.init();
        cameraStreamRef.current = stream;
        peerManager.attachLocalStream(stream);
        setIsMuted(false);
        setIsVideoOn(true);

        // Add self
        setParticipants([
          {
            id: currentUser.id,
            socketId: socket.id,
            name: currentUser.name,
            avatar: currentUser.avatar,
            isHost: currentUser.id === hostId,
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
            isHost: u.userId === hostId,
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
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
      peerManager.cleanup();
      socket.disconnect();
    };
  }, [realRoomId, currentUser]);

  const handleToggleMic = () => {
    const media = mediaControllerRef.current;
    if (!media || !currentUser) return;
    const enabled = media.toggleAudio();
    setIsMuted(!enabled);
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === currentUser.id ? { ...p, isMuted: !enabled } : p
      )
    );
  };

  const handleToggleVideo = () => {
    const media = mediaControllerRef.current;
    if (!media || !currentUser) return;
    const enabled = media.toggleVideo();
    setIsVideoOn(enabled);
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === currentUser.id ? { ...p, isVideoOn: enabled } : p
      )
    );
  };

  const stopScreenShare = () => {
    const peerManager = peerManagerRef.current;
    const cameraStream = cameraStreamRef.current;
    if (!peerManager || !cameraStream) return;

    const [camTrack] = cameraStream.getVideoTracks();
    if (camTrack) {
      peerManager.replaceVideoTrack(camTrack);
    }
    setLocalStream(cameraStream);

    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current = null;
    setIsScreenShare(false);
  };

  const handleToggleScreenShare = async () => {
    if (isScreenShare) {
      stopScreenShare();
      return;
    }

    const media = mediaControllerRef.current;
    const peerManager = peerManagerRef.current;
    if (!media || !peerManager) return;

    const screenStream = await media.shareScreen();
    if (!screenStream) return;

    const [screenTrack] = screenStream.getVideoTracks();
    if (!screenTrack) {
      screenStream.getTracks().forEach((t) => t.stop());
      return;
    }

    screenStreamRef.current = screenStream;
    peerManager.replaceVideoTrack(screenTrack);
    setLocalStream(screenStream);
    setIsScreenShare(true);

    screenTrack.onended = () => stopScreenShare();
  };

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
            onToggleMic={handleToggleMic}
            onToggleVideo={handleToggleVideo}
            onToggleScreenShare={handleToggleScreenShare}
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
