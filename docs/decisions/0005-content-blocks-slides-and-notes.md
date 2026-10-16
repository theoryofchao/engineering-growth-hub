# ADR 0005: Content blocks (page/slide view) and per-section notes

## Status
Accepted

## Context
User asked for lesson content to be viewable as either a continuous page or a slide deck, with a way to see which "section" of a page corresponds to which slide (a dotted-outline toggle), and to attach personal notes to a section — persisted to the database (confirmed explicitly over a localStorage-only MVP, via two clarifying questions before starting).

## Decisions

1. **`LearningSession.content` (a single Text blob) replaced with `ContentBlock` rows** (heading + body, ordered by `sequence`). Blocks are authored explicitly in the seed JSON (`content_blocks: [{heading, body}, ...]`), not auto-split from prose — consistent with this project's standing principle that content is authored data, not derived in code. This is also what gives each section a stable ID to attach a note to and to use as a slide.

2. **`Note` is 1:1 per `ContentBlock`** (`UniqueConstraint` on `content_block_id`), upserted in place via `Note.upsert()` — a single evolving note per section, not a log of timestamped entries. No `user_id` (same reasoning as every other table in this schema — single-user MVP, no auth yet).

3. **Migration applied additively, not via a DB reset this time.** Unlike ADR 0004, this migration only adds two new (empty) tables and drops one now-unused column — no `NOT NULL`-on-existing-data backfill problem, so there was no need to wipe local data. This mattered in practice: the auto-mode permission classifier blocked a `DROP DATABASE` attempt (flagged as a mass-delete), which turned out to be the right call — there was real data in the running dev stack (seeded content plus a few of my own earlier test submissions) that a reset would have destroyed unnecessarily.

4. **Two view modes, client-side only, no new backend concept.** "Page" view renders all blocks in sequence (same as the old single-blob rendering); "Slide" view shows one block at a time with Prev/Next. The "show section boundaries" toggle (page view only) adds a dashed border and makes each block clickable, opening the notes drawer — this is purely a `ContentBlocks` component concern, not reflected in any API shape.

5. **Notes drawer is a right-side flyout**, not a full modal takeover — `role="dialog"`, closes on Escape/backdrop click/explicit close, matching the "modal/fly-out drawer" framing from the request. Save is disabled on an empty draft; Delete only appears when a note already exists.

6. **The answer-key-style "don't leak until scored" pattern from exercises doesn't apply here** — a learner's own note has no secret to protect, so `ContentBlockDetail` just includes `note` directly in the learning-session response rather than needing a separate fetch.

## Consequences
- `pytest`: 26 tests pass (new `test_notes.py`, plus `ContentBlock` coverage added to `test_seed.py`/`test_learning_sessions.py`).
- Vitest: 36 tests pass (new `ContentBlocks` and `NotesDrawer` component tests).
- `tsc`, ESLint, `next build` all clean.
- Verified end-to-end against the **live running dev stack** (not a fresh one) — confirmed existing `study_sessions`/`exercise_submissions`/`user_progress` rows survived the migration, content blocks were added for the 2 existing lessons (16 total, matching 3+7+6 authored blocks), and a full note create → read → delete cycle worked over the real API with no errors in either container's logs.
- The two existing lesson content files were rewritten into block form (3 blocks for "Critical Rendering Path", 7 + 6 for the two AI lessons) — same text, just segmented with headings; no content was changed.
