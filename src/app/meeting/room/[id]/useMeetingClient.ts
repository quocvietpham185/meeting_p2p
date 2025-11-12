'use client';
import { useEffect, useRef, useState } from 'react';
import { socket } from '@/lib/socket';
import { Participant } from '@/interfaces/models/room';

interface PeerInfo {
  socketId: string;
  userId: string;
  userName: string;
  avatar?: string;
}

interface JoinRoomResponse {
  success: boolean;
  peers?: PeerInfo[];
}

interface UseMeetingClientOptions {
  roomId: string;
  userId: string;
  userName: string;
  avatar?: string;
}

export function useMeetingClient({
  roomId,
  userId,
  userName,
  avatar,
}: UseMeetingClientOptions) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const remoteStreams = useRef<Map<string, MediaStream>>(new Map());

  const iceServers: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: [
        process.env.NEXT_PUBLIC_TURN_URL ?? '',
        process.env.NEXT_PUBLIC_TURNS_URL ?? '',
      ].filter(Boolean),
      username: process.env.NEXT_PUBLIC_TURN_USER ?? '',
      credential: process.env.NEXT_PUBLIC_TURN_PASS ?? '',
    },
  ];

  /** Lấy camera & mic */
  async function initLocalStream(): Promise<MediaStream | undefined> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error('Không thể truy cập camera/mic:', err);
      return undefined;
    }
  }

  /** Tạo kết nối WebRTC */
  async function createPeerConnection(socketId: string): Promise<RTCPeerConnection> {
    let pc = peerConnections.current.get(socketId);
    if (!pc) {
      pc = new RTCPeerConnection({ iceServers });
      peerConnections.current.set(socketId, pc);

      if (localStream) {
        localStream.getTracks().forEach((track) => pc!.addTrack(track, localStream));
      }

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit('signal-candidate', {
            to: socketId,
            from: socket.id,
            candidate: e.candidate,
          });
        }
      };

      pc.ontrack = (e) => {
        const remoteStream = e.streams[0];
        remoteStreams.current.set(socketId, remoteStream);
        console.log('Nhận stream remote từ', socketId);
      };
    }
    return pc;
  }

  /** Gửi offer */
  async function createOffer(socketId: string) {
    const pc = await createPeerConnection(socketId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit('signal-offer', { to: socketId, from: socket.id, sdp: offer });
  }

  /** Kết nối socket & xử lý signaling */
  useEffect(() => {
    socket.connect();

    socket.emit(
      'join-room',
      { roomId, userId, userName, avatar },
      async (res: JoinRoomResponse) => {
        if (res.success && res.peers) {
          const mySelf: Participant = {
            id: userId,
            name: userName,
            avatar: avatar ?? '',
            isHost: true,
            isMuted: false,
            isVideoOn: true,
            isSpeaking: false,
          };
          const others: Participant[] = res.peers.map((p) => ({
            id: p.userId,
            name: p.userName,
            avatar: p.avatar ?? '',
            isHost: false,
            isMuted: false,
            isVideoOn: true,
            isSpeaking: false,
          }));
          setParticipants([mySelf, ...others]);

          await initLocalStream();
          for (const peer of res.peers) await createOffer(peer.socketId);
        }
      }
    );

    socket.on(
      'peer-joined',
      async ({ socketId, userId: uid, userName: uname, avatar: uavatar }: PeerInfo) => {
        setParticipants((prev) => [
          ...prev,
          {
            id: uid,
            name: uname,
            avatar: uavatar ?? '',
            isHost: false,
            isMuted: false,
            isVideoOn: true,
            isSpeaking: false,
          },
        ]);
        await createOffer(socketId);
      }
    );

    socket.on(
      'signal-offer',
      async ({ from, sdp }: { from: string; sdp: RTCSessionDescriptionInit }) => {
        const pc = await createPeerConnection(from);
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('signal-answer', { to: from, from: socket.id, sdp: answer });
      }
    );

    socket.on(
      'signal-answer',
      async ({ from, sdp }: { from: string; sdp: RTCSessionDescriptionInit }) => {
        const pc = peerConnections.current.get(from);
        if (pc) await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      }
    );

    socket.on(
      'signal-candidate',
      async ({ from, candidate }: { from: string; candidate: RTCIceCandidateInit }) => {
        const pc = peerConnections.current.get(from);
        if (pc && candidate) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (err) {
            console.warn('Lỗi add ICE candidate:', err);
          }
        }
      }
    );

    socket.on('peer-left', ({ userId: uid }: { userId: string }) => {
      setParticipants((prev) => prev.filter((p) => p.id !== uid));
      const pc = peerConnections.current.get(uid);
      pc?.close();
      peerConnections.current.delete(uid);
    });

    return () => {
      socket.emit('leave-room');
      socket.disconnect();
      peerConnections.current.forEach((pc) => pc.close());
      peerConnections.current.clear();
    };
  }, [roomId, userId]);

  return { participants, localStream, initLocalStream };
}
