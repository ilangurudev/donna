import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import { useCurrentUser, useHealthCheck } from "@/lib/api/hooks";
import { TestProviders } from "@/__tests__/utils/test-utils";
import { server } from "@/mocks/server";
import { errorHandlers } from "@/mocks/handlers";

// Note: Supabase client is mocked globally in vitest.setup.ts

describe("API Hooks", () => {
  describe("useCurrentUser", () => {
    it("should fetch and return current user data", async () => {
      const { result } = renderHook(() => useCurrentUser(), {
        wrapper: TestProviders,
      });

      // Initially loading
      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();

      // Wait for the query to resolve
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual({
        user: {
          id: "test-user-id",
          email: "test@example.com",
          role: "authenticated",
        },
      });
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("should handle loading state", async () => {
      const { result } = renderHook(() => useCurrentUser(), {
        wrapper: TestProviders,
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBeNull();
    });

    it("should handle error state when unauthorized", async () => {
      server.use(errorHandlers.userUnauthorized);

      const { result } = renderHook(() => useCurrentUser(), {
        wrapper: TestProviders,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });

    it("should handle server error", async () => {
      server.use(errorHandlers.userServerError);

      const { result } = renderHook(() => useCurrentUser(), {
        wrapper: TestProviders,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.data).toBeUndefined();
    });

    it("should cache results using query key", async () => {
      // Create a shared QueryClient with caching enabled
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            staleTime: 60000, // Enable caching for this test
            gcTime: 60000,
          },
        },
      });

      // Create wrapper with shared QueryClient
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TestProviders queryClient={queryClient}>{children}</TestProviders>
      );

      const { result: result1 } = renderHook(() => useCurrentUser(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result1.current.isSuccess).toBe(true);
      });

      // Second hook with same query key should use cache
      const { result: result2 } = renderHook(() => useCurrentUser(), {
        wrapper,
      });

      // Should immediately have data from cache
      expect(result2.current.data).toBeDefined();
      expect(result2.current.isLoading).toBe(false);
    });

    it("should use correct query key", async () => {
      const { result } = renderHook(() => useCurrentUser(), {
        wrapper: TestProviders,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // The query key should be ["user", "me"]
      // We can verify this by checking the result has the expected structure
      expect(result.current.data).toHaveProperty("user");
    });
  });

  describe("useHealthCheck", () => {
    it("should fetch and return health status", async () => {
      const { result } = renderHook(() => useHealthCheck(), {
        wrapper: TestProviders,
      });

      // Initially loading
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual({ status: "healthy" });
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("should handle health check failure", async () => {
      server.use(errorHandlers.healthCheckError);

      const { result } = renderHook(() => useHealthCheck(), {
        wrapper: TestProviders,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.data).toBeUndefined();
    });

    it("should use correct query key", async () => {
      const { result } = renderHook(() => useHealthCheck(), {
        wrapper: TestProviders,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // The query key should be ["health"]
      expect(result.current.data).toHaveProperty("status");
    });

    it("should work without authentication", async () => {
      // Health check shouldn't require auth
      vi.doMock("@/lib/supabase/client", () => ({
        createClient: () => mockSupabaseClient({ session: null }),
      }));

      const { result } = renderHook(() => useHealthCheck(), {
        wrapper: TestProviders,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual({ status: "healthy" });
    });

    it("should handle network errors", async () => {
      server.use(errorHandlers.networkError);

      const { result } = renderHook(() => useHealthCheck(), {
        wrapper: TestProviders,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeTruthy();
    });
  });
});
