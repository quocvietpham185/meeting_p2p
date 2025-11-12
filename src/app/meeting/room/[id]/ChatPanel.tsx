'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage } from '@/interfaces/models/room';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  currentUserId: string;
}

export default function ChatPanel({
  messages,
  onSendMessage,
  currentUserId,
}: ChatPanelProps) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    onSendMessage(newMessage.trim());
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0f172a] text-white w-full rounded-xl overflow-hidden border border-gray-800">
      {/* DANH SÁCH TIN NHẮN */}
      <div
        className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar"
        style={{ maxHeight: 'calc(100vh - 160px)' }}
      >
        <AnimatePresence>
          {messages.map((msg) => {
            const isMine = msg.userId === currentUserId;
            const timeText = msg.timestamp
              ? new Date(msg.timestamp).toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '';

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex items-end gap-3 ${
                  isMine ? 'justify-end' : 'justify-start'
                }`}
              >
                {/* Avatar người khác */}
                {!isMine && (
                  <Image
                    src={msg.userAvatar || '/default-avatar.png'}
                    alt={msg.userName}
                    width={36}
                    height={36}
                    className="rounded-full flex-shrink-0 border border-gray-700"
                  />
                )}

                {/* Nội dung */}
                <div
                  className={`flex flex-col ${
                    isMine ? 'items-end' : 'items-start'
                  } max-w-[75%]`}
                >
                  <div
                    className={`flex items-center gap-2 mb-1 ${
                      isMine ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <span className="text-xs font-semibold text-gray-300">
                      {msg.userName || 'Người dùng'}
                    </span>
                    <span className="text-[10px] text-gray-500">{timeText}</span>
                  </div>
                  <motion.div
                    className={`px-4 py-2 rounded-2xl text-sm leading-relaxed shadow-sm break-words ${
                      isMine
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-gray-700 text-gray-100 rounded-bl-none'
                    }`}
                  >
                    {msg.message}
                  </motion.div>
                </div>

                {/* Avatar của tôi */}
                {isMine && (
                  <Image
                    src={msg.userAvatar || '/default-avatar.png'}
                    alt={msg.userName}
                    width={36}
                    height={36}
                    className="rounded-full flex-shrink-0 border border-gray-700"
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* THANH NHẬP TIN NHẮN */}
      <div className="p-4 bg-gray-900 border-t border-gray-800">
        <div className="flex items-center gap-3 max-w-5xl mx-auto w-full">
          <input
            type="text"
            placeholder="Nhập tin nhắn..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1 px-4 py-3 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm placeholder-gray-400"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50 flex items-center justify-center"
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* Custom Scrollbar CSS */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #334155, #1e293b);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #475569, #334155);
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0f172a;
        }
      `}</style>
    </div>
  );
}
