"use client";

import { useCurrentUser } from "@/lib/api/hooks";

export function UserInfo() {
  const { data, isLoading, error } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-6">
        <h3 className="font-medium text-neutral-900">Backend User Info</h3>
        <p className="mt-2 text-sm text-neutral-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h3 className="font-medium text-red-900">Backend User Info</h3>
        <p className="mt-2 text-sm text-red-600">
          Error: {error instanceof Error ? error.message : "Failed to fetch user info"}
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-6">
        <h3 className="font-medium text-neutral-900">Backend User Info</h3>
        <p className="mt-2 text-sm text-neutral-600">No user data available</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-6">
      <h3 className="font-medium text-neutral-900">Backend User Info</h3>
      <p className="mt-2 text-xs text-neutral-500">
        This data comes from the backend API endpoint /api/v1/me, which validates your JWT token
        and extracts user information.
      </p>
      <div className="mt-4 space-y-2 rounded-md bg-neutral-50 p-4">
        <div>
          <span className="text-xs font-medium text-neutral-500">User ID:</span>
          <p className="mt-1 font-mono text-sm text-neutral-900">{data.user.id}</p>
        </div>
        <div>
          <span className="text-xs font-medium text-neutral-500">Email:</span>
          <p className="mt-1 text-sm text-neutral-900">{data.user.email}</p>
        </div>
        <div>
          <span className="text-xs font-medium text-neutral-500">Role:</span>
          <p className="mt-1 text-sm text-neutral-900">{data.user.role || "N/A"}</p>
        </div>
      </div>
    </div>
  );
}

