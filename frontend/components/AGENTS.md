# Frontend Components Guide

## Philosophy
- Components showcase Donna’s conversational capture loop while keeping the rest of the UI quiet.
- Shared providers stay declarative; interactive surfaces own their own effects (audio, animation, gesture).
- Document novel patterns here so the top-level `frontend/AGENTS.md` can stay short.

## Voice Recorder Orb (`voice-recorder.tsx`)
The orb anchors natural-language capture and mirrors Donna’s “listen first” posture.

### Visual System
- **Idle:** floating core with layered glow rings, slow shimmer (Tailwind custom animations: `animate-float`, `animate-pulse-glow`, `animate-pulse-glow-outer`, `animate-shimmer`).
- **Recording:** intensified scale, faster shimmer loop, audio-reactive bars (7 concentric circles) driven by analyser node data.
- **Feedback:** green hue on upload success, red wash on error—no text overlays to keep the surface calm.

### Interaction Flow
1. Press/hold (mouse or touch) kicks off MediaRecorder capture.
2. Real-time audio levels update the orb via `AnalyserNode` FFT (size 256) for smooth gradients.
3. Releasing stops capture, packages `webm` blob, and calls the authenticated API client.
4. UI resets to idle once the upload promise resolves.

### Technical Notes
- Uses the browser `MediaRecorder` API; ensure HTTPS for production to unlock mic permissions.
- Audio uploads hit `POST /api/v1/voice/capture` with Supabase JWT automatically added by `lib/api-client`.
- Store transient state with local React hooks; long-running effects (audio context) clean up on unmount to prevent leaks.
- Animations rely on CSS variables + Tailwind keyframes defined in `globals.css`. Keep any new states declared there.

## Other Components
- `components/providers/query-provider.tsx` wraps TanStack Query + Supabase context; keep lightweight and server-render safe.
- `components/user-info.tsx` demonstrates authenticated layout patterns (avatar + metadata). Use it as the template for future HUD-like surfaces.

Add detailed write-ups for new interactive modules in this file (one section per component) and link back from `frontend/AGENTS.md` as needed.
