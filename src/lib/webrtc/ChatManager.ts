// src/lib/webrtc/ChatManager.ts
import { socket } from '@/lib/socket';
import { ChatMessage } from '@/interfaces/models/room';

type ChatUpdateHandler = (messages: ChatMessage[]) => void;

export class ChatManager {
  private roomId: string;
  private userId: string;
  private userName: string;
  private userAvatar: string; // ép kiểu rõ ràng, không optional
  private messages: ChatMessage[] = [];
  private onUpdateHandler?: ChatUpdateHandler;

  constructor(roomId: string, userId: string, userName: string, userAvatar?: string) {
    this.roomId = roomId;
    this.userId = userId;
    this.userName = userName;
    this.userAvatar = userAvatar ?? ''; // 👈 đảm bảo luôn là string, tránh undefined

    socket.on('chat:new', (msg: ChatMessage) => {
      this.messages.push(msg);
      this.onUpdateHandler?.([...this.messages]);
    });
  }

  /** Cập nhật callback mỗi khi có tin nhắn mới */
  onUpdate(handler: ChatUpdateHandler): void {
    this.onUpdateHandler = handler;
  }

  /** Gửi tin nhắn qua socket */
  sendMessage(message: string): void {
  if (!message.trim()) return;

  const msg: ChatMessage = {
    id: crypto.randomUUID(), // ✅ tạo ID tạm để React render ổn định
    roomId: this.roomId,
    userId: this.userId,
    userName: this.userName,
    userAvatar: this.userAvatar,
    message,
    timestamp: new Date().toISOString(), // ✅ thêm timestamp hợp lệ
  };

  socket.emit('chat:send', msg);
  this.messages.push(msg);
  this.onUpdateHandler?.([...this.messages]);
}


  /** Xóa listener khi rời phòng */
  clear(): void {
    socket.off('chat:new');
    this.messages = [];
  }
}
