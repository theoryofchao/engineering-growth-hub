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

## Revision (same day, follow-up)
User feedback: the notes drawer shouldn't block interaction with the rest of the page, and should follow slide navigation automatically — with a save prompt if there are unsaved edits. This changed the design from a modal to a non-blocking inline panel:

- **`NotesDrawer` → `NotesPanel`**: no backdrop, no `fixed`/`aria-modal`. Rendered inline (normal document flow) below the slide/page content. `role="region"`, not `role="dialog"`. It's now a fully controlled component — `draft`, save/delete handlers, and error state all live in `ContentBlocks`, not in the panel itself.
- **Switching which block's notes are shown is centralized in `ContentBlocks.switchActiveBlock()`.** Every path that would change or close the active note (Next/Prev in slide view, clicking a different section in page view, the panel's own close button) routes through it. If the draft differs from the saved note, it calls `window.confirm(...)` once; confirming saves first, declining discards — either way, navigation proceeds. This was a deliberate choice to never trap the user: the point of making it non-modal was to stop blocking movement, so the prompt informs a choice but never prevents it.
- Slide navigation (`goToSlide`) only auto-follows the notes panel if it was already open; clicking Next/Previous with the panel closed behaves exactly as before (no unexpected pop-open).
- Save no longer closes the panel (there's no modal "task" to finish) — it just persists and the panel stays open for continued editing.

## Second revision (same day, after real browser testing)
User reported clicking a section did nothing. Root cause: clicking a block only opened notes when "Show section boundaries" was already checked — undiscoverable, since nothing hinted that the checkbox gated click-ability. Verified with Playwright (installed ad hoc via `npm install --no-save playwright` + `npx playwright install chromium`, not added as a project dependency) against the live running stack: confirmed zero console errors and the panel *did* open correctly once the toggle was on, which narrowed this to a discoverability bug, not a functional one, before changing anything.

Fix: sections are now **always** clickable to open notes; the "Show section boundaries" checkbox only controls the dashed-border visual, decoupled from click behavior. A subtle "Add notes"/"View/edit notes" hover hint and the existing note badge are now always visible regardless of the toggle. Re-verified with the same Playwright script against the fix: clicking a heading with the toggle in its default (off) state now opens the notes panel, confirmed via screenshot.

This is a deviation from the literal original request ("clicking *that area* [the toggled-on outlined area]") — but real usage showed the literal reading wasn't discoverable, so the toggle's job narrowed to "show me the structure visually," and "open notes" became unconditional.

## Consequences
- `pytest`: 26 tests pass (new `test_notes.py`, plus `ContentBlock` coverage added to `test_seed.py`/`test_learning_sessions.py`).
- Vitest: 36 tests pass (new `ContentBlocks` and `NotesDrawer` component tests).
- `tsc`, ESLint, `next build` all clean.
- Verified end-to-end against the **live running dev stack** (not a fresh one) — confirmed existing `study_sessions`/`exercise_submissions`/`user_progress` rows survived the migration, content blocks were added for the 2 existing lessons (16 total, matching 3+7+6 authored blocks), and a full note create → read → delete cycle worked over the real API with no errors in either container's logs.
- The two existing lesson content files were rewritten into block form (3 blocks for "Critical Rendering Path", 7 + 6 for the two AI lessons) — same text, just segmented with headings; no content was changed.
- After the revision: 41 Vitest tests pass (up from 36 — added coverage for the confirm-prompt save/discard paths and non-modal behavior), backend untouched (still 26 pytest, no API shape changed). `tsc`/ESLint/`next build` clean. Hit one real bug while writing the new tests: assertions placed synchronously right after `fireEvent.click` on a now-`async` navigation handler don't see the state update, because `await`-ing even an already-resolved promise defers the continuation to a microtask — fixed by wrapping those assertions in `waitFor`.
- After the second revision: 43 Vitest tests pass (regression test added for "clicking a section with the boundaries toggle off still opens notes"). First time this project had access to real browser verification (ad hoc Playwright) rather than relying solely on component tests + live `curl` — it's what caught that the bug was real and specifically discoverability, not a false alarm or something deeper.
