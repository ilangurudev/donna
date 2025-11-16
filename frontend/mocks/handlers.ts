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
];
