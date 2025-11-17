# Donna Frontend Architecture

## Mission
Deliver a conversational, responsive surface for Donna’s AI agents. The web client must feel effortless on desktop + mobile, hide auth complexity, and showcase the signature capture experiences.

## Project Structure
```
frontend/
├── app/                        # Next.js App Router
│   ├── actions/auth.ts        # Server Actions (signIn, signOut, getUser)
│   ├── app/page.tsx           # Protected dashboard
│   ├── auth/callback/route.ts # OAuth callback handler
│   ├── login/page.tsx         # Login page (Google OAuth button)
│   ├── layout.tsx             # Root layout + QueryProvider
│   └── page.tsx               # Home (redirects to /login or /app)
├── components/
│   ├── providers/             # Context providers (QueryProvider)
│   └── ui/                    # shadcn/ui components (installed on-demand)
├── lib/
│   ├── api/                   # API client + TanStack Query hooks
│   │   ├── client.ts          # Fetch wrapper with auto JWT injection
│   │   └── hooks.ts           # useCurrentUser, useHealthCheck
│   ├── supabase/              # Supabase SSR clients
│   │   ├── client.ts          # Browser client
│   │   ├── server.ts          # Server Component client
│   │   └── middleware.ts      # Middleware session handler
│   └── utils.ts               # cn() for Tailwind merging
├── __tests__/                 # Vitest unit tests
├── e2e/                       # Playwright E2E tests
├── mocks/                     # MSW API mocks
├── middleware.ts              # Route protection + session refresh
└── public/                    # Static assets
```

## Directory Highlights
```
app/          # Routes, layouts, server actions
components/   # UI primitives + interactive surfaces (see components/AGENTS.md)
lib/          # API client, Supabase helpers, utilities
middleware.ts # Route protection + session refresh
tests/        # Vitest + Playwright suites
```

## Runtime Flows
- **Auth:** `app/actions/auth.ts` issues Supabase login, `/auth/callback` exchanges OAuth codes, and `middleware.ts` guards all routes except `/login` + static assets.
- **Data access:** `lib/api/client.ts` injects Supabase JWTs into backend requests; hooks in `lib/api/hooks.ts` wrap TanStack Query for user/session data.
- **Providers:** `app/layout.tsx` registers the QueryProvider plus global styles; client components remain lightweight.

## Development Notes
- `pnpm dev` to run Next.js locally, `pnpm lint` / `pnpm test` / `pnpm test:e2e` for quality gates.
- Environment variables live in `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL`).
- Keep new interactive patterns documented under `frontend/components/AGENTS.md` so this file stays high level.


IMPORTANT NOTE:
After any important change to the frontend, make sure to update this file appropriately.
