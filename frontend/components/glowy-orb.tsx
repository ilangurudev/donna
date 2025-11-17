"use client";

import { useState, useRef, useEffect } from "react";

import { uploadVoiceRecording } from "@/lib/api-client";

interface GlowyOrbProps {
  firstName?: string;
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
  "Konnichiwa",
  "Namaste",
  "Annyeong",
];

export function GlowyOrb({
  firstName,
  onRecordingComplete,
  onUploadSuccess,
  onUploadError,
}: GlowyOrbProps) {
  // Randomly select a greeting on client-side only to avoid hydration mismatch
  const [greeting, setGreeting] = useState<string>("Hello");

  useEffect(() => {
    setGreeting(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
  }, []);

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
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
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

  // Keyboard support for space bar
  useEffect(() => {
    let isKeyHolding = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isKeyHolding) {
        // Prevent default scrolling behavior
        e.preventDefault();
        // Prevent starting if already recording
        if (mediaRecorderRef.current?.state === "recording") {
          return;
        }
        isKeyHolding = true;
        setIsHolding(true);
        startRecording();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space" && isKeyHolding) {
        e.preventDefault();
        isKeyHolding = false;
        setIsHolding(false);
        // Stop recording by checking MediaRecorder state directly (avoids stale closure)
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

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

  // Dynamic sizing and effects
  const orbSize = isHolding ? 320 : 280;
  const glowIntensity = isHolding ? 0.9 + audioLevel * 0.1 : 0.7;
  const pulseScale = isRecording ? 1 + audioLevel * 0.15 : 1;

  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Greeting message */}
      <div className="mt-[25vh] mb-[15vh] text-center">
        <h1 className="text-6xl font-light tracking-wide text-white">
          {greeting} {firstName && <span className="font-normal">{firstName}</span>}
          {firstName && ", "}welcome to Donna!
        </h1>
      </div>

      {/* 3D perspective container */}
      <div className="relative" style={{ perspective: "1000px" }}>
        {/* Outer glow layers - multiple rings for depth */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-700"
          style={{
            width: orbSize * 2.5,
            height: orbSize * 2.5,
            transform: `translate(-50%, -50%) scale(${pulseScale * 1.3})`,
          }}
        >
          <div className="absolute inset-0 animate-smoke-rotate rounded-full bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 blur-[120px]" />
        </div>

        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
          style={{
            width: orbSize * 2,
            height: orbSize * 2,
            transform: `translate(-50%, -50%) scale(${pulseScale * 1.2})`,
          }}
        >
          <div className="absolute inset-0 animate-smoke-pulse rounded-full bg-gradient-to-br from-purple-400/30 via-pink-400/30 to-blue-400/30 blur-[80px]" />
        </div>

        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
          style={{
            width: orbSize * 1.5,
            height: orbSize * 1.5,
            transform: `translate(-50%, -50%) scale(${pulseScale})`,
          }}
        >
          <div
            className="absolute inset-0 animate-smoke-drift rounded-full bg-gradient-to-tr from-purple-300/40 via-pink-300/40 to-blue-300/40 blur-[60px]"
            style={{ opacity: glowIntensity }}
          />
        </div>

        {/* Main orb with 3D rotation */}
        <button
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative cursor-pointer select-none transition-all duration-500"
          style={{
            width: orbSize,
            height: orbSize,
            transform: `
              rotateX(${isHolding ? 5 : 0}deg)
              rotateY(${isHolding ? 5 : 0}deg)
              scale(${isHolding ? 1.15 : 1})
            `,
            transformStyle: "preserve-3d",
          }}
          aria-label="Hold to speak"
        >
          {/* Glass sphere base with 3D effect */}
          <div
            className="absolute inset-0 rounded-full transition-all duration-500"
            style={{
              background: `
                radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8) 0%, transparent 50%),
                radial-gradient(circle at 70% 70%, rgba(147, 51, 234, 0.4) 0%, transparent 70%),
                linear-gradient(135deg,
                  rgba(147, 51, 234, 0.6) 0%,
                  rgba(236, 72, 153, 0.6) 33%,
                  rgba(59, 130, 246, 0.6) 66%,
                  rgba(147, 51, 234, 0.6) 100%
                )
              `,
              boxShadow: `
                inset -20px -20px 60px rgba(0, 0, 0, 0.5),
                inset 20px 20px 60px rgba(255, 255, 255, 0.1),
                0 0 80px rgba(147, 51, 234, ${glowIntensity * 0.6}),
                0 0 120px rgba(236, 72, 153, ${glowIntensity * 0.4}),
                0 0 160px rgba(59, 130, 246, ${glowIntensity * 0.3})
              `,
              transform: "translateZ(20px)",
            }}
          >
            {/* Animated smoke layers inside the glass */}
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <div className="absolute inset-0 animate-smoke-swirl-1 rounded-full bg-gradient-to-br from-purple-400/50 via-transparent to-pink-400/50 blur-xl" />
              <div className="absolute inset-0 animate-smoke-swirl-2 rounded-full bg-gradient-to-tr from-blue-400/50 via-transparent to-purple-400/50 blur-xl" />
              <div className="absolute inset-0 animate-smoke-swirl-3 rounded-full bg-gradient-to-bl from-pink-400/50 via-transparent to-blue-400/50 blur-xl" />
            </div>

            {/* Enhanced audio visualization when recording */}
            {isRecording && (
              <div className="absolute inset-0 flex items-center justify-center">
                {[...Array(12)].map((_, i) => {
                  const angle = (i * 30 * Math.PI) / 180;
                  const distance = 60 + audioLevel * 40;
                  const heightVariation = 1 + Math.sin(i * 0.5) * 0.4;
                  const height = 3 + audioLevel * 30 * heightVariation;
                  return (
                    <div
                      key={i}
                      className="absolute rounded-full bg-white/70 shadow-lg"
                      style={{
                        width: 2 + audioLevel * 3,
                        height,
                        transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`,
                        transition: "height 0.1s ease-out, width 0.1s ease-out",
                        boxShadow: `0 0 ${10 + audioLevel * 20}px rgba(255, 255, 255, 0.8)`,
                      }}
                    />
                  );
                })}
              </div>
            )}

            {/* Glass reflection overlay */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `
                  linear-gradient(
                    135deg,
                    rgba(255, 255, 255, 0.4) 0%,
                    rgba(255, 255, 255, 0.1) 30%,
                    transparent 50%
                  )
                `,
                transform: "translateZ(30px)",
              }}
            />

            {/* Shimmer effect */}
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <div
                className="absolute -inset-full animate-shimmer-slow bg-gradient-to-r from-transparent via-white/30 to-transparent"
                style={{
                  animationDuration: isRecording ? "2s" : "4s",
                }}
              />
            </div>

            {/* Center light core */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="rounded-full bg-white transition-all duration-200"
                style={{
                  width: isRecording ? 20 + audioLevel * 40 : 16,
                  height: isRecording ? 20 + audioLevel * 40 : 16,
                  opacity: isRecording ? 0.9 : 0.7,
                  boxShadow: `
                    0 0 ${30 + audioLevel * 50}px rgba(255, 255, 255, ${0.9 + audioLevel * 0.1}),
                    0 0 ${50 + audioLevel * 80}px rgba(147, 51, 234, ${0.6 + audioLevel * 0.4}),
                    0 0 ${70 + audioLevel * 100}px rgba(236, 72, 153, ${0.4 + audioLevel * 0.3})
                  `,
                  transform: "translateZ(40px)",
                }}
              />
            </div>
          </div>

          {/* Edge highlight for 3D effect */}
          <div
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              boxShadow: "inset 0 0 40px rgba(255, 255, 255, 0.2)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          />
        </button>

        {/* Upload status indicators */}
        {uploadStatus === "success" && (
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse"
            style={{ width: orbSize * 1.5, height: orbSize * 1.5 }}
          >
            <div className="absolute inset-0 rounded-full border-4 border-green-400/60 blur-sm" />
          </div>
        )}

        {uploadStatus === "error" && (
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse"
            style={{ width: orbSize * 1.5, height: orbSize * 1.5 }}
          >
            <div className="absolute inset-0 rounded-full border-4 border-red-400/60 blur-sm" />
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-12 text-center">
        <p className="text-sm font-light text-white/70">
          Click and hold or press space and hold to speak
        </p>
      </div>
    </div>
  );
}
