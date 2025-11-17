# Donna - AI-Native Life Operating System

## Vision
Donna flips the Life OS model: AI agents keep structure up-to-date so humans can stay in flow. The system listens first, adapts plans automatically, and keeps everything in local markdown so the user always owns their data.

## Who We Serve
- Knowledge workers and independent creators who abandoned heavy systems (Notion, Obsidian, bullet journals).
- Neurodivergent users who need low-friction capture and proactive resurfacing to stay organized.

## Success Signals
- 10+ captured items per user per week via natural conversation.
- <30 minutes of weekly maintenance overhead.
- ≥60% of captured info resurfaces autonomously.
- ≥70% retention at day 90 and ≥80% adherence to daily check-ins.

## Operating Principles
1. **Capture > Structure** – speak naturally, let AI extract schema.
2. **Intelligence > Discipline** – agents maintain the system; no weekly reviews.
3. **Conversation > Navigation** – talk to Donna instead of clicking dashboards.
4. **Listen Before Advising** – understand energy and context before recommendations.
5. **Proactive > Reactive** – insights surface before the user asks.
6. **Sovereignty > Convenience** – markdown files on the user’s filesystem are the source of truth.

## Data Model
```
/user-data/
  /tasks/        # atomic task files
  /projects/     # project briefs
  /people/       # relationship context
  /notes/        # free-form capture
  /daily-logs/   # auto-generated reflections
  /check-ins/    # morning/evening transcripts
```
Files stay readable/editable without Donna, reinforcing user ownership.

## Technical Stack

### Backend
- **Language:** Python 3.12
- **Framework:** FastAPI with async support
- **Package Manager:** uv (fast, modern Python package management)
- **Code Quality:** Ruff for linting and formatting, pre-commit hooks
- **Testing:** Pytest
- **Features:** CORS middleware, health check endpoints, JWT authentication
- **Authentication:** Supabase Auth integration

### Frontend
- **Framework:** Next.js 16 (React 19) with App Router
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4 with custom animations
- **State Management:** React hooks, TanStack Query for server state
- **Authentication:** Supabase SSR with cookie-based sessions
- **Testing:** Vitest for unit tests, Playwright for E2E
- **Code Quality:** ESLint, Prettier with import sorting

## Implementation Map
- `backend/AGENTS.md` – FastAPI services, auth, and capture pipeline.
- `frontend/AGENTS.md` – Next.js app structure, auth surface, and shared conventions.
- `frontend/components/AGENTS.md` – Deep dives on interactive components (voice capture orb, etc.).

Refer to the DEV-SETUP.md file to setup development environment.

# IMPORTANT NOTE:
After any important change to the app structure or vision, make sure to update this file appropriately.
