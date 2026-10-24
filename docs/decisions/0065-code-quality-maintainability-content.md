# ADR 0065: Code Readability and Naming content, module 11 session 1

## Status

Accepted

## Context

Continuing the computed prioritization plan (ADR 0056-0064). Recomputing the prerequisite graph after module 5 shipped surfaced a six-way tie at the top (modules 11, 14, 24, 31, 38, 48, each at second-order value 1). Module 11 (Code Quality & Maintainability) was picked for direct continuity with the already-active Programming & Code Quality domain (modules 8, 10, 12 already shipped; 11 is both of its prerequisites' direct successor and the natural next piece of that domain).

Session 1 covers subtopic 11.1 (Code readability and naming), following the module's natural subtopic order -- no prior session has covered naming/readability specifically (module 10 covered SOLID/DRY/KISS/YAGNI at the architecture-pattern level, a different granularity), so there was no overlap to design around.

## Decisions

1. **New section** `content/curriculum/11-code-quality-maintainability/`, attaching to the existing placeholder under "Programming & Code Quality" (reusing `Module` id 2, the same one modules 8/9/10/12/13 use).
2. **Session 1 frames a bad name as a genuine code smell**, citing Martin Fowler's bliki entry on code smells (`martinfowler.com/bliki/CodeSmell.html`), which also correctly attributes the "code smell" term's coinage to Kent Beck. Covers what makes a name actually good (precisely distinguishing intent, not just length), the more dangerous failure mode of a name that actively misleads (promising more than the code does), and the one-time-rename-cost-vs-recurring-confusion-cost asymmetry.
3. **Explicit continuity callback, not a restatement**: the rename-cost asymmetry is tied to module 10's YAGNI argument as the same one-time-vs-recurring-cost shape applied in the opposite direction (YAGNI: don't pay now for a maybe-future benefit; naming: do pay the small cost now, since the alternative is a cost every future reader re-pays).
4. **A concrete worked bug (block 5)** -- an `isValid` flag that only reflects a format check, trusted downstream as if it meant full validation -- illustrates the misleading-name failure mode with a specific, traceable root cause rather than an abstract claim.
5. **No code exercise** -- naming/readability judgment doesn't reduce to a gradable function, consistent with other conceptual sessions this effort has built.
6. **First-draft bias audit flagged 1 of 4 quizzes**; rebalanced to 0/4. Three of six blocks needed a padding pass to clear 900 characters.

## Consequences

- `pytest`: 139 passed (unchanged -- pure content; confirmed the section reused `Module` id 2 rather than creating a duplicate). Grepped the test suite for the new slug before seeding -- no hits, so no test fixes were needed this time.
- Verified against the live dev stack via Playwright: section and lesson pages render, the Fowler reference link renders with the correct href and resolves live (200), the poorly-scoped-function quiz was answered correctly through the real UI, and no raw/unparsed markdown leaked into rendered text. Zero console/page errors. All test-generated `exercise_submissions`/`exercise_review_states`/`user_progress` rows deleted afterward via direct `psql`.
- Recomputing the prerequisite graph after this module should be the first step of the next priority pass, per the standing method -- this ADR's starting six-way tie (11, 14, 24, 31, 38, 48) is now out of date with 11 shipped.
