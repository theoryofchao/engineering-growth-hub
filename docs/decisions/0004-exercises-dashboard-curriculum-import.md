# ADR 0004: Exercises, progress, dashboard, and importing CURRICULUM.md's 80-module breadth

## Status
Accepted

## Context
Two things converged in this slice: (1) the last remaining Milestone 1 vertical slices — a quiz exercise type with submission/progress persistence, and a dashboard — and (2) a new `CURRICULUM.md` the user added as the canonical 80-module/16-domain curriculum source of truth, plus a request to show the full curriculum breadth on the homepage with unauthored topics marked WIP/disabled.

`CURRICULUM.md`'s taxonomy (domain → module[80] → subtopic) doesn't map 1:1 onto the existing `Domain → Module → Topic → LearningSession` schema from `docs/ARCHITECTURE.md`. Asked the user to confirm scope before committing to an approach; they chose full 80-module breadth now rather than growing the list organically or importing a subset.

## Decisions

1. **`Topic` = CURRICULUM.md's "module" granularity**, not its domain or its finer subtopics. This is also the right level for mastery tracking — `docs/PRODUCT.md` tracks mastery per topic, and CURRICULUM.md assigns one proficiency tier per module, matching exactly. Importing at the subtopic level (~480 items) would have been far too granular for a homepage card; importing at the domain level (16) would have lost the "80 modules" breadth the user explicitly asked to see.

2. **Moved `proficiency_tier` from `Module` to `Topic`** (migration `75e4d58abe67`). It was on `Module` before `CURRICULUM.md` existed, as a free-text `String(50)` with no constraint. Now it's a constrained `String(1)` (`D`/`W`/`L`/`G`) on `Topic`, matching where CURRICULUM.md actually assigns tiers. Reset the local dev Postgres database (`DROP`/`CREATE DATABASE`, not the Docker volume) before autogenerating this migration so Alembic wouldn't need a data-backfill step for the new `NOT NULL` column — there was no real data to preserve, just my own test fixtures from this session.

3. **`Module` is now a structural pass-through**, one per domain, named after the domain. It no longer carries meaningful data of its own. This keeps the existing FK chain intact (every `Topic` still needs a `module_id`) without inventing a middle tier CURRICULUM.md doesn't have.

4. **Alembic's autogenerate does not reliably detect CHECK constraint changes on an existing table being `ALTER`ed** (only on full `CREATE TABLE`) — had to hand-add `batch_op.create_check_constraint(...)` for `topics.proficiency_tier`; autogenerate would have silently produced a migration with no constraint otherwise.

5. **Two seed loaders, explicit ordering.** `load_curriculum_map()` imports all 80 modules as `Topic` metadata (title, tier, description) with zero learning sessions — this is what makes the homepage show breadth with WIP badges. `load_file()` (existing, from ADR 0002) attaches real lesson content to a topic by matching slug. `seed_all()` always runs the map first, by filename, not by relying on alphabetical glob order — a lesson file whose name sorts before `curriculum-map.json` would otherwise create a duplicate topic instead of attaching to the map's placeholder.

6. **Known, intentional overlap**: the existing "Browser Rendering" topic (ADR 0002, predates `CURRICULUM.md`) lives under a legacy "Frontend Engineering" domain, while `CURRICULUM.md`'s equivalent is "Web & Frontend" module 15, "Browser Internals" — now a separate WIP topic. Did not merge/rename to avoid silently rewriting existing seeded content; flagged here for Milestone 2 to reconcile properly when the real import pipeline lands. After this slice: 17 domains, 81 topics (80 from the map + this one legacy extra).

7. **Exercises are multiple-choice only** (`type` constrained to `'multiple_choice'`), per `docs/PRODUCT.md`'s "first version: MCQ." The answer key (`correct_index`, `explanation`) lives in `Exercise.definition_json` and is stripped server-side (`ExerciseSummary` schema) until after a submission is scored (`ExerciseSubmissionResult`) — never shipped to the client up front.

8. **`UserProgress` has no `user_id`** (same reasoning as `StudySession` in ADR 0003 — no users table yet) and is keyed uniquely by `topic_id`. Status only ever advances forward (`not_started → learning → practiced → mastered`, via `UserProgress.advance_to`), never regresses. **`mastered` has no automatic trigger yet** — there's no well-defined MVP signal for it (repeated correct answers? a harder assessment type?). Left as a reachable enum value but undriven; flagged as open follow-up rather than inventing an arbitrary heuristic.

9. **Dashboard excludes WIP topics** (`Topic.query.join(Topic.learning_sessions)`) — only topics with at least one authored lesson appear, so the dashboard isn't dominated by 79 "not started" rows with nothing behind them.

10. **Content**: seeded two new learning sessions under module 70 ("AI-Assisted Software Development"), grounded in the senior-engineer-workflow and productivity-measurement research from this session (METR trial, DORA/DX survey gaps), each with one MCQ exercise.

## Consequences
- `pytest`: 22 tests pass (6 new test files/additions covering seed map import, exercises, dashboard, topics).
- Vitest: 22 tests pass (new `TopicList`, `ExerciseQuiz`, `DashboardSummary` components plus updated `LessonContent` coverage).
- `tsc`, ESLint, and `next build` all clean; `/dashboard` and the full topic-list homepage both build as static shells (no dynamic params, unlike `/learning/[id]`).
- Verified end-to-end against real Postgres: full curriculum map import (17 domains, 81 topics, 79 WIP), submission → progress → dashboard chain, and the client-safe exercise payload (no `correct_index` leak) — all via live `curl`.
- **Discovered mid-session**: a full `docker compose` stack (web, api, db) was already running, started independently of this session's commands, and had been live-reloading against my file edits and serving my own test `curl` requests the whole time. No data was lost — the dev database reset in decision #2 was absorbed transparently (Flask-SQLAlchemy reconnects per-request) — but this should be confirmed with the user rather than assumed safe next time.
- No browser automation tool was available this session; UI changes are verified via Vitest + live API/CORS checks, not a visual screenshot, same caveat as ADR 0002/0003.
