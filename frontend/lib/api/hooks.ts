"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "./client";

/**
 * Example hook to fetch current user from backend
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: ["user", "me"],
    queryFn: () => api.get<{ user: { id: string; email: string; role: string } }>("/api/v1/me"),
  });
}

/**
 * Example hook to check backend health
 */
export function useHealthCheck() {
  return useQuery({
    queryKey: ["health"],
    queryFn: () => api.get<{ status: string }>("/health"),
    refetchInterval: 30000, // Check every 30 seconds
  });
}
