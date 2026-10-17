# ADR 0006: Slide-pinned exercises, and real-sourced AI-workflow content

## Status
Accepted

## Context
User wanted to learn AI-assisted-development content tonight, specifically grounded in how named, well-known practitioners at real companies actually configure their agentic coding setups — not generic listicle advice — with mini-exercises attached to the relevant slide wherever possible, or a concrete instruction where a quiz doesn't fit.

## Decisions

1. **`Exercise.content_block_id` added as nullable, additive column** (migration `e79b2151626b`) rather than replacing `learning_session_id`. An exercise can now optionally pin to one slide; existing lesson-level exercises (the original 2 MCQs from ADR 0002/0005) needed no migration and stayed exactly where they were. This was a deliberate scope cut: a fully-normalized "exercises always belong to a block" model was considered and rejected as unnecessary churn for zero behavioral gain — the nullable column gets the same end-user outcome (exercises shown next to their slide) at much lower risk.

2. **`ContentBlockDetail` gained its own `exercises` list**; `LearningSessionDetail.exercises` now means specifically "lesson-level, not pinned to any slide" — kept for backward compatibility and for an optional lesson-wide wrap-up quiz, but empty for all new content in this slice.

3. **Not every slide got a formal MCQ.** Several slides instead end with a plain "Try this tonight: ..." instruction (e.g., trimming your own CLAUDE.md, writing a 3-sentence plain-text description of a recurring workflow) — matching the user's explicit "mini-exercises whenever possible, OR instructions on what to do." A quiz doesn't fit every claim; some things are better practiced than tested.

4. **Frontend structural fix required**: `ContentBlocks`' page-view previously wrapped each entire block (heading + body) in one `<button>` to make it clickable for notes. Adding exercises (which contain their own `<input type="radio">` and `<button>` elements) inside that would have nested interactive elements inside a `<button>` — invalid HTML, and in practice it breaks click targeting unpredictably across browsers. Restructured so only the heading itself is the clickable "open notes" button; body and exercises render as normal sibling content in a non-interactive wrapping `<div>`. Added a regression test asserting an exercise's radio input has no `<button>` ancestor.

5. **Content is attributed to specific named sources, with explicit sourcing confidence**: Armin Ronacher (Flask/Jinja2 creator) and Simon Willison (Datasette creator) for individual-practitioner setups — both primary-source blog posts, high confidence. Geoffrey Huntley for the "Ralph Wiggum" unattended-loop technique — primary naming confirmed, some surrounding details (exact dates, Claude Code's native packaging of it) come from secondary blog coverage and are phrased accordingly. Git-worktree parallelization and its practical limits — presented as "practitioner reports" since every source for this was a blog post, not a primary/official one. Anthropic's own "How Anthropic teams use Claude Code" case study — official primary source, high confidence, except the specific "~65% of PRs" figure which is attributed to secondary conference-talk coverage, not the case study itself, and phrased with that caveat.

6. **Two new 25-minute learning sessions** (sequence 3 "Real Setups," sequence 4 "Scaling Up") under the existing topic `70-ai-assisted-software-development` — extends ADR 0005's content rather than creating new topics, since this is the same subject area.

## Consequences
- `pytest`: 27 tests pass (new block-scoped-exercise coverage in `test_learning_sessions.py` and `test_seed.py`).
- Vitest: 47 tests pass (new tests for block-pinned exercise rendering in both page/slide view, and the nested-button regression check).
- `tsc`, ESLint, `next build` all clean.
- Verified against the **live running dev stack**: migration applied without touching existing `study_sessions`/`exercise_submissions` data (1 each, preserved); reseed added exactly the expected counts (5 learning sessions, 28 content blocks, 7 exercises, 4 of them block-scoped) and was confirmed idempotent on a second run; a full exercise submission round-trip (correct and incorrect) was curled directly against the new block-scoped exercise with no answer-key leak.
- **Verified visually with Playwright** (installed ad hoc, see ADR 0005's second revision and `feedback_playwright_available` memory) against the live stack: answered a block-pinned exercise in page view (got "Correct!"), confirmed clicking its radio button did *not* open the notes panel (proving the structural fix), confirmed the same exercise also renders correctly in slide view, zero console errors, and took a screenshot.
- Content research used `WebSearch` (extended mode, 7 queries) rather than relying on pretrained knowledge, since this space moves fast and today's date is well past this model's training cutoff — sources are listed in the chat transcript, not duplicated here.
