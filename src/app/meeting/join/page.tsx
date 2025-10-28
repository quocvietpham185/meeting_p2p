// src/app/meeting/join/page.tsx
'use client';
import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Settings } from 'lucide-react';
import DeviceTest from './DeviceTest';
import DeviceSelector from './DeviceSelector';
import Button from '@/components/common/Button';
import EditText from '@/components/common/EditText';
import { MeetingInfo, JoinSettings } from '@/interfaces/models/join';
import MeetingInfoCard from './MeetingInforCard';

/* -------------------- Component phụ để chứa useSearchParams -------------------- */
function JoinMeetingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const meetingId = searchParams.get('id');

  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [joinSettings, setJoinSettings] = useState<JoinSettings>({
    displayName: 'Guest User',
    audioEnabled: true,
    videoEnabled: true,
    password: '',
  });

  // Mock meeting info
  const [meetingInfo] = useState<MeetingInfo>({
    id: meetingId || 'MTG-123456',
    title: 'Team Standup Meeting',
    organizer: {
      name: 'Nguyễn Văn A',
      avatar: '/images/avatar1.png',
    },
    scheduledTime: 'Today at 15:30',
    participants: 5,
    isLocked: false,
    requiresPassword: false,
  });

  const handleJoin = async () => {
    if (!joinSettings.displayName.trim()) {
      alert('Please enter your name');
      return;
    }

    if (meetingInfo.requiresPassword && !joinSettings.password) {
      alert('Please enter meeting password');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.push(`/meeting/room/${meetingInfo.id}`);
    } catch (error) {
      console.error('Error joining meeting:', error);
      alert('Failed to join meeting');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <MeetingInfoCard meeting={meetingInfo} />

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Device Preview</h3>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings size={20} className="text-gray-600" />
              </button>
            </div>

            <DeviceTest
              audioEnabled={joinSettings.audioEnabled}
              videoEnabled={joinSettings.videoEnabled}
              onAudioToggle={() =>
                setJoinSettings((prev) => ({
                  ...prev,
                  audioEnabled: !prev.audioEnabled,
                }))
              }
              onVideoToggle={() =>
                setJoinSettings((prev) => ({
                  ...prev,
                  videoEnabled: !prev.videoEnabled,
                }))
              }
            />

            {showSettings && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <DeviceSelector />
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8 flex flex-col">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Ready to join?
            </h1>
            <p className="text-gray-600 mb-6">
              Enter your details to join the meeting
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name<span className="text-red-500">*</span>
                </label>
                <EditText
                  type="text"
                  placeholder="Enter your name"
                  value={joinSettings.displayName}
                  onChange={(e) =>
                    setJoinSettings((prev) => ({
                      ...prev,
                      displayName: e.target.value,
                    }))
                  }
                  text_font_size="text-base"
                  text_color="text-gray-900"
                  fill_background_color="bg-white"
                  border_border="border border-gray-300"
                  border_border_radius="rounded-lg"
                  padding="py-3 px-4"
                  className="w-full focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {meetingInfo.requiresPassword && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Password<span className="text-red-500">*</span>
                  </label>
                  <EditText
                    type="password"
                    placeholder="Enter meeting password"
                    value={joinSettings.password}
                    onChange={(e) =>
                      setJoinSettings((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    text_font_size="text-base"
                    text_color="text-gray-900"
                    fill_background_color="bg-white"
                    border_border="border border-gray-300"
                    border_border_radius="rounded-lg"
                    padding="py-3 px-4"
                    className="w-full focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Join with:
                </p>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={joinSettings.audioEnabled}
                      onChange={(e) =>
                        setJoinSettings((prev) => ({
                          ...prev,
                          audioEnabled: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Microphone on</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={joinSettings.videoEnabled}
                      onChange={(e) =>
                        setJoinSettings((prev) => ({
                          ...prev,
                          videoEnabled: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Camera on</span>
                  </label>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  ✓ Your browser is compatible with MeetHub
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <Button
              onClick={handleJoin}
              disabled={isLoading}
              text={isLoading ? 'Joining...' : 'Join Now'}
              text_font_size="text-base"
              text_font_weight="font-semibold"
              text_color="text-white"
              fill_background_color="bg-blue-600"
              border_border_radius="rounded-lg"
              padding="py-3 px-6"
              className="w-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />

            <p className="text-center text-sm text-gray-500">
              By joining, you agree to our{' '}
              <a href="#" className="text-blue-600 hover:underline">
                Terms of Service
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------- Bọc lại bằng Suspense -------------------- */
export default function JoinMeetingPage() {
  return (
    <Suspense fallback={<div>Loading meeting...</div>}>
      <JoinMeetingPageContent />
    </Suspense>
  );
}
