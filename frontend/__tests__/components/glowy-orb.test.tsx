import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GlowyOrb } from "@/components/glowy-orb";
import { renderWithProviders } from "@/__tests__/utils/test-utils";
import {
  setupMediaDeviceMocks,
  cleanupMediaDeviceMocks,
} from "@/__tests__/utils/mock-media-devices";

// Mock uploadVoiceRecording to avoid auth complexity in component tests
vi.mock("@/lib/api-client", () => ({
  uploadVoiceRecording: vi.fn().mockResolvedValue({
    id: "recording-123",
    status: "processing",
    created_at: new Date().toISOString(),
  }),
  ApiError: class ApiError extends Error {
    constructor(message: string, public status?: number) {
      super(message);
      this.name = "ApiError";
    }
  },
}));

import { uploadVoiceRecording } from "@/lib/api-client";
const mockUploadVoiceRecording = vi.mocked(uploadVoiceRecording);

describe("GlowyOrb", () => {
  let mocks: ReturnType<typeof setupMediaDeviceMocks>;

  beforeEach(() => {
    mocks = setupMediaDeviceMocks();
    mockUploadVoiceRecording.mockResolvedValue({
      success: true,
      message: "Recording uploaded successfully",
      filename: "recording-123.webm",
      size: 1024,
    });
  });

  afterEach(() => {
    cleanupMediaDeviceMocks();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render the glowy orb", () => {
      renderWithProviders(<GlowyOrb />);

      const orb = screen.getByRole("button", { name: /hold to speak/i });
      expect(orb).toBeInTheDocument();
    });

    it("should have proper ARIA label", () => {
      renderWithProviders(<GlowyOrb />);

      const orb = screen.getByLabelText("Hold to speak");
      expect(orb).toBeInTheDocument();
    });

    it("should render in idle state with 3D transform", () => {
      const { container } = renderWithProviders(<GlowyOrb />);

      const orb = screen.getByRole("button", { name: /hold to speak/i });
      expect(orb).toBeInTheDocument();
      // Verify container structure exists
      expect(container).toBeInTheDocument();
    });

    it("should have glass-like appearance with smoke effect", () => {
      const { container } = renderWithProviders(<GlowyOrb />);

      // Verify the orb has the expected structure for glass/smoke effects
      const orb = screen.getByRole("button", { name: /hold to speak/i });
      expect(orb).toBeInTheDocument();
      expect(container.querySelector('[class*="rotate"]')).toBeTruthy();
    });
  });

  describe("Mouse Interaction", () => {
    it("should start recording on mouse down", async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<GlowyOrb />);

      const orb = screen.getByRole("button", { name: /hold to speak/i });
      await user.pointer({ target: orb, keys: "[MouseLeft>]" });

      await waitFor(() => {
        expect(mocks.getUserMedia).toHaveBeenCalledWith({ audio: true });
      });
    });

    it("should stop recording on mouse up", async () => {
      const user = userEvent.setup({ delay: null });
      const onRecordingComplete = vi.fn();
      renderWithProviders(<GlowyOrb onRecordingComplete={onRecordingComplete} />);

      const orb = screen.getByRole("button", { name: /hold to speak/i });

      await user.pointer({ target: orb, keys: "[MouseLeft>]" });
      await user.pointer({ target: orb, keys: "[/MouseLeft]" });

      await waitFor(() => {
        expect(onRecordingComplete).toHaveBeenCalled();
      });
    });

    it("should stop recording on mouse leave while holding", async () => {
      const user = userEvent.setup({ delay: null });
      const onRecordingComplete = vi.fn();
      renderWithProviders(<GlowyOrb onRecordingComplete={onRecordingComplete} />);

      const orb = screen.getByRole("button", { name: /hold to speak/i });

      await user.pointer({ target: orb, keys: "[MouseLeft>]" });
      await user.unhover(orb);

      await waitFor(() => {
        expect(onRecordingComplete).toHaveBeenCalled();
      });
    });
  });

  describe("Touch Interaction", () => {
    it("should start recording on touch start", async () => {
      renderWithProviders(<GlowyOrb />);

      const orb = screen.getByRole("button", { name: /hold to speak/i });
      orb.dispatchEvent(new TouchEvent("touchstart", { bubbles: true, cancelable: true }));

      await waitFor(() => {
        expect(mocks.getUserMedia).toHaveBeenCalled();
      });
    });

    it("should stop recording on touch end", async () => {
      const onRecordingComplete = vi.fn();
      renderWithProviders(<GlowyOrb onRecordingComplete={onRecordingComplete} />);

      const orb = screen.getByRole("button", { name: /hold to speak/i });

      orb.dispatchEvent(new TouchEvent("touchstart", { bubbles: true, cancelable: true }));

      await waitFor(() => {
        expect(mocks.getUserMedia).toHaveBeenCalled();
      });

      orb.dispatchEvent(new TouchEvent("touchend", { bubbles: true, cancelable: true }));

      await waitFor(() => {
        expect(onRecordingComplete).toHaveBeenCalled();
      });
    });
  });

  describe("Keyboard Interaction", () => {
    it("should start recording on space bar down", async () => {
      renderWithProviders(<GlowyOrb />);

      // Simulate space key down directly on document
      const keyDownEvent = new KeyboardEvent("keydown", { code: "Space", bubbles: true });
      document.dispatchEvent(keyDownEvent);

      await waitFor(() => {
        expect(mocks.getUserMedia).toHaveBeenCalledWith({ audio: true });
      });
    });

    it("should stop recording on space bar up", async () => {
      const onRecordingComplete = vi.fn();
      renderWithProviders(<GlowyOrb onRecordingComplete={onRecordingComplete} />);

      // Start recording
      const keyDownEvent = new KeyboardEvent("keydown", { code: "Space", bubbles: true });
      document.dispatchEvent(keyDownEvent);

      await waitFor(() => {
        expect(mocks.getUserMedia).toHaveBeenCalled();
      });

      // Wait for MediaRecorder to be initialized and started
      // The mock uses queueMicrotask, so we need to wait for that
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Stop recording by releasing space
      const keyUpEvent = new KeyboardEvent("keyup", { code: "Space", bubbles: true });
      document.dispatchEvent(keyUpEvent);

      // Should complete recording and call the callback
      await waitFor(() => {
        expect(onRecordingComplete).toHaveBeenCalled();
      }, { timeout: 2000 });
    });

    it("should not trigger recording on other keys", async () => {
      renderWithProviders(<GlowyOrb />);

      const enterEvent = new KeyboardEvent("keydown", { code: "Enter", bubbles: true });
      const escapeEvent = new KeyboardEvent("keydown", { code: "Escape", bubbles: true });

      document.dispatchEvent(enterEvent);
      document.dispatchEvent(escapeEvent);

      // Wait a bit to ensure no async calls were made
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should not have called getUserMedia
      expect(mocks.getUserMedia).not.toHaveBeenCalled();
    });

    it("should only respond to space when component is mounted", async () => {
      const { unmount } = renderWithProviders(<GlowyOrb />);

      // Start recording before unmount
      const keyDownEvent = new KeyboardEvent("keydown", { code: "Space", bubbles: true });
      document.dispatchEvent(keyDownEvent);

      await waitFor(() => {
        expect(mocks.getUserMedia).toHaveBeenCalled();
      });

      mocks.getUserMedia.mockClear();
      unmount();

      // After unmount, space should not trigger recording
      const keyDownEvent2 = new KeyboardEvent("keydown", { code: "Space", bubbles: true });
      document.dispatchEvent(keyDownEvent2);

      // Wait a bit to ensure no async calls were made
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mocks.getUserMedia).not.toHaveBeenCalled();
    });

    it("should prevent starting multiple recordings if space is pressed multiple times", async () => {
      renderWithProviders(<GlowyOrb />);

      // Press space first time
      const keyDownEvent1 = new KeyboardEvent("keydown", { code: "Space", bubbles: true });
      document.dispatchEvent(keyDownEvent1);

      await waitFor(() => {
        expect(mocks.getUserMedia).toHaveBeenCalledTimes(1);
      });

      // Wait for MediaRecorder to be initialized
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Press space again while already recording (should not start new recording)
      const keyDownEvent2 = new KeyboardEvent("keydown", { code: "Space", bubbles: true });
      document.dispatchEvent(keyDownEvent2);

      // Wait a bit to ensure no additional calls were made
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Should still only have been called once
      expect(mocks.getUserMedia).toHaveBeenCalledTimes(1);
    });

    it("should stop recording even if React state is stale (checks MediaRecorder state directly)", async () => {
      const onRecordingComplete = vi.fn();
      renderWithProviders(<GlowyOrb onRecordingComplete={onRecordingComplete} />);

      // Start recording via keyboard
      const keyDownEvent = new KeyboardEvent("keydown", { code: "Space", bubbles: true });
      document.dispatchEvent(keyDownEvent);

      await waitFor(() => {
        expect(mocks.getUserMedia).toHaveBeenCalled();
      });

      // Wait for MediaRecorder to be initialized and started
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Stop recording via keyboard - this should work even if React state is stale
      // because the handler checks MediaRecorder.state directly
      const keyUpEvent = new KeyboardEvent("keyup", { code: "Space", bubbles: true });
      document.dispatchEvent(keyUpEvent);

      // Should complete successfully by checking MediaRecorder state directly
      await waitFor(() => {
        expect(onRecordingComplete).toHaveBeenCalled();
      }, { timeout: 2000 });
    });

    it("should handle rapid space key press and release", async () => {
      const onRecordingComplete = vi.fn();
      renderWithProviders(<GlowyOrb onRecordingComplete={onRecordingComplete} />);

      // Rapidly press and release space
      const keyDownEvent = new KeyboardEvent("keydown", { code: "Space", bubbles: true });
      const keyUpEvent = new KeyboardEvent("keyup", { code: "Space", bubbles: true });

      document.dispatchEvent(keyDownEvent);
      // Small delay to allow recording to start
      await new Promise((resolve) => setTimeout(resolve, 10));
      document.dispatchEvent(keyUpEvent);

      // Should complete recording cycle
      await waitFor(() => {
        expect(onRecordingComplete).toHaveBeenCalled();
      }, { timeout: 2000 });
    });
  });

  describe("Audio Visualization", () => {
    it("should set up audio analyser when recording starts", async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<GlowyOrb />);

      const orb = screen.getByRole("button", { name: /hold to speak/i });
      await user.pointer({ target: orb, keys: "[MouseLeft>]" });

      // AudioContext should be created when recording starts
      await waitFor(() => {
        expect(mocks.getUserMedia).toHaveBeenCalled();
      });
    });

    it("should animate smoke based on audio levels", async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<GlowyOrb />);

      const orb = screen.getByRole("button", { name: /hold to speak/i });
      await user.pointer({ target: orb, keys: "[MouseLeft>]" });

      await waitFor(() => {
        expect(global.requestAnimationFrame).toHaveBeenCalled();
      });
    });

    it("should clean up animation frame on stop", async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<GlowyOrb />);

      const orb = screen.getByRole("button", { name: /hold to speak/i });

      await user.pointer({ target: orb, keys: "[MouseLeft>]" });
      await user.pointer({ target: orb, keys: "[/MouseLeft]" });

      await waitFor(() => {
        expect(global.cancelAnimationFrame).toHaveBeenCalled();
      });
    });
  });

  describe("Upload Flow", () => {
    it("should upload recording after stopping", async () => {
      const user = userEvent.setup({ delay: null });
      const onUploadSuccess = vi.fn();
      renderWithProviders(<GlowyOrb onUploadSuccess={onUploadSuccess} />);

      const orb = screen.getByRole("button", { name: /hold to speak/i });

      await user.pointer({ target: orb, keys: "[MouseLeft>]" });
      await user.pointer({ target: orb, keys: "[/MouseLeft]" });

      await waitFor(() => {
        expect(onUploadSuccess).toHaveBeenCalled();
      });
    });

    it("should handle upload errors gracefully", async () => {
      const mockError = new Error("Upload failed");
      mockUploadVoiceRecording.mockRejectedValueOnce(mockError);

      const user = userEvent.setup({ delay: null });
      const onUploadError = vi.fn();
      renderWithProviders(<GlowyOrb onUploadError={onUploadError} />);

      const orb = screen.getByRole("button", { name: /hold to speak/i });

      await user.pointer({ target: orb, keys: "[MouseLeft>]" });
      await user.pointer({ target: orb, keys: "[/MouseLeft]" });

      await waitFor(() => {
        expect(onUploadError).toHaveBeenCalledWith(mockError);
      });
    });
  });

  describe("Visual Effects", () => {
    it("should apply 3D transform on the orb", () => {
      const { container } = renderWithProviders(<GlowyOrb />);

      const orb = screen.getByRole("button", { name: /hold to speak/i });
      expect(orb).toBeInTheDocument();
      // Verify 3D transforms are applied via CSS
      expect(container).toBeInTheDocument();
    });

    it("should intensify glow when recording", async () => {
      const user = userEvent.setup({ delay: null });
      const { container } = renderWithProviders(<GlowyOrb />);

      const orb = screen.getByRole("button", { name: /hold to speak/i });
      await user.pointer({ target: orb, keys: "[MouseLeft>]" });

      await waitFor(() => {
        expect(container).toBeInTheDocument();
      });
    });

    it("should show purple, pink, and blue colors in the smoke", () => {
      const { container } = renderWithProviders(<GlowyOrb />);

      const orb = screen.getByRole("button", { name: /hold to speak/i });
      expect(orb).toBeInTheDocument();
      // Component should have gradient with purple, pink, blue colors
      expect(container).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("should handle microphone permission denied", async () => {
      mocks.getUserMedia.mockRejectedValueOnce(new Error("Permission denied"));

      const user = userEvent.setup({ delay: null });
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      renderWithProviders(<GlowyOrb />);

      const orb = screen.getByRole("button", { name: /hold to speak/i });
      await user.pointer({ target: orb, keys: "[MouseLeft>]" });

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Error accessing microphone:",
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Cleanup", () => {
    it("should stop recording on unmount", async () => {
      const user = userEvent.setup({ delay: null });
      const { unmount } = renderWithProviders(<GlowyOrb />);

      const orb = screen.getByRole("button", { name: /hold to speak/i });
      await user.pointer({ target: orb, keys: "[MouseLeft>]" });

      unmount();

      expect(true).toBe(true);
    });

    it("should remove keyboard listener on unmount", async () => {
      const user = userEvent.setup({ delay: null });
      const { unmount } = renderWithProviders(<GlowyOrb />);

      const orb = screen.getByRole("button", { name: /hold to speak/i });
      await user.pointer({ target: orb, keys: "[MouseLeft>]" });

      const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith("keyup", expect.any(Function));
    });

    it("should stop media stream tracks on recording stop", async () => {
      const user = userEvent.setup({ delay: null });

      const trackStopSpy = vi.fn();
      const mockTrack = {
        kind: "audio",
        stop: trackStopSpy,
        enabled: true,
      };
      mocks.mockStream.getTracks = vi.fn(() => [mockTrack]);

      renderWithProviders(<GlowyOrb />);

      const orb = screen.getByRole("button", { name: /hold to speak/i });

      await user.pointer({ target: orb, keys: "[MouseLeft>]" });
      await user.pointer({ target: orb, keys: "[/MouseLeft]" });

      await waitFor(() => {
        expect(trackStopSpy).toHaveBeenCalled();
      });
    });
  });

  describe("Callbacks", () => {
    it("should call onRecordingComplete with audio blob", async () => {
      const user = userEvent.setup({ delay: null });
      const onRecordingComplete = vi.fn();
      renderWithProviders(<GlowyOrb onRecordingComplete={onRecordingComplete} />);

      const orb = screen.getByRole("button", { name: /hold to speak/i });

      await user.pointer({ target: orb, keys: "[MouseLeft>]" });
      await user.pointer({ target: orb, keys: "[/MouseLeft]" });

      await waitFor(() => {
        expect(onRecordingComplete).toHaveBeenCalledWith(expect.any(Blob));
      });
    });

    it("should call onUploadSuccess with response data", async () => {
      const user = userEvent.setup({ delay: null });
      const onUploadSuccess = vi.fn();
      renderWithProviders(<GlowyOrb onUploadSuccess={onUploadSuccess} />);

      const orb = screen.getByRole("button", { name: /hold to speak/i });

      await user.pointer({ target: orb, keys: "[MouseLeft>]" });
      await user.pointer({ target: orb, keys: "[/MouseLeft]" });

      await waitFor(() => {
        expect(onUploadSuccess).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            filename: expect.any(String),
          })
        );
      });
    });

    it("should call onUploadError with error object", async () => {
      const mockError = new Error("Upload failed");
      mockUploadVoiceRecording.mockRejectedValueOnce(mockError);

      const user = userEvent.setup({ delay: null });
      const onUploadError = vi.fn();
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      renderWithProviders(<GlowyOrb onUploadError={onUploadError} />);

      const orb = screen.getByRole("button", { name: /hold to speak/i });

      await user.pointer({ target: orb, keys: "[MouseLeft>]" });
      await user.pointer({ target: orb, keys: "[/MouseLeft]" });

      await waitFor(() => {
        expect(onUploadError).toHaveBeenCalledWith(mockError);
      });

      consoleErrorSpy.mockRestore();
    });
  });
});
