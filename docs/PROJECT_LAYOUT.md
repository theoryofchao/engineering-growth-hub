# Project layout — current actual state

This documents what's actually built, as of 2026-10-15 (end of Milestone 1's core loop). Unlike `docs/ARCHITECTURE.md` (the original proposed shape) and `docs/ROADMAP.md` (what's planned), this file describes what exists right now. It will go stale — treat it as a snapshot, not a contract; prefer reading the code when in doubt.

## Directory tree

```text
engineering-growth-hub/
├── apps/
│   ├── api/                       Flask backend
│   │   ├── app/
│   │   │   ├── __init__.py        App factory: registers blueprints, CORS, 404/400 JSON handlers, `flask seed` CLI command
│   │   │   ├── config.py          Dev/testing/prod config classes (DATABASE_URL, CORS_ORIGINS)
│   │   │   ├── extensions.py      Shared `db = SQLAlchemy()` instance
│   │   │   ├── models.py          All SQLAlchemy models (see below)
│   │   │   ├── schemas.py         Pydantic response contracts
│   │   │   ├── seed.py            Idempotent content loader (see "Content & seeding")
│   │   │   └── routes/
│   │   │       ├── health.py              GET /api/v1/health
│   │   │       ├── learning_sessions.py   GET /api/v1/learning-sessions/<id>
│   │   │       ├── study_sessions.py      POST/GET/PATCH /api/v1/study-sessions[/<id>]  (Pomodoro timer)
│   │   │       ├── exercises.py           POST /api/v1/exercises/<id>/submissions
│   │   │       ├── dashboard.py           GET /api/v1/dashboard/summary
│   │   │       └── topics.py              GET /api/v1/topics  (full curriculum breadth, for homepage)
│   │   ├── migrations/versions/   3 Alembic migrations (see "Migrations")
│   │   ├── tests/                 pytest, one file per route/concern, run against SQLite
│   │   └── wsgi.py
│   └── web/                        Next.js frontend (App Router, TypeScript, Tailwind v4)
│       └── src/
│           ├── app/
│           │   ├── page.tsx               Homepage: full curriculum (TopicList) + health check
│           │   ├── dashboard/page.tsx     Progress dashboard
│           │   ├── learning/[id]/page.tsx Lesson page (dynamic route, wrapped in <Suspense> per Next 16 Cache Components)
│           │   └── layout.tsx
│           ├── components/        One component per concern, each with a co-located `.test.tsx`:
│           │   ├── health-status.tsx      API/DB connectivity check (client-fetch pattern all others follow)
│           │   ├── topic-list.tsx         Homepage: collapsible per-domain sections, completed/total fraction, WIP badges
│           │   ├── lesson-content.tsx     Lesson page: renders content, embeds timer + quizzes
│           │   ├── pomodoro-timer.tsx     25/5 or 50/10 timer, reload-safe (server-authoritative elapsed time)
│           │   ├── exercise-quiz.tsx      MCQ exercise UI
│           │   └── dashboard-summary.tsx  Study time + per-topic status/exercise stats
│           └── lib/config.ts       API_BASE_URL from NEXT_PUBLIC_API_BASE_URL
├── content/curriculum/            Seed content (data, not code — see "Content & seeding")
├── docs/
│   ├── PRODUCT.md / ARCHITECTURE.md / ROADMAP.md   Original planning docs (read first, per CLAUDE.md)
│   ├── PROJECT_LAYOUT.md          This file
│   └── decisions/                 ADRs — the real decision log; read these for *why*, not just *what*
├── CURRICULUM.md                  80-module/16-domain curriculum source of truth (user-authored, separate from docs/)
└── compose.yaml                   Postgres + api + web, local dev
```

## Data model (`apps/api/app/models.py`)

```text
Domain ─┬─< Module ─┬─< Topic ─┬─< LearningSession ─┬─< StudySession   (Pomodoro runs)
        │  (thin     │  (CURRICULUM.md's            │                 server-authoritative elapsed time
        │  pass-     │   "module" granularity;       ├─< Exercise ─┬─< ExerciseSubmission
        │  through)  │   carries proficiency_tier)   │  (MCQ only) │  (score, answer, scores progress)
        │            │                                 │             
        │            └─< UserProgress (1:1 with Topic; not_started→learning→practiced→mastered,
        │                forward-only; no "mastered" trigger implemented yet)
```

- **No `user_id` anywhere** — single-user MVP, no auth table exists yet. Deferred intentionally (see ADRs 0003/0004), not an oversight.
- **No `parent_topic_id` / prerequisite tracking** — also deferred; `CURRICULUM.md` records prerequisites as text, not yet modeled relationally.
- 81 `Topic` rows exist: 80 from `CURRICULUM.md`'s full import (almost all with zero `LearningSession`s — intentionally WIP) + 1 legacy topic ("Browser Rendering") that predates the import and hasn't been reconciled with its `CURRICULUM.md` counterpart (module 15, "Browser Internals"). See ADR 0004.

## Content & seeding (`content/curriculum/*.json`, loaded by `apps/api/app/seed.py`)

Run via `flask seed`. Two distinct file shapes, loaded in a fixed order (map first, always, regardless of filename):

1. **`curriculum-map.json`** — the full `CURRICULUM.md` breadth: 16 domains, 80 modules, imported as `Topic` metadata only (title, tier, description). No lesson content. This is what makes the homepage's WIP/disabled styling meaningful.
2. **Per-lesson files** (`frontend-engineering.json`, `ai-assisted-software-development.json`) — attach real `LearningSession` + `Exercise` content to a topic, matched by slug. A new lesson file must use the exact same `Topic.slug` format (`{id:02d}-{slugified-title}`) as the map, or it'll create a duplicate topic instead of attaching to the placeholder.

Currently only 2 of the 81 topics have real lesson content: `browser-rendering` and `70-ai-assisted-software-development`.

## Migrations (`apps/api/migrations/versions/`, chronological)

1. `062cd1f66925` — `domains`, `modules`, `topics`, `learning_sessions`.
2. `fca3cbd1aa6a` — `study_sessions` (Pomodoro).
3. `75e4d58abe67` — `exercises`, `exercise_submissions`, `user_progress`; moves `proficiency_tier` from `modules` to `topics`.

## Tests

- Backend: `apps/api/tests/*.py`, pytest against SQLite (`conftest.py` fixture). 22 tests.
- Frontend: `apps/web/src/components/*.test.tsx`, Vitest + Testing Library, one file per component, `fetch` mocked. 25 tests.
- Neither suite talks to a real Postgres — that's done manually (via `curl`) during development, not in CI yet. There is no CI configured yet.

## Known gaps (intentionally deferred, not oversights)

- No commits in git yet as of this writing — see the commit instructions given alongside this doc.
- No browser automation tool has been available in any session so far; all UI verification has been via component tests + live API checks, never an actual rendered screenshot.
- Legacy "Frontend Engineering" domain / "Browser Rendering" topic vs. `CURRICULUM.md`'s "Web & Frontend" / module 15 overlap (ADR 0004) — not reconciled.
- `UserProgress.status` can reach `"mastered"` in the data model but nothing ever sets it — no MVP-appropriate trigger has been defined yet.
- No auth, no `user_id` on any table, no payments/entitlements — all explicitly out of scope per `docs/PRODUCT.md` and `docs/ARCHITECTURE.md` until later milestones.
