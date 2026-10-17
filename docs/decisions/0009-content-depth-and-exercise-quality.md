# ADR 0009: Tripled content depth, more exercises per slide, and fixed a real answer-length bias

## Status
Accepted

## Context
User feedback on the AI-Assisted Software Development content: sections were too lean (wanted ~3x the content with concrete examples), too few questions per section to meaningfully check learning, and a request to randomize which letter the correct answer appears under plus keep answer lengths similar so "pick the longest option" isn't a viable strategy.

## Decisions

1. **Answer-position randomization is a runtime fix in `ExerciseQuiz`, not a content-authoring one.** Added a Fisher-Yates shuffle of display order, computed once per mount via a lazy `useState` initializer. Selection and submission still use the *original* index from `definition_json` throughout — the backend is completely unaware of the shuffle, so no API or scoring change was needed. This guarantees every render is randomized, rather than relying on manually varying `correct_index` across questions (which would only fix the static distribution, not per-view repetition). Added visible A/B/C/D letter labels so the randomization is concrete to the learner, not just an invisible implementation detail.

2. **Found a real, measurable answer-length bias while auditing the existing + new exercises**: the correct answer was the *uniquely longest* option in 20 of 25 questions (80%, versus a ~25% chance baseline for 4 options) — a classic "pick the longest answer" tell that would let someone score well without knowing the material. This wasn't contrived for this ADR; writing accurate correct answers naturally produces more complete phrasing, which naturally runs longer, unless actively checked. Wrote a one-off audit script (word-count spread + unique-vs-tied-longest per question) and manually rebalanced every flagged option set to bring the "correct answer is uniquely longest" rate to 0/25, with only minor (≤1 word) ties remaining elsewhere.

3. **Content roughly tripled per block** (measured: most blocks went from ~300-800 characters to ~900-1800), each with a concrete example — a sample CLAUDE.md snippet, a worked plan output, specific code/API scenarios — rather than restating the same claim in more words. Exercise count went from 7 to 25 (every block except pure intro/wrap-up ones now has at least one), moving most exercises from lesson-level ("Check your understanding" wrap-up) to slide-pinned, using the `content_block_id` mechanism from ADR 0006.

4. **Found and fixed a real gap in `seed.py` while reseeding this content**: the loader only ever *inserted* rows that didn't exist yet — editing a `heading`/`body`/`prompt`/`definition_json` in the source JSON and re-running `flask seed` silently did nothing once that row already existed in the database. This meant the content rewrite in this ADR would not have reached the live app at all without fixing the loader to upsert (update existing rows' fields, not just skip them). Added a regression test (`test_seed_all_updates_existing_rows_not_just_inserts_missing_ones`) that deliberately staleness-injects a block/session/exercise, reseeds, and asserts the stale values were overwritten.

5. **Manually cleaned up 2 orphaned exercise rows** created as a side effect of the content restructure: lessons 1 and 2 previously had a single *lesson-level* exercise each (from before ADR 0006 introduced slide-pinning); this rewrite moved the same questions into their relevant content block. The loader has no mechanism to prune rows no longer referenced by the source file (a different, harder problem — distinguishing "removed from content" from "real user data to preserve" — deliberately not solved here), so the two now-orphaned rows (plus 3 of my own test `exercise_submissions` referencing one of them) were deleted directly via SQL after confirming they were test data, not anything a real user had produced.

## Consequences
- `pytest`: 29 tests pass (new upsert-regression test, updated exercise-count assertion for the now-larger content set).
- Vitest: 57 tests pass (new tests for shuffled display order using a mocked `Math.random` for determinism, letter labeling, and that original-index selection/scoring is preserved regardless of display order).
- `tsc`, ESLint, `next build` all clean.
- Verified against the live stack: reseeded and confirmed via direct SQL that body/heading/prompt text actually changed in place (not just inserted-if-missing), confirmed idempotency on a second reseed (exercise count stable at 26 — 25 for this topic + 1 pre-existing for `browser-rendering`), and confirmed via Playwright that the expanded content and lettered, scoring-correct exercises render properly with zero console errors.
- This is the first time in this project a straightforward-looking content edit surfaced a real application bug (the seed loader) rather than just being content — worth remembering that "just editing the JSON" isn't actually risk-free in this codebase until the loader is upsert-safe, which it now is.
