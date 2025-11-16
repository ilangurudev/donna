# Donna Frontend

Next.js 16 frontend for Donna - AI-Native Life Operating System.

## Tech Stack

- **Framework**: Next.js 16.0 (App Router, Server Components)
- **React**: 19.2
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: TanStack Query v5
- **Forms**: React Hook Form + Zod
- **Authentication**: Supabase Auth (SSR)
- **Testing**: Vitest + Testing Library + Playwright
- **Mocking**: MSW (Mock Service Worker)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
pnpm install
```

### Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Required variables:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:8000)

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### Scripts

```bash
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm format           # Format with Prettier
pnpm format:check     # Check formatting
pnpm type-check       # TypeScript type checking
pnpm test             # Run unit tests
pnpm test:ui          # Run tests with UI
pnpm test:coverage    # Run tests with coverage
pnpm test:e2e         # Run E2E tests
pnpm test:e2e:ui      # Run E2E tests with UI
```

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── actions/           # Server Actions
│   ├── app/               # Protected app pages
│   ├── auth/              # Auth callback routes
│   ├── login/             # Login page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page (redirects)
├── components/            # React components
│   ├── providers/        # Context providers
│   └── ui/               # shadcn/ui components
├── lib/                  # Utilities and libraries
│   ├── api/             # API client + hooks
│   ├── supabase/        # Supabase client utils
│   └── utils.ts         # General utilities
├── __tests__/           # Unit tests
├── e2e/                 # E2E tests
├── mocks/               # MSW handlers
└── public/              # Static files
```

## Authentication

Authentication is handled by Supabase with Google OAuth:

1. **Client**: Uses `@supabase/ssr` for SSR-compatible auth
2. **Middleware**: Validates sessions and protects routes
3. **Server Actions**: Handle sign in/sign out

Protected routes automatically redirect to `/login` if unauthenticated.

## API Integration

### Using TanStack Query

```typescript
import { useCurrentUser } from '@/lib/api/hooks';

function MyComponent() {
  const { data, isLoading, error } = useCurrentUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>Hello {data.user.email}</div>;
}
```

### Creating New Hooks

```typescript
// lib/api/hooks.ts
export function useMyData() {
  return useQuery({
    queryKey: ["my-data"],
    queryFn: () => api.get<MyDataType>("/api/v1/my-endpoint"),
  });
}
```

### Making Authenticated Requests

The API client automatically includes the Supabase JWT in the Authorization header:

```typescript
import { api } from "@/lib/api/client";

// GET request
const data = await api.get("/api/v1/endpoint");

// POST request
const result = await api.post("/api/v1/endpoint", { key: "value" });
```

## Testing

### Unit Tests (Vitest)

```bash
pnpm test
```

Tests use:

- Vitest as test runner
- React Testing Library for component testing
- happy-dom for DOM simulation
- MSW for API mocking

Example:

```typescript
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### E2E Tests (Playwright)

```bash
pnpm test:e2e
```

Example:

```typescript
import { expect, test } from "@playwright/test";

test("should login", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByText("Welcome to Donna")).toBeVisible();
});
```

## Code Quality

### TypeScript

Strict mode is enabled in `tsconfig.json`. All code must pass type checking:

```bash
pnpm type-check
```

### Linting

ESLint with Next.js and Prettier configs:

```bash
pnpm lint
```

### Formatting

Prettier with import sorting and Tailwind class sorting:

```bash
pnpm format
```

## Building for Production

```bash
pnpm build
pnpm start
```

The build process:

1. Type checks all files
2. Builds Next.js application
3. Optimizes for production

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

Vercel automatically:

- Installs dependencies
- Runs builds
- Deploys to CDN

### Other Platforms

Any Node.js hosting platform works:

```bash
pnpm build
pnpm start
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
