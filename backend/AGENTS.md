# Donna Backend Overview

## Stack Snapshot
- Python 3.12, FastAPI, and uv for dependency management.
- Config via `.env` (see `config.py`) with sensible defaults for local dev.
- Auth handled with Supabase JWT verification (`auth.py`) using HTTP Bearer tokens.
- Tooling: Ruff, Pytest, and uvicorn for hot-reload development.

## Directory Map
```
backend/
├── src/donna/
│   ├── main.py     # FastAPI app + routes
│   ├── auth.py     # Supabase JWT validation helpers
│   └── config.py   # Settings loader + CORS config
├── data/recordings/  # Saved audio uploads (gitignored)
├── tests/          # Pytest suites
├── pyproject.toml  # Ruff + tooling config
└── uv.lock         # Resolved dependencies
```

## Runtime Responsibilities
- `GET /` and `GET /health` offer quick probes for uptime checks.
- `GET /api/v1/me` returns decoded Supabase identity for authenticated calls.
- `POST /api/v1/voice/capture` stores uploaded `.webm` files to `data/recordings/USER_TIMESTAMP.webm`. TODO hooks (Whisper → structured markdown export) plug in after the file save.
- CORS is open to `settings.ALLOWED_ORIGINS` so the Next.js app can hit the API during local or hosted runs.

## Auth & Security
- Every protected route depends on `get_current_user`, which validates Supabase HS256 JWTs (`aud=authenticated`) and raises FastAPI HTTP errors on expiry, signature mismatch, or missing claims.
- Set `SUPABASE_JWT_SECRET` and `SUPABASE_URL` in `.env` (loaded automatically). Missing secrets fail fast with 500 errors to avoid silent misconfigurations.

## Operations
```bash
uv venv --python 3.12          # one-time setup
source .venv/bin/activate
uv sync                        # install deps
uv run uvicorn donna.main:app --reload --host 0.0.0.0 --port 8000
pytest                         # run backend tests
```

## Data Ownership
- Raw captures stay on disk under `backend/data/recordings/`.
- Processed insights must be emitted into the shared `/user-data` tree (see repo root `AGENTS.md`) once the transcription/structuring pipeline is wired in—backend agents are responsible for that write path.



# IMPORTANT NOTE:
After any important change to the backend, make sure to update this file appropriately.
