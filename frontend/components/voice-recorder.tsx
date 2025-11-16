"use client";

import { useState, useRef, useEffect } from "react";

import { uploadVoiceRecording } from "@/lib/api-client";

interface VoiceRecorderProps {
  onRecordingComplete?: (audioBlob: Blob) => void;
  onUploadSuccess?: (response: { filename?: string; size?: number }) => void;
  onUploadError?: (error: Error) => void;
}

export function VoiceRecorder({
  onRecordingComplete,
  onUploadSuccess,
  onUploadError,
}: VoiceRecorderProps) {
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
  const orbSize = isHolding ? 200 : 160;
  const glowIntensity = isHolding ? 80 + audioLevel * 40 : 40;
  const pulseScale = 1 + audioLevel * 0.3;

  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center">
      {/* Instruction text */}
      <p className="mb-8 text-center text-sm font-medium text-neutral-600">
        {isRecording ? "Recording... Release to send" : "Touch and hold to record"}
      </p>

      {/* Orb container */}
      <div className="relative flex items-center justify-center">
        {/* Outer glow rings */}
        <div
          className={`absolute inset-0 transition-all duration-300 ${
            isHolding ? "opacity-100" : "opacity-0"
          }`}
          style={{
            width: orbSize * 1.8,
            height: orbSize * 1.8,
            left: "50%",
            top: "50%",
            transform: `translate(-50%, -50%) scale(${pulseScale})`,
          }}
        >
          <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-xl" />
        </div>

        {/* Middle glow ring */}
        <div
          className="absolute transition-all duration-200"
          style={{
            width: orbSize * 1.4,
            height: orbSize * 1.4,
            left: "50%",
            top: "50%",
            transform: `translate(-50%, -50%) scale(${pulseScale})`,
          }}
        >
          <div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400/30 to-blue-400/30 blur-2xl"
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
          className={`relative cursor-pointer select-none rounded-full transition-all duration-200 ${
            isHolding ? "scale-110" : "scale-100 hover:scale-105"
          }`}
          style={{
            width: orbSize,
            height: orbSize,
            transform: isRecording ? `scale(${1.1 * pulseScale})` : undefined,
          }}
        >
          {/* Gradient background */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 opacity-90" />

          {/* Shimmer effect */}
          <div className="absolute inset-0 overflow-hidden rounded-full">
            <div
              className={`absolute -inset-full bg-gradient-to-r from-transparent via-white/30 to-transparent ${
                isHolding ? "animate-shimmer" : ""
              }`}
            />
          </div>

          {/* Inner glow */}
          <div
            className="absolute inset-4 rounded-full bg-gradient-to-br from-white/40 to-transparent blur-md"
            style={{ opacity: 0.6 + audioLevel * 0.4 }}
          />

          {/* Center icon/indicator */}
          <div className="absolute inset-0 flex items-center justify-center">
            {isRecording ? (
              <div className="flex flex-col items-center gap-2">
                <div className="h-12 w-12 animate-pulse rounded-full bg-white/90" />
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 rounded-full bg-white/80"
                      style={{
                        height: 8 + audioLevel * 20 * (1 + Math.sin(i) * 0.5),
                        transition: "height 0.1s ease-out",
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <svg
                className="h-16 w-16 text-white/90"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            )}
          </div>

          {/* Glass reflection */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/30 via-transparent to-transparent" />
        </button>
      </div>

      {/* Status indicator */}
      {isRecording && (
        <div className="mt-8 flex items-center gap-2">
          <div className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
          <span className="text-sm font-medium text-neutral-700">Recording</span>
        </div>
      )}

      {/* Upload status */}
      {isUploading && uploadStatus === "idle" && (
        <div className="mt-8 flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-blue-500" />
          <span className="text-sm font-medium text-neutral-700">Uploading...</span>
        </div>
      )}

      {uploadStatus === "success" && (
        <div className="mt-8 flex items-center gap-2">
          <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium text-green-700">Uploaded successfully!</span>
        </div>
      )}

      {uploadStatus === "error" && (
        <div className="mt-8 flex items-center gap-2">
          <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          <span className="text-sm font-medium text-red-700">Upload failed. Please try again.</span>
        </div>
      )}
    </div>
  );
}
