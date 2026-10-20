# ADR 0025: Experimental lesson content-width control

## Status
Accepted

## Context
User feedback: the lesson page's content area (`apps/web/src/app/learning/[id]/page.tsx`) is capped at a fixed `max-w-2xl` (672px) regardless of viewport size, which feels narrow on a large screen and doesn't scale with the viewport at all. The user wants to try different widths live to find what feels right, rather than have a value picked for them — "I want to test out the toggle... the value itself might vary."

## Decisions
1. **A `vw`-relative slider, not a bigger fixed pixel cap.** A fixed-pixel alternative (e.g. `max-w-4xl`) would still not scale with the viewport, just move the ceiling. The control sets `max-width` as a percentage of the viewport width (40-100vw) via inline style, so the content area actually grows and shrinks with the window, which is what was asked for.
2. **`null` (no override) is the default state**, falling back to the existing `max-w-2xl` Tailwind class — so until the user touches the slider, behavior is pixel-identical to before this change. Touching the slider switches to the `vw`-based override; "Reset" clears it back to `null`/default.
3. **Persisted in `localStorage`** (`egh:content-width-vw`, matching `pomodoro-timer.tsx`'s existing `egh:study-session:` key-naming convention), not a backend setting — this is explicitly a per-browser experiment, not a feature decision to persist server-side yet. Corrupted/out-of-range stored values are clamped or ignored rather than breaking the page.
4. **New `useContentWidth` hook** (`src/hooks/use-content-width.ts`) and **`ContentWidthContainer`** component (`src/components/content-width-container.tsx`), which replaces the lesson page's static `<main>` tag and renders the slider control (a `<details>` disclosure, matching `tier-legend.tsx`'s existing collapsible pattern) directly above the lesson content.
5. **Scoped to the lesson page only**, per the user's specific complaint — not applied to the dashboard, topics, or leadership pages, which have the same `max-w-2xl`/`max-w-4xl` pattern but weren't what was asked about. Extending it elsewhere is a trivial follow-up (reuse the same container) if the user likes the result.
6. **Found and fixed a real lint violation while writing the hook**: the mount-time localStorage read called `setState` directly in the `useEffect` body, which `react-hooks/set-state-in-effect` flags; wrapping it in a named inner function called by the effect (matching `pomodoro-timer.tsx`'s existing `restore()` pattern) satisfies the rule without changing behavior.

## Consequences
- `npx vitest run`: 108 tests pass (98 before this slice + 10 new: hook persistence/clamping/reset, container default/override/reset/restore-on-mount). `eslint`/`prettier`/`tsc` all clean.
- Verified against the live dev stack with a real browser (Playwright): confirmed the default computed width is still exactly 672px with no override; confirmed moving the slider to 90 sets `max-width: 90vw` and persists across a reload; confirmed, by resizing the same page's viewport to 1000px/1920px/1400px without reloading, that the computed width tracks `90% of viewport width` exactly at each size (900px/1728px/1260px) — genuinely viewport-relative, not just a bigger fixed number.
- This is explicitly experimental tooling, not a finished design decision — no specific width was chosen as "correct." Once the user settles on a value they like, a follow-up could either hardcode it as the new default `max-w-*` (removing the control) or keep the control as a permanent reading-width preference; neither decision was made here.
