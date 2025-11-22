'use client';
import React from 'react';
import { Loader2 } from 'lucide-react';

interface NotificationPopupProps {
  open: boolean;
  type?: 'success' | 'error' | 'warning' | 'info' | 'loading';
  message: string;
  onClose: () => void;
}

export default function NotificationPopup({
  open,
  type = 'success',
  message,
  onClose,
}: NotificationPopupProps) {
  if (!open) return null;

  // 🎨 Style mapping theo type
  const styles: Record<
    Required<NotificationPopupProps>['type'],
    { bg: string; border: string; text: string; icon: React.ReactNode }
  > = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-300',
      text: 'text-green-800',
      icon: <span className="text-xl">✔️</span>,
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-300',
      text: 'text-red-800',
      icon: <span className="text-xl">❌</span>,
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-300',
      text: 'text-yellow-800',
      icon: <span className="text-xl">⚠️</span>,
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-300',
      text: 'text-blue-800',
      icon: <span className="text-xl">ℹ️</span>,
    },
    loading: {
      bg: 'bg-gray-50',
      border: 'border-gray-300',
      text: 'text-gray-800',
      icon: <Loader2 className="animate-spin w-5 h-5" />,
    },
  };

  const s = styles[type];

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] animate-toast">
      <div
        className={`px-4 py-3 rounded-lg shadow-lg border flex items-center gap-3 min-w-[260px] max-w-[90vw] ${s.bg} ${s.border} ${s.text}`}
      >
        {/* Icon */}
        <div>{s.icon}</div>

        {/* Message */}
        <span className="text-sm font-medium leading-tight">
          {message}
        </span>

        {/* Close button */}
        {type !== 'loading' && (
          <button
            onClick={onClose}
            className="ml-auto text-gray-500 hover:text-gray-700 text-lg leading-none"
          >
            ×
          </button>
        )}
      </div>

      {/* Animation */}
      <style jsx>{`
        .animate-toast {
          animation: slideDown 0.25s ease-out;
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -10px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
    </div>
  );
}
