import { vi } from "vitest";

/**
 * Mock MediaStream for testing audio recording
 */
export class MockMediaStream {
  active = true;
  id = "mock-stream-id";

  getTracks = vi.fn(() => [
    {
      kind: "audio",
      stop: vi.fn(),
      enabled: true,
    },
  ]);

  getAudioTracks = vi.fn(() => this.getTracks());
  getVideoTracks = vi.fn(() => []);
  addTrack = vi.fn();
  removeTrack = vi.fn();
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
  dispatchEvent = vi.fn();
}

/**
 * Mock MediaRecorder for testing audio recording
 */
export class MockMediaRecorder {
  state: "inactive" | "recording" | "paused" = "inactive";
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  onerror: ((error: Error) => void) | null = null;
  stream: MockMediaStream;

  constructor(stream: MockMediaStream) {
    this.stream = stream;
  }

  start = vi.fn(() => {
    this.state = "recording";
  });

  stop = vi.fn(() => {
    this.state = "inactive";
    // Simulate dataavailable and stop events asynchronously
    // This allows React state updates to batch properly
    queueMicrotask(() => {
      // Simulate dataavailable event
      if (this.ondataavailable) {
        const mockBlob = new Blob(["mock-audio-data"], { type: "audio/webm" });
        this.ondataavailable({ data: mockBlob });
      }
      // Simulate stop event
      if (this.onstop) {
        this.onstop();
      }
    });
  });

  pause = vi.fn(() => {
    this.state = "paused";
  });

  resume = vi.fn(() => {
    this.state = "recording";
  });

  addEventListener = vi.fn((event: string, handler: unknown) => {
    if (event === "dataavailable") {
      this.ondataavailable = handler as (event: { data: Blob }) => void;
    } else if (event === "stop") {
      this.onstop = handler as () => void;
    } else if (event === "error") {
      this.onerror = handler as (error: Error) => void;
    }
  });

  removeEventListener = vi.fn();

  static isTypeSupported = vi.fn(() => true);
}

/**
 * Mock AudioContext for testing audio visualization
 */
export class MockAudioContext {
  state: "running" | "suspended" | "closed" = "running";
  sampleRate = 48000;
  currentTime = 0;
  destination = {};

  createMediaStreamSource = vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
  }));

  createAnalyser = vi.fn(() => ({
    fftSize: 256,
    frequencyBinCount: 128,
    connect: vi.fn(),
    disconnect: vi.fn(),
    getByteFrequencyData: vi.fn((array: Uint8Array) => {
      // Fill with mock frequency data (simulating audio levels)
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 128) + 64; // Random values 64-192
      }
    }),
    getByteTimeDomainData: vi.fn((array: Uint8Array) => {
      // Fill with mock time domain data
      for (let i = 0; i < array.length; i++) {
        array[i] = 128 + Math.floor(Math.random() * 64); // Random values around 128
      }
    }),
  }));

  close = vi.fn().mockResolvedValue(undefined);
  resume = vi.fn().mockResolvedValue(undefined);
  suspend = vi.fn().mockResolvedValue(undefined);
}

/**
 * Setup all Web Audio API mocks for testing
 * Call this in beforeEach for components that use audio APIs
 *
 * @example
 * ```ts
 * import { setupMediaDeviceMocks } from '@/__tests__/utils/mock-media-devices';
 *
 * beforeEach(() => {
 *   const mocks = setupMediaDeviceMocks();
 *   // Optionally customize mock behavior
 *   mocks.getUserMedia.mockRejectedValueOnce(new Error('Permission denied'));
 * });
 * ```
 */
export const setupMediaDeviceMocks = () => {
  const mockStream = new MockMediaStream();
  const getUserMedia = vi.fn().mockResolvedValue(mockStream);

  // Mock navigator.mediaDevices
  Object.defineProperty(global.navigator, "mediaDevices", {
    writable: true,
    value: {
      getUserMedia,
      enumerateDevices: vi.fn().mockResolvedValue([]),
      getSupportedConstraints: vi.fn().mockReturnValue({}),
    },
  });

  // Mock MediaRecorder
  global.MediaRecorder = MockMediaRecorder as unknown as typeof MediaRecorder;

  // Mock AudioContext
  global.AudioContext = MockAudioContext as unknown as typeof AudioContext;

  // Mock requestAnimationFrame - don't call callback to avoid infinite loops
  // Just return an ID that can be cancelled later
  let rafId = 1;
  global.requestAnimationFrame = vi.fn(() => {
    return rafId++;
  }) as unknown as typeof requestAnimationFrame;

  // Mock cancelAnimationFrame
  global.cancelAnimationFrame = vi.fn();

  return {
    getUserMedia,
    mockStream,
    MediaRecorder: MockMediaRecorder,
    AudioContext: MockAudioContext,
  };
};

/**
 * Clean up media device mocks after tests
 */
export const cleanupMediaDeviceMocks = () => {
  vi.restoreAllMocks();
};
