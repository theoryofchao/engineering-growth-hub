# ADR 0003: Pomodoro timer with server-authoritative, reload-safe elapsed time

## Status
Accepted

## Context
`docs/ROADMAP.md` Milestone 1 calls for a 25/5 and 50/10 Pomodoro timer with pause/resume, a break prompt, and reload-safe persisted timing, separate from learning progress (`docs/PRODUCT.md`). This slice builds on the learning page from the prior slice (ADR 0002).

## Decisions

1. **Elapsed time is computed server-side from timestamps, never trusted from the client.** `StudySession` stores `elapsed_seconds` (frozen accumulation) and `last_resumed_at` (set when active, `null` when paused); `live_elapsed_seconds()` adds `now - last_resumed_at` only while active. This is what makes a page reload safe — the browser never has to reconstruct "how long was I away," it just asks the server for the current truth.

2. **No `mode`/`break_minutes` column.** `mode_minutes` is stored (constrained to 25/50, same convention as `LearningSession.duration_minutes`); `break_minutes` is derived (`{25: 5, 50: 10}`) in the route rather than duplicated in the schema.

3. **State transitions live on the model** (`pause()`, `resume()`, `complete()`), not in the route handler, per the architecture doc's "thin routes, explicit services" principle. The route only dispatches on an `action` string and serializes.

4. **No `user_id` on `study_sessions` yet.** `docs/ARCHITECTURE.md` lists `user_id` on this table, but there's no `users` table and no auth (single-user MVP, per `docs/PRODUCT.md`). Adding a FK to a nonexistent table isn't possible, and an unconstrained nullable column would just be dead weight. Deferred until auth lands.

5. **Added `GET /api/v1/study-sessions/<id>`**, not in `docs/ARCHITECTURE.md`'s starter route list. Reload-safe persistence requires the frontend to re-fetch a session's current state after a reload, and that list was explicitly illustrative, not exhaustive.

6. **Frontend persists only the study-session ID in `localStorage`** (`egh:study-session:<learning_session_id>`), not the elapsed time itself — the ID is a pointer back to the server-authoritative record. On mount, the component fetches that session; a 404 or already-`completed` session clears the key and falls back to the idle "start" state.

7. **Local ticking is cosmetic, not authoritative.** Between fetches, the UI advances a local `setInterval` display using `serverElapsedSeconds + (Date.now() - fetchedAt) / 1000`, but every pause/resume/complete action re-fetches the server's computed value and resets that anchor — client clock drift never compounds across actions.

8. **"Time's up" is a banner, not a forced stop.** Per `docs/PRODUCT.md` ("Timer completion is not the same as topic mastery... do not make prolonged study mandatory"), reaching the target duration shows a break prompt but the timer keeps running; "Finish session" is available at all times, not gated on reaching the target.

9. **Cross-SQLite/Postgres timezone handling**: SQLite drops `tzinfo` on read-back even for `DateTime(timezone=True)` columns; Postgres does not. `live_elapsed_seconds()` defensively re-attaches UTC tzinfo when missing rather than assuming one backend's behavior.

## Consequences
- Verified end-to-end against real Postgres: created/paused/resumed/completed a session via `curl`, confirming elapsed time freezes exactly at pause and resumes correctly; confirmed CORS headers are present for the browser's actual origin on the POST.
- `pytest` (12 new tests covering create/pause/resume/complete/validation/404) and Vitest (5 new tests covering idle/start/restore/pause/complete) both pass. `tsc`, ESLint, and `next build` all pass.
- No browser automation tool was available this session, so the hydrated UI wasn't visually screenshotted — verified instead through component tests (jsdom) plus live API/CORS checks. Worth a manual look before considering this fully done.
- Exercise type, submission, and the dashboard remain open Milestone 1 work.
