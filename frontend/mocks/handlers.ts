import { http, HttpResponse } from "msw";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const handlers = [
  // Mock health check endpoint
  http.get(`${API_URL}/health`, () => {
    return HttpResponse.json({ status: "healthy" });
  }),

  // Mock user endpoint
  http.get(`${API_URL}/api/v1/me`, () => {
    return HttpResponse.json({
      user: {
        id: "test-user-id",
        email: "test@example.com",
        role: "authenticated",
      },
    });
  }),

  // Mock voice recording upload endpoint
  http.post(`${API_URL}/api/v1/voice/capture`, async ({ request }) => {
    const authHeader = request.headers.get("Authorization");

    // Simulate unauthorized access
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json(
        { detail: "Unauthorized" },
        { status: 401 }
      );
    }

    // Simulate successful upload
    return HttpResponse.json(
      {
        id: "recording-123",
        status: "processing",
        created_at: new Date().toISOString(),
      },
      { status: 201 }
    );
  }),

  // Generic POST endpoint for testing (catches /api/v1/test)
  http.post(`${API_URL}/api/v1/test`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      { success: true, data: body },
      { status: 200 }
    );
  }),
];

// Error scenario handlers - can be used in tests with server.use()
export const errorHandlers = {
  // Health check failure
  healthCheckError: http.get(`${API_URL}/health`, () => {
    return HttpResponse.json(
      { status: "unhealthy", error: "Database connection failed" },
      { status: 503 }
    );
  }),

  // User endpoint unauthorized
  userUnauthorized: http.get(`${API_URL}/api/v1/me`, () => {
    return HttpResponse.json(
      { detail: "Invalid or expired token" },
      { status: 401 }
    );
  }),

  // User endpoint server error
  userServerError: http.get(`${API_URL}/api/v1/me`, () => {
    return HttpResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }),

  // Voice upload server error
  voiceUploadError: http.post(`${API_URL}/api/v1/voice/capture`, () => {
    return HttpResponse.json(
      { detail: "Failed to process audio file" },
      { status: 500 }
    );
  }),

  // Voice upload validation error
  voiceUploadValidationError: http.post(`${API_URL}/api/v1/voice/capture`, () => {
    return HttpResponse.json(
      { detail: "Invalid audio format. Expected webm or mp3" },
      { status: 400 }
    );
  }),

  // Network error simulation
  networkError: http.get(`${API_URL}/*`, () => {
    return HttpResponse.error();
  }),
};
