// src/app/meeting/join/DeviceSelector.tsx

'use client';
import React, { useState, useEffect } from 'react';
import { Camera, Mic, Volume2 } from 'lucide-react';

interface DeviceSelectorProps {
  onDeviceChange?: (type: string, deviceId: string) => void;
}

export default function DeviceSelector({ onDeviceChange }: DeviceSelectorProps) {
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [speakers, setSpeakers] = useState<MediaDeviceInfo[]>([]);

  // ✅ Sử dụng IIFE trong useEffect để tránh lỗi "setState in effect"
  useEffect(() => {
    (async () => {
      try {
        // Yêu cầu quyền truy cập để có label đầy đủ
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true });

        const devices = await navigator.mediaDevices.enumerateDevices();

        setCameras(devices.filter((d) => d.kind === 'videoinput'));
        setMicrophones(devices.filter((d) => d.kind === 'audioinput'));
        setSpeakers(devices.filter((d) => d.kind === 'audiooutput'));
      } catch (error) {
        console.error('Error getting devices:', error);
      }
    })();
  }, []);

  return (
    <div className="space-y-4">
      {/* Camera */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Camera size={16} />
          Camera
        </label>
        <select
          onChange={(e) => onDeviceChange?.('camera', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        >
          {cameras.length > 0 ? (
            cameras.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${device.deviceId.slice(0, 5)}`}
              </option>
            ))
          ) : (
            <option disabled>Không phát hiện camera</option>
          )}
        </select>
      </div>

      {/* Microphone */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Mic size={16} />
          Microphone
        </label>
        <select
          onChange={(e) => onDeviceChange?.('microphone', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        >
          {microphones.length > 0 ? (
            microphones.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Microphone ${device.deviceId.slice(0, 5)}`}
              </option>
            ))
          ) : (
            <option disabled>Không phát hiện micro</option>
          )}
        </select>
      </div>

      {/* Speaker */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Volume2 size={16} />
          Speaker
        </label>
        <select
          onChange={(e) => onDeviceChange?.('speaker', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        >
          {speakers.length > 0 ? (
            speakers.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Speaker ${device.deviceId.slice(0, 5)}`}
              </option>
            ))
          ) : (
            <option disabled>Không phát hiện loa</option>
          )}
        </select>
      </div>
    </div>
  );
}
