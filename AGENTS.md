# Donna - AI-Native Life Operating System

## Product Vision

Donna is the first truly AI-native Life OS that eliminates the maintenance burden plaguing traditional productivity systems. Instead of users maintaining structure for dumb databases, intelligent systems maintain themselves while users focus on actual work.

**Core Insight:** Current Life OS systems fail not because users lack discipline, but because they demand unsustainable maintenance (5-9 hours weekly). AI makes it possible to invert this model.

## Target Users

- Knowledge workers, creators, and professionals who have tried productivity systems (Notion, Obsidian, bullet journaling) but abandoned them due to maintenance overhead
- Secondary focus: neurodivergent users for whom traditional systems have 100% abandonment rates

## Success Metrics

- Users capture 10+ items per week through conversation (vs. 0-2 in traditional systems)
- System maintenance time < 30 minutes per week (vs. 5-9 hours currently)
- 60%+ of captured information gets resurfaced proactively (vs. 16% in traditional PKM)
- 70%+ user retention at 90 days (vs. <30% for traditional productivity apps)
- 80%+ of users complete daily check-ins (morning/evening) at least 4 days per week

## Core Principles

1. **Capture > Structure** - Users express naturally through voice, text, or images. AI extracts structure. No manual categorization required.

2. **Intelligence > Discipline** - The system maintains itself through autonomous agents, not user habits. No weekly reviews required.

3. **Conversation > Navigation** - Primary interface is conversational. Users ask questions instead of clicking through dashboards.

4. **Listen Before Advising** - System checks in with the user first—understanding their state, energy, and concerns—before offering recommendations.

5. **Proactive > Reactive** - System surfaces insights before users ask. Insights appear automatically, not during manual review.

6. **Sovereignty > Convenience** - Users own their data. Markdown files on their filesystem are source of truth. System works locally-first.

## MVP Scope: The "Intelligent Capture + Daily Rhythm" Core Loop

### In Scope for MVP

1. **Morning Brief** - Listen-first check-in that understands user's state and energy before recommending priorities

2. **Nightly Debrief** - Conversational reflection that extracts structured updates and adapts tomorrow's plan

3. **Natural Language Capture** - Anytime voice or text input with automatic structure extraction (tasks, projects, people, deadlines)

4. **Contextual Question Answering** - Ask questions naturally and get insights with patterns and connections

### Out of Scope for MVP

- Mobile native apps (web-only, responsive design)
- Collaboration/multi-user features
- Direct calendar/email integration
- Advanced visualizations (graph views, dashboards)
- Plugin/extension system
- Team/shared workspaces
- Custom AI model training

## Data Storage & Sovereignty

All user data stored as markdown files in user's chosen location:
```
/user-data/
  /tasks/          # Individual task files
  /projects/       # Project overview files
  /people/         # Contact information
  /notes/          # Captured insights
  /daily-logs/     # Auto-generated from check-ins
  /check-ins/      # Morning and evening check-in records
```

Users can read, edit, move, or delete files at any time. Data remains accessible even if Donna stops working.

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

### Development Setup

**Backend:**
```bash
# Create virtual environment
uv venv --python 3.12
source .venv/bin/activate

# Install dependencies
uv sync

# Run development server
uv run uvicorn donna.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Type checking
npm run type-check

# Run tests
npm test
```

### API Endpoints
- `GET /` - Root endpoint with welcome message
- `GET /health` - Health check endpoint
- `GET /api/v1/me` - Get current authenticated user information (protected)
- `POST /api/v1/voice/capture` - Upload and process voice recordings (protected)
- `GET /docs` - Interactive API documentation (Swagger UI)

## Implemented Features

### Voice Capture Interface

The voice capture feature is the cornerstone of Donna's natural language input system. It provides an intuitive, futuristic interface that makes capturing thoughts effortless.

#### Glowy Orb Recorder

A continuously animated, interactive orb that serves as the primary voice capture interface:

**Visual Design:**
- **Idle State:** Gentle floating animation with pulsing glow rings and rotating shimmer effect
- **Recording State:** Enhanced animations with audio-reactive visualization, faster shimmer, and dynamic scaling
- **Feedback:** Visual-only feedback through color, size, and animation intensity—no text clutter

**Animations (Custom Tailwind CSS):**
- `animate-float`: Vertical floating motion (4s cycle, ±20px range)
- `animate-pulse-glow`: Inner glow pulsing (2s cycle)
- `animate-pulse-glow-outer`: Outer glow pulsing (3s cycle)
- `animate-shimmer`: Rotating light shimmer (3s idle, 1.5s when recording)

**Interaction:**
- Touch and hold (or click and hold) to record
- Release to stop and automatically upload
- Works seamlessly on mobile and desktop
- Visual indicators for upload success (green glow) or error (red glow)

**Audio Processing:**
- Real-time audio level visualization using Web Audio API
- 7 circular audio-reactive bars during recording
- Dynamic center core that grows and glows with audio levels
- Records in webm format for efficient upload

**Technical Implementation:**
- Component: `frontend/components/voice-recorder.tsx`
- Uses MediaRecorder API for browser-based audio capture
- Real-time audio analysis with AnalyserNode (FFT size 256)
- Automatic upload via authenticated API client
- Gradient-based visual design with multiple layered effects

#### Voice Capture Backend

The backend receives and processes voice recordings for AI-powered natural language understanding:

**Endpoint:** `POST /api/v1/voice/capture`
- **Authentication:** Required (JWT token via Supabase)
- **Input:** Audio file (webm format) via multipart/form-data
- **Storage:** Saved to `data/recordings/{user_id}_{timestamp}.webm`
- **Response:** Success status, filename, file size, and timestamp

**Planned Processing Pipeline (TODO):**
1. Speech-to-text transcription using Whisper API
2. AI extraction of structured data (tasks, projects, people, deadlines)
3. Automatic saving to markdown files in user's data directory
4. Context-aware categorization and linking

**File Structure:**
```
backend/data/recordings/
  {user_id}_{timestamp}.webm  # Original audio recordings

# Future: Processed outputs
/user-data/
  /tasks/       # Extracted tasks
  /projects/    # Identified projects
  /notes/       # General insights
```

This implementation embodies Donna's **Capture > Structure** principle—users speak naturally, and the system handles all structure extraction and organization automatically.
