import { redirect } from "next/navigation";

import { getUser, signOut } from "@/app/actions/auth";
import { UserInfo } from "@/components/user-info";
import { VoiceRecorder } from "@/components/voice-recorder";

export default async function AppPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Donna</h1>
            <p className="text-sm text-neutral-600">Welcome back, {user.email}</p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Sign Out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Voice Capture Section */}
        <div className="rounded-lg bg-gradient-to-br from-neutral-50 to-neutral-100 p-8 shadow-lg">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-neutral-900">Voice Capture</h2>
            <p className="mt-3 text-lg text-neutral-600">
              Capture your thoughts, tasks, and ideas naturally with your voice
            </p>
          </div>

          <div className="mt-8">
            <VoiceRecorder />
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mt-8 rounded-lg bg-white p-8 shadow">
          <div className="mb-6">
            <UserInfo />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-neutral-200 p-6">
              <h3 className="font-medium text-neutral-900">Morning Brief</h3>
              <p className="mt-2 text-sm text-neutral-600">
                Start your day with a personalized check-in
              </p>
            </div>

            <div className="rounded-lg border border-neutral-200 p-6 ring-2 ring-blue-500">
              <h3 className="font-medium text-neutral-900">Quick Capture</h3>
              <p className="mt-2 text-sm text-neutral-600">
                Capture thoughts, tasks, and ideas naturally
              </p>
              <p className="mt-2 text-xs font-medium text-blue-600">Active above ↑</p>
            </div>

            <div className="rounded-lg border border-neutral-200 p-6">
              <h3 className="font-medium text-neutral-900">Evening Debrief</h3>
              <p className="mt-2 text-sm text-neutral-600">Reflect on your day and plan ahead</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
