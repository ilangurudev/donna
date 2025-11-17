import { vi } from "vitest";

export interface MockSession {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export const createMockSession = (overrides?: Partial<MockSession>): MockSession => ({
  access_token: "mock-access-token",
  refresh_token: "mock-refresh-token",
  user: {
    id: "test-user-id",
    email: "test@example.com",
    role: "authenticated",
  },
  ...overrides,
});

export const createMockSupabaseClient = (sessionOverrides?: Partial<MockSession>) => {
  const mockSession = sessionOverrides ? createMockSession(sessionOverrides) : null;

  return {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: mockSession },
        error: null,
      }),
      getUser: vi.fn().mockResolvedValue({
        data: { user: mockSession?.user || null },
        error: null,
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      signInWithOAuth: vi.fn().mockResolvedValue({
        data: { url: "https://mock-oauth-url.com" },
        error: null,
      }),
    },
  };
};

/**
 * Mock the Supabase client creation function for tests
 *
 * @example
 * ```ts
 * import { mockSupabaseClient } from '@/__tests__/utils/mock-supabase';
 *
 * // Mock authenticated user
 * const mockClient = mockSupabaseClient();
 *
 * // Mock unauthenticated user
 * const mockClient = mockSupabaseClient({ session: null });
 *
 * // Mock custom session
 * const mockClient = mockSupabaseClient({
 *   session: { access_token: 'custom-token' }
 * });
 * ```
 */
export const mockSupabaseClient = (options?: {
  session?: Partial<MockSession> | null;
}) => {
  const sessionOverrides = options?.session === null ? undefined : options?.session;
  return createMockSupabaseClient(sessionOverrides);
};
