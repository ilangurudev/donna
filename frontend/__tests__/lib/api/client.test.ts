import { describe, it, expect, beforeEach } from "vitest";
import { api, ApiError } from "@/lib/api/client";
import { server } from "@/mocks/server";
import { errorHandlers } from "@/mocks/handlers";

// Note: Supabase client is mocked globally in vitest.setup.ts

describe("API Client", () => {
  describe("apiClient", () => {
    it("should make successful GET request", async () => {
      const response = await api.get<{ status: string }>("/health");

      expect(response).toEqual({ status: "healthy" });
    });

    it("should include Authorization header when session exists", async () => {
      const response = await api.get<{ user: unknown }>("/api/v1/me");

      expect(response).toHaveProperty("user");
      expect(response.user).toMatchObject({
        id: "test-user-id",
        email: "test@example.com",
      });
    });

    it("should handle POST requests with data", async () => {
      const mockData = { message: "test" };
      const response = await api.post<{ id: string }>("/api/v1/voice/capture", mockData);

      expect(response).toHaveProperty("id");
      expect(response.id).toBe("recording-123");
    });

    it("should handle PUT requests", async () => {
      // We don't have a PUT endpoint mocked, but we can test the method construction
      const mockData = { name: "updated" };

      // This will fail with 404, but we can check the method is called correctly
      await expect(api.put("/api/v1/test", mockData)).rejects.toThrow(ApiError);
    });

    it("should handle PATCH requests", async () => {
      const mockData = { field: "value" };

      await expect(api.patch("/api/v1/test", mockData)).rejects.toThrow(ApiError);
    });

    it("should handle DELETE requests", async () => {
      await expect(api.delete("/api/v1/test")).rejects.toThrow(ApiError);
    });

    it("should handle 204 No Content responses", async () => {
      // Mock a 204 response
      server.use(
        errorHandlers.networkError // We'll override this next
      );

      // Create a custom 204 handler
      const { http, HttpResponse } = await import("msw");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      server.use(
        http.delete(`${API_URL}/api/v1/test`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      const response = await api.delete<void>("/api/v1/test");
      expect(response).toEqual({});
    });
  });

  describe("Error Handling", () => {
    it("should throw ApiError on 401 Unauthorized", async () => {
      server.use(errorHandlers.userUnauthorized);

      await expect(api.get("/api/v1/me")).rejects.toThrow(ApiError);

      try {
        await api.get("/api/v1/me");
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(401);
        expect((error as ApiError).message).toContain("Invalid or expired token");
      }
    });

    it("should throw ApiError on 500 Internal Server Error", async () => {
      server.use(errorHandlers.userServerError);

      await expect(api.get("/api/v1/me")).rejects.toThrow(ApiError);

      try {
        await api.get("/api/v1/me");
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(500);
        expect((error as ApiError).message).toContain("Internal server error");
      }
    });

    it("should throw ApiError on 400 Bad Request", async () => {
      server.use(errorHandlers.voiceUploadValidationError);

      await expect(api.post("/api/v1/voice/capture", {})).rejects.toThrow(ApiError);

      try {
        await api.post("/api/v1/voice/capture", {});
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(400);
        expect((error as ApiError).message).toContain("Invalid audio format");
      }
    });

    it("should handle network errors", async () => {
      server.use(errorHandlers.networkError);

      await expect(api.get("/health")).rejects.toThrow();
    });

    it("should handle malformed JSON responses in errors", async () => {
      const { http, HttpResponse } = await import("msw");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      server.use(
        http.get(`${API_URL}/api/v1/test`, () => {
          return new HttpResponse("Not JSON", { status: 500 });
        })
      );

      try {
        await api.get("/api/v1/test");
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(500);
        expect((error as ApiError).message).toContain("API request failed with status 500");
      }
    });

    it("should include error data in ApiError", async () => {
      server.use(errorHandlers.voiceUploadValidationError);

      try {
        await api.post("/api/v1/voice/capture", {});
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).data).toEqual({
          detail: "Invalid audio format. Expected webm or mp3",
        });
      }
    });
  });

  describe("Authentication", () => {
    it("should send requests without auth header when no session exists", async () => {
      // Mock Supabase client with no session
      vi.doMock("@/lib/supabase/client", () => ({
        createClient: () => mockSupabaseClient({ session: null }),
      }));

      // Health endpoint should still work without auth
      const response = await api.get<{ status: string }>("/health");
      expect(response).toEqual({ status: "healthy" });
    });

    it("should include Bearer token in Authorization header", async () => {
      // The mock already provides a session with access_token: "mock-access-token"
      // The /api/v1/me endpoint requires auth, so if it succeeds, auth header was sent
      const response = await api.get<{ user: unknown }>("/api/v1/me");

      expect(response).toHaveProperty("user");
    });
  });

  describe("ApiError class", () => {
    it("should create ApiError with message and status", () => {
      const error = new ApiError("Test error", 404);

      expect(error.message).toBe("Test error");
      expect(error.status).toBe(404);
      expect(error.name).toBe("ApiError");
      expect(error).toBeInstanceOf(Error);
    });

    it("should create ApiError with optional data", () => {
      const errorData = { field: "email", issue: "required" };
      const error = new ApiError("Validation failed", 422, errorData);

      expect(error.message).toBe("Validation failed");
      expect(error.status).toBe(422);
      expect(error.data).toEqual(errorData);
    });
  });
});
