# Donna - AI-Native Life Operating System

> The first truly AI-native Life OS that eliminates the maintenance burden plaguing traditional productivity systems.

## Project Structure

This is a monorepo containing:

- **`frontend/`** - Next.js 16 + React 19 + TypeScript + Tailwind CSS
- **`backend/`** - FastAPI + Python 3.12

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Python 3.12+
- uv (Python package manager)
- Supabase account (for authentication)

### Environment Setup

1. **Root level**: Copy `.env` and update with your Supabase credentials (already configured)

2. **Frontend**: Copy `frontend/.env.example` to `frontend/.env.local` and update:
   ```bash
   cp frontend/.env.example frontend/.env.local
   # Already created with Supabase credentials
   ```

3. **Backend**: Update `backend/.env` with your Supabase JWT secret:
   ```bash
   # Get JWT Secret from: Supabase Dashboard → Settings → API → JWT Secret
   SUPABASE_JWT_SECRET=your-jwt-secret-here
   ```

### Development

#### Start Both Services

From the root directory:

```bash
# Install dependencies
pnpm install

# Start frontend (http://localhost:3000)
pnpm dev:frontend

# Start backend (http://localhost:8000) - in a separate terminal
pnpm dev:backend
```

#### Frontend Only

```bash
cd frontend
pnpm install
pnpm dev
```

Available scripts:
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `pnpm type-check` - Run TypeScript type checking
- `pnpm test` - Run Vitest unit tests
- `pnpm test:e2e` - Run Playwright E2E tests

#### Backend Only

```bash
cd backend
uv sync
uv run uvicorn donna.main:app --reload
```

API docs available at: http://localhost:8000/docs

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS 4, shadcn/ui
- **State**: TanStack Query v5
- **Forms**: React Hook Form + Zod
- **Auth**: Supabase Auth with Google OAuth
- **Testing**: Vitest, Playwright, MSW
- **Dev Tools**: TypeScript (strict), ESLint, Prettier

### Backend
- **Framework**: FastAPI
- **Auth**: Supabase JWT validation
- **Dev Tools**: Ruff (linting + formatting), pytest
- **Package Management**: uv

## Architecture

### Authentication Flow

1. User clicks "Sign in with Google" on `/login`
2. Supabase handles OAuth flow and returns JWT
3. Frontend stores session in cookies (via Supabase SSR)
4. Middleware validates session on protected routes
5. API requests include JWT in Authorization header
6. Backend validates JWT using Supabase secret

### API Integration

Frontend uses TanStack Query for data fetching:

```typescript
import { useCurrentUser } from '@/lib/api/hooks';

function Component() {
  const { data, isLoading } = useCurrentUser();
  // ...
}
```

## Development Workflow

### Pre-commit Hooks

Husky and lint-staged are configured to run:
- ESLint + Prettier on frontend files
- Ruff on backend Python files

Hooks run automatically on `git commit`.

### Code Quality

```bash
# Frontend
cd frontend
pnpm lint          # Check for issues
pnpm format        # Auto-fix formatting
pnpm type-check    # TypeScript validation

# Backend
cd backend
uv run ruff check  # Check for issues
uv run ruff format # Auto-fix formatting
```

## Testing

### Frontend

```bash
cd frontend

# Unit tests (Vitest)
pnpm test
pnpm test:ui       # Interactive UI
pnpm test:coverage # With coverage

# E2E tests (Playwright)
pnpm test:e2e
pnpm test:e2e:ui   # Interactive UI
```

### Backend

```bash
cd backend
uv run pytest
```

## Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy!

### Backend

Deploy to any Python hosting service (Railway, Render, Fly.io, etc.)

Required environment variables:
- `SUPABASE_URL`
- `SUPABASE_JWT_SECRET`
- `ALLOWED_ORIGINS` (your frontend URL)

## Project Vision

Donna is building the first AI-native Life OS focused on:

1. **Capture > Structure** - Natural input (voice, text), AI extracts structure
2. **Intelligence > Discipline** - System maintains itself, not the user
3. **Conversation > Navigation** - Talk to your system, don't click through it
4. **Proactive > Reactive** - Insights surface automatically

See `AGENTS.md` for full product vision and roadmap.

## License

[Add your license here]
