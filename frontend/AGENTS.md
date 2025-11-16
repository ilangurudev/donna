# Donna Frontend Architecture

## Tech Stack
- **Framework**: Next.js 16 (App Router), React 19, TypeScript 5 (strict)
- **Styling**: Tailwind CSS 4, shadcn/ui (Radix primitives)
- **State**: TanStack Query v5 (server state), React state (UI state)
- **Forms**: React Hook Form + Zod validation
- **Auth**: Supabase Auth (Google OAuth, SSR with cookies)
- **Testing**: Vitest + Playwright + MSW
- **DX**: ESLint, Prettier (auto-import sort), Husky pre-commit hooks

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

## Key Configurations

### Environment Variables (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://vhyvpbdtfwjqruckbjbn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Authentication Flow
1. User clicks "Sign in with Google" → triggers `signInWithGoogle()` Server Action
2. Supabase redirects to Google OAuth → user approves
3. Google redirects to `/auth/callback?code=...`
4. Callback exchanges code for session → stores in httpOnly cookies
5. Middleware validates session on every request → redirects to `/login` if invalid
6. Protected pages use `getUser()` to check auth status

### API Integration
```typescript
// Auto-injected JWT from Supabase session
import { api } from '@/lib/api/client';
const data = await api.get('/api/v1/endpoint');

// TanStack Query hooks
import { useCurrentUser } from '@/lib/api/hooks';
const { data, isLoading } = useCurrentUser();
```

### Route Protection
- **Middleware** (`middleware.ts`): Validates Supabase session, redirects unauthenticated users
- **Matcher**: Protects all routes except `/login`, `/auth/*`, static files
- **Server Components**: Use `getUser()` for double-check before rendering

### Testing
- **Unit**: Vitest + Testing Library (happy-dom) → `pnpm test`
- **E2E**: Playwright (Chromium) → `pnpm test:e2e`
- **Mocking**: MSW handlers in `mocks/handlers.ts`

### Code Quality
- **Pre-commit**: Husky runs ESLint + Prettier on staged files
- **Format**: `pnpm format` (Prettier with import sorting + Tailwind class sorting)
- **Type-check**: `pnpm type-check` (strict mode enforced)

## Component Installation (shadcn/ui)
```bash
pnpm dlx shadcn@latest add button  # Installs to components/ui/button.tsx
```

## Development Commands
```bash
pnpm dev              # Start dev server (localhost:3000)
pnpm build            # Production build
pnpm lint             # Check code quality
pnpm format           # Auto-fix formatting
pnpm test             # Run unit tests
pnpm test:e2e         # Run E2E tests
```

## Important Notes
- **SSR Auth**: All auth code uses `@supabase/ssr` for cookie-based sessions
- **API Client**: Auto-refreshes Supabase token and injects into Authorization header
- **Monorepo**: Part of pnpm workspace (root manages deps, frontend has symlinks)
- **No Server Actions in Client Components**: Use Server Actions from Server Components only
