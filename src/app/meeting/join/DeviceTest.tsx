'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, Mic } from 'lucide-react';

interface DeviceTestProps {
  audioEnabled: boolean;
  videoEnabled: boolean;
  onAudioToggle: () => void;
  onVideoToggle: () => void;
}

export default function DeviceTest({
  audioEnabled,
  videoEnabled,
  onAudioToggle,
  onVideoToggle,
}: DeviceTestProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  // 🎥 Start Video
  const startVideo = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  }, []);

  // 🧱 Stop Video
  const stopVideo = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  // 🎙️ Start Audio Monitor
  const startAudioMonitor = useCallback(async () => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(audioStream);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      microphone.connect(analyser);
      analyser.fftSize = 256;

      let rafId: number;

      const updateLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel(Math.min(100, (average / 128) * 100));
        rafId = requestAnimationFrame(updateLevel);
      };

      updateLevel();

      return () => {
        cancelAnimationFrame(rafId);
        audioStream.getTracks().forEach((t) => t.stop());
        audioContext.close();
      };
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  }, []);

  // 🎬 Effect: handle video state
  useEffect(() => {
  let isMounted = true; // để tránh setState sau khi unmount

  const handleVideo = async () => {
    if (!isMounted) return;
    try {
      if (videoEnabled) {
        await startVideo();
      } else {
        await stopVideo();
      }
    } catch (error) {
      console.error('Error handling video:', error);
    }
  };

  // Gọi async function sau khi render hoàn tất
  handleVideo();

  return () => {
    isMounted = false;
    stopVideo();
  };
}, [videoEnabled, startVideo, stopVideo]);

  // 🎧 Effect: handle mic level
  useEffect(() => {
    if (!audioEnabled) return;
    let cleanup: (() => void) | undefined;

    startAudioMonitor().then((fn) => {
      if (typeof fn === 'function') cleanup = fn;
    });

    return () => cleanup?.();
  }, [audioEnabled, startAudioMonitor]);

  return (
    <div className="space-y-4">
      {/* Video Preview */}
      <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden">
        {videoEnabled ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera size={40} className="text-gray-400" />
              </div>
              <p className="text-gray-400 text-sm">Camera is off</p>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
          <button
            onClick={onAudioToggle}
            className={`p-3 rounded-full transition-colors ${
              audioEnabled
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            <Mic size={20} className="text-white" />
          </button>

          <button
            onClick={onVideoToggle}
            className={`p-3 rounded-full transition-colors ${
              videoEnabled
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            <Camera size={20} className="text-white" />
          </button>
        </div>
      </div>

      {/* Audio Level Indicator */}
      {audioEnabled && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Mic size={18} className="text-gray-600" />
            <div className="flex-1">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-100"
                  style={{ width: `${audioLevel}%` }}
                />
              </div>
            </div>
            <span className="text-xs text-gray-600">Mic test</span>
          </div>
        </div>
      )}
    </div>
  );
}
