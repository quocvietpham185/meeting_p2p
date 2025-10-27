// src/app/history/MeetingHistoryCard.tsx

'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import {
  Clock,
  Users,
  Download,
  Eye,
  MoreVertical,
  Calendar,
  Video,
  FileText,
  Trash2,
  Share2,
} from 'lucide-react';
import { MeetingHistory } from '@/interfaces/models/history';

interface MeetingHistoryCardProps {
  meeting: MeetingHistory;
  onDownload?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  onDelete?: (id: string) => void;
  onShare?: (id: string) => void;
}

export default function MeetingHistoryCard({
  meeting,
  onDownload,
  onViewDetails,
  onDelete,
  onShare,
}: MeetingHistoryCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const getStatusColor = () => {
    switch (meeting.status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'no-show':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = () => {
    switch (meeting.status) {
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'no-show':
        return 'No Show';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 text-base">
              {meeting.title}
            </h3>
            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor()}`}>
              {getStatusText()}
            </span>
            {meeting.isRecorded && (
              <div className="flex items-center gap-1 text-red-600 text-xs">
                <Video size={14} />
                <span>Recorded</span>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500">ID: {meeting.meetingId}</p>
        </div>

        {/* More Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical size={18} className="text-gray-600" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-10 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                <button
                  onClick={() => {
                    onViewDetails?.(meeting.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Eye size={16} />
                  View details
                </button>
                {meeting.isRecorded && (
                  <button
                    onClick={() => {
                      onDownload?.(meeting.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Download size={16} />
                    Download recording
                  </button>
                )}
                <button
                  onClick={() => {
                    onShare?.(meeting.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Share2 size={16} />
                  Share
                </button>
                <div className="border-t border-gray-200 my-1" />
                <button
                  onClick={() => {
                    onDelete?.(meeting.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Meeting Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar size={16} />
          <span>{meeting.date}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Clock size={16} />
          <span>{meeting.startTime} - {meeting.endTime}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Clock size={16} />
          <span>{meeting.duration}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Users size={16} />
          <span>{meeting.participantCount} participants</span>
        </div>
      </div>

      {/* Participants */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center">
          {meeting.participants.slice(0, 4).map((participant, idx) => (
            <Image
              key={participant.id}
              src={participant.avatar}
              alt={participant.name}
              width={32}
              height={32}
              className="rounded-full border-2 border-white"
              style={{ marginLeft: idx > 0 ? '-8px' : '0' }}
            />
          ))}
          {meeting.participantCount > 4 && (
            <div
              className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600"
              style={{ marginLeft: '-8px' }}
            >
              +{meeting.participantCount - 4}
            </div>
          )}
        </div>
        <span className="text-sm text-gray-600">
          Organized by {meeting.organizer.name}
        </span>
      </div>

      {/* Recording Info */}
      {meeting.isRecorded && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video size={16} className="text-blue-600" />
              <span className="text-sm text-blue-900 font-medium">
                Recording available
              </span>
              {meeting.recordingSize && (
                <span className="text-xs text-blue-600">
                  ({meeting.recordingSize})
                </span>
              )}
            </div>
            <button
              onClick={() => onDownload?.(meeting.id)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <Download size={14} />
              Download
            </button>
          </div>
        </div>
      )}

      {/* Transcript */}
      {meeting.transcriptAvailable && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FileText size={16} />
          <span>Transcript available</span>
        </div>
      )}

      {/* Tags */}
      {meeting.tags && meeting.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {meeting.tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={() => onViewDetails?.(meeting.id)}
          className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 flex items-center justify-center gap-2"
        >
          <Eye size={16} />
          View Details
        </button>
        {meeting.isRecorded && (
          <button
            onClick={() => onDownload?.(meeting.id)}
            className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm font-medium text-white flex items-center justify-center gap-2"
          >
            <Download size={16} />
            Download
          </button>
        )}
      </div>
    </div>
  );
}
