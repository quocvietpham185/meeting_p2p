'use client';

import React from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  type?: 'warning' | 'danger' | 'info';
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title = 'Xác nhận',
  message,
  type = 'warning',
  confirmText = 'Đồng ý',
  cancelText = 'Hủy',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  const color = {
    warning: 'text-yellow-600',
    danger: 'text-red-600',
    info: 'text-blue-600',
  }[type];

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-[rgba(255,255,255,0.35)] flex items-center justify-center z-[9998] animate-fadeIn">
      <div className="bg-white w-80 max-w-[90%] rounded-xl shadow-xl p-6 animate-popupScale">
        {/* Title */}
        <h2 className={`text-lg font-semibold text-center ${color}`}>
          {title}
        </h2>

        {/* Message */}
        <p className="text-center text-gray-700 mt-3 text-sm">
          {message}
        </p>

        {/* Buttons */}
        <div className="flex gap-3 mt-5">
          <button
            className="flex-1 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className={`flex-1 py-2 rounded-lg text-white 
              ${type === 'danger' ? 'bg-red-600 hover:bg-red-700' : ''} 
              ${type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' : ''} 
              ${type === 'info' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-popupScale {
          animation: popupScale 0.2s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes popupScale {
          from {
            opacity: 0;
            transform: scale(0.85);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
