# Frontend Components Guide

## Philosophy
- Components showcase Donna's conversational capture loop while keeping the rest of the UI quiet.
- Shared providers stay declarative; interactive surfaces own their own effects (audio, animation, gesture).
- Document novel patterns here so the top-level `frontend/AGENTS.md` can stay short.

## Glowy Orb (`glowy-orb.tsx`)
The glowy orb is Donna's radical new minimalist interface—a single, beautiful 3D glass sphere with swirling smoke effects that anchors natural-language voice capture.

### Visual System
- **3D Glass Sphere:** Uses CSS 3D transforms (`perspective`, `preserve-3d`, `rotateX/Y`) to create a realistic glass orb effect
- **Smoke Effects:** Three layered smoke gradients (purple, pink, blue) with independent rotation animations (`animate-smoke-swirl-1/2/3`) create a mesmerizing lava-lamp-like interior
- **Glow Layers:** Multiple concentric glow rings (`animate-smoke-rotate`, `animate-smoke-pulse`, `animate-smoke-drift`) pulse and drift at different speeds for depth
- **Glass Reflections:** Radial gradients simulate light refraction, with shimmer effects (`animate-shimmer-slow`) creating a glassy, translucent appearance
- **Idle State:** Gentle floating animations with soft purple/pink/blue smoke swirling inside a 280px glass sphere
- **Recording State:** Orb scales to 320px, intensifies glow, and displays 12 audio-reactive visualization bars arranged in a circle
- **Upload Feedback:** Subtle green or red border glow on success/error—no text overlays to preserve the zen aesthetic

### Interaction Flow
1. **Mouse/Touch:** Press and hold the orb to start recording; release to stop
2. **Keyboard:** Hold space bar to record; release to stop (global keyboard listener)
3. **Audio Visualization:** Real-time audio levels drive the orb via `AnalyserNode` FFT (size 256)
4. **Upload:** Releasing stops capture, packages `webm` blob, and calls `POST /api/v1/voice/capture`
5. **Reset:** UI returns to idle state after upload completes

### Technical Notes
- **3D CSS:** Orb uses `perspective: 1000px` on container and `transformStyle: preserve-3d` for depth
- **Animations:** All smoke and glow effects defined in `globals.css` as keyframe animations (8-14s durations)
- **Keyboard Support:** Global `keydown`/`keyup` listeners attached via `useEffect`, cleaned up on unmount
- **Audio Context:** `AnalyserNode` with FFT size 256 drives both visualization bars and smoke intensity
- **Accessibility:** Proper ARIA label ("Hold to speak") and button semantics
- **Cleanup:** MediaRecorder, AudioContext, animation frames, and keyboard listeners all properly disposed on unmount
- **Dark Background:** Component includes full-screen gradient background (`bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950`) for maximum visual impact

### Design Intent
The glowy orb embodies Donna's "listen first" philosophy with zero UI chrome—no headers, sidebars, or buttons. Just you and the orb. This radical simplicity removes all friction from voice capture and creates a meditative, focused interaction space.

## Legacy Components
- `voice-recorder.tsx` - Deprecated in favor of `glowy-orb.tsx`
- `user-info.tsx` - Removed from main UI for minimalist design
- `components/providers/query-provider.tsx` wraps TanStack Query + Supabase context; keep lightweight and server-render safe

Add detailed write-ups for new interactive modules in this file (one section per component) and link back from `frontend/AGENTS.md` as needed.
