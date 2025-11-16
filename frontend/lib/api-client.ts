/**
 * API Client for Donna backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Upload a voice recording to the backend
 */
export async function uploadVoiceRecording(audioBlob: Blob): Promise<{
  success: boolean;
  message: string;
  filename?: string;
  size?: number;
  timestamp?: string;
}> {
  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.webm");

  const response = await fetch(`${API_BASE_URL}/api/v1/voice/capture`, {
    method: "POST",
    body: formData,
    credentials: "include", // Include cookies for authentication
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to upload recording: ${response.statusText}`,
      response.status,
    );
  }

  return response.json();
}
