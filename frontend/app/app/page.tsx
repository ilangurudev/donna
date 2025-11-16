import { redirect } from "next/navigation";

import { getUser, signOut } from "@/app/actions/auth";
import { UserInfo } from "@/components/user-info";

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
        <div className="rounded-lg bg-white p-8 shadow">
          <h2 className="text-xl font-semibold text-neutral-900">Dashboard</h2>
          <p className="mt-2 text-neutral-600">
            This is your Donna dashboard. The intelligent capture and daily rhythm features will be
            implemented here.
          </p>

          <div className="mt-6">
            <UserInfo />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-neutral-200 p-6">
              <h3 className="font-medium text-neutral-900">Morning Brief</h3>
              <p className="mt-2 text-sm text-neutral-600">
                Start your day with a personalized check-in
              </p>
            </div>

            <div className="rounded-lg border border-neutral-200 p-6">
              <h3 className="font-medium text-neutral-900">Quick Capture</h3>
              <p className="mt-2 text-sm text-neutral-600">
                Capture thoughts, tasks, and ideas naturally
              </p>
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
