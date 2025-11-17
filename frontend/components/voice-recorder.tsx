"use client";

import { useState, useRef, useEffect, useMemo } from "react";

import { uploadVoiceRecording } from "@/lib/api-client";

interface VoiceRecorderProps {
  userName?: string;
  onRecordingComplete?: (audioBlob: Blob) => void;
  onUploadSuccess?: (response: { filename?: string; size?: number }) => void;
  onUploadError?: (error: Error) => void;
}

const GREETINGS = [
  "Hello",
  "Hola",
  "Bonjour",
  "Ciao",
  "Hallo",
  "Olá",
  "Namaste",
  "Konnichiwa",
  "Salaam",
  "Shalom",
];

export function VoiceRecorder({
  userName,
  onRecordingComplete,
  onUploadSuccess,
  onUploadError,
}: VoiceRecorderProps) {
  // Randomly select a greeting on component mount
  const greeting = useMemo(
    () => GREETINGS[Math.floor(Math.random() * GREETINGS.length)],
    [],
  );
  const [isRecording, setIsRecording] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Set up audio analyser for visualization
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Start visualizing audio levels
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateAudioLevel = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average / 255); // Normalize to 0-1
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
        }
      };
      updateAudioLevel();

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        onRecordingComplete?.(audioBlob);

        // Clean up
        stream.getTracks().forEach((track) => track.stop());
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        setAudioLevel(0);

        // Upload to backend
        setIsUploading(true);
        setUploadStatus("idle");
        try {
          const response = await uploadVoiceRecording(audioBlob);
          setUploadStatus("success");
          onUploadSuccess?.(response);

          // Reset status after 3 seconds
          setTimeout(() => {
            setUploadStatus("idle");
            setIsUploading(false);
          }, 3000);
        } catch (error) {
          console.error("Failed to upload recording:", error);
          setUploadStatus("error");
          onUploadError?.(error as Error);

          // Reset status after 3 seconds
          setTimeout(() => {
            setUploadStatus("idle");
            setIsUploading(false);
          }, 3000);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Please allow microphone access to record audio");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleMouseDown = () => {
    setIsHolding(true);
    startRecording();
  };

  const handleMouseUp = () => {
    setIsHolding(false);
    stopRecording();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsHolding(true);
    startRecording();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsHolding(false);
    stopRecording();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRecording]);

  // Calculate dynamic styles based on state
  const orbSize = isHolding ? 220 : 180;
  const glowIntensity = isHolding ? 85 + audioLevel * 15 : 60;
  const pulseScale = isRecording ? 1 + audioLevel * 0.4 : 1;

  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center">
      {/* Greeting */}
      {userName && (
        <h1 className="mb-12 text-6xl font-extralight tracking-wide text-white drop-shadow-lg">
          {greeting} {userName}
        </h1>
      )}

      {/* Orb container */}
      <div className="relative flex items-center justify-center animate-float">
        {/* Outer glow rings - always visible, more intense when recording */}
        <div
          className="absolute animate-pulse-glow-outer transition-all duration-500"
          style={{
            width: orbSize * 2,
            height: orbSize * 2,
            left: "50%",
            top: "50%",
            transform: `translate(-50%, -50%) scale(${isRecording ? pulseScale * 1.2 : 1})`,
          }}
        >
          <div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/30 to-blue-500/30 blur-3xl"
            style={{
              opacity: isRecording ? 0.8 : 0.4,
            }}
          />
        </div>

        {/* Middle glow ring - always visible */}
        <div
          className="absolute animate-pulse-glow transition-all duration-300"
          style={{
            width: orbSize * 1.5,
            height: orbSize * 1.5,
            left: "50%",
            top: "50%",
            transform: `translate(-50%, -50%) scale(${isRecording ? pulseScale : 1})`,
          }}
        >
          <div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400/40 to-blue-400/40 blur-2xl"
            style={{ opacity: glowIntensity / 100 }}
          />
        </div>

        {/* Main orb */}
        <button
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className={`relative cursor-pointer select-none rounded-full transition-all duration-300 ${
            isHolding ? "scale-110" : "scale-100 hover:scale-105"
          }`}
          style={{
            width: orbSize,
            height: orbSize,
            transform: isRecording ? `scale(${1.1 * pulseScale})` : undefined,
          }}
          aria-label="Voice recorder"
        >
          {/* Gradient background with enhanced colors when recording */}
          <div
            className={`absolute inset-0 rounded-full transition-all duration-300 ${
              isRecording
                ? "bg-gradient-to-br from-purple-400 via-blue-400 to-cyan-400 opacity-100"
                : "bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 opacity-90"
            }`}
          />

          {/* Shimmer effect - always animating */}
          <div className="absolute inset-0 overflow-hidden rounded-full">
            <div
              className={`absolute -inset-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer`}
              style={{
                animationDuration: isRecording ? "1.5s" : "3s",
              }}
            />
          </div>

          {/* Inner glow - pulsates with audio or gentle pulse when idle */}
          <div
            className="absolute inset-4 rounded-full bg-gradient-to-br from-white/50 to-transparent blur-md transition-opacity duration-200"
            style={{ opacity: isRecording ? 0.7 + audioLevel * 0.3 : 0.5 }}
          />

          {/* Center core - pulsing dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={`rounded-full bg-white transition-all duration-200 ${
                isRecording ? "animate-pulse" : ""
              }`}
              style={{
                width: isRecording ? 16 + audioLevel * 24 : 12,
                height: isRecording ? 16 + audioLevel * 24 : 12,
                opacity: isRecording ? 0.9 : 0.7,
                boxShadow: isRecording
                  ? `0 0 ${20 + audioLevel * 30}px rgba(255, 255, 255, 0.8)`
                  : "0 0 15px rgba(255, 255, 255, 0.5)",
              }}
            />
          </div>

          {/* Audio visualization bars - only when recording */}
          {isRecording && (
            <div className="absolute inset-0 flex items-center justify-center gap-1">
              {[...Array(7)].map((_, i) => {
                const offset = (i - 3) * 30; // Spread bars in a circle
                const angle = (offset * Math.PI) / 180;
                const distance = 50 + audioLevel * 20;
                return (
                  <div
                    key={i}
                    className="absolute w-1 rounded-full bg-white/60"
                    style={{
                      height: 4 + audioLevel * 25 * (1 + Math.sin(Date.now() / 200 + i) * 0.3),
                      transform: `translate(${Math.sin(angle) * distance}px, ${Math.cos(angle) * distance}px)`,
                      transition: "height 0.1s ease-out",
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* Glass reflection - always visible */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/30 via-transparent to-transparent" />

          {/* Subtle ring highlight */}
          <div
            className="absolute inset-0 rounded-full transition-all duration-300"
            style={{
              boxShadow: isRecording
                ? `inset 0 0 30px rgba(255, 255, 255, ${0.3 + audioLevel * 0.3})`
                : "inset 0 0 20px rgba(255, 255, 255, 0.2)",
            }}
          />
        </button>

        {/* Upload success indicator - subtle glow ring */}
        {uploadStatus === "success" && (
          <div className="absolute inset-0 animate-pulse" style={{ width: orbSize * 2.5, height: orbSize * 2.5 }}>
            <div className="absolute inset-0 rounded-full border-4 border-green-400/50 blur-sm" />
          </div>
        )}

        {/* Upload error indicator - subtle glow ring */}
        {uploadStatus === "error" && (
          <div className="absolute inset-0 animate-pulse" style={{ width: orbSize * 2.5, height: orbSize * 2.5 }}>
            <div className="absolute inset-0 rounded-full border-4 border-red-400/50 blur-sm" />
          </div>
        )}
      </div>
    </div>
  );
}
