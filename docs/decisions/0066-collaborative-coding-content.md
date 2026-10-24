# ADR 0066: Pull Requests and Code Review content, module 13 session 1

## Status

Accepted

## Context

Continuing the computed prioritization plan (ADR 0056-0065). Recomputing the prerequisite graph after module 11 shipped surfaced a six-way tie at the top (modules 13, 14, 24, 31, 38, 48, each at second-order value 1). Module 13 (Collaborative Coding) was picked for direct continuity -- all three of its prerequisites (10, 11, 12) were authored in this same pass, in order, immediately before it.

**Correction to an initial framing**: this ADR's drafting notes briefly described module 13 as completing the entire Programming & Code Quality domain (modules 8-13). That's inaccurate -- module 9 (Programming Paradigms) remains unauthored, so the domain sits at 5 of its 6 modules after this session, not 6 of 6. Flagging this explicitly so it doesn't propagate into memory as a false "domain complete" milestone.

Session 1 covers subtopic 13.1 (Pull requests and code review), following the module's natural subtopic order and matching the module's own proficiency assessment ("review a seeded flawed PR").

## Decisions

1. **New section** `content/curriculum/13-collaborative-coding/`, attaching to the existing placeholder under "Programming & Code Quality" (reusing `Module` id 2, the same one modules 8/10/11/12 use).
2. **Session 1 is anchored on Google's own published engineering practices**, citing the official "Standard of Code Review" (`google.github.io/eng-practices/review/reviewer/standard.html`, correctly citing its real content: favor approving a change that clearly improves code health even if imperfect, since "there's no such thing as perfect code, only better code") and "Small CLs" (`google.github.io/eng-practices/review/developer/small-cls.html`) for the change-size-affects-review-quality point -- both confirmed via WebSearch before drafting, not assumed from general reputation.
3. **Must-fix vs. nice-to-have feedback framing (block 2)** operationalizes the code-health standard into a concrete practice: explicitly tagging feedback (e.g. "blocking:"/"nit:") rather than leaving every comment's priority ambiguous.
4. **Two deliberate continuity callbacks, not restatements**: review as complementary to (not a substitute for) automated testing, tied to module 40's testing-fundamentals content; and small-PR bisectability, tied to module 12's point about commit granularity bounding bisect's precision.
5. **A worked scenario (block 5) distinguishes a real bug (unbounded retry loop) from a style preference (unclear naming)** within one PR, applying the must-fix/nice-to-have framework concretely.
6. **No code exercise** -- review judgment doesn't reduce to a gradable function, consistent with other conceptual sessions this effort has built.
7. **First-draft bias audit flagged 2 of 5 quizzes**; rebalanced to 0/5 over two passes (one quiz needed a second length adjustment after the first pass left it still flagged by a few characters). Two of six blocks needed a padding pass to clear 900 characters.

## Consequences

- `pytest`: 139 passed (unchanged -- pure content; confirmed the section reused `Module` id 2 rather than creating a duplicate). Grepped the test suite for the new slug before seeding -- no hits, so no test fixes were needed this time.
- Verified against the live dev stack via Playwright: section and lesson pages render, both reference links (Google's code-review standard, Google's Small CLs guidance) render with correct hrefs and resolve live (200), the code-health-standard quiz was answered correctly through the real UI, and no raw/unparsed markdown leaked into rendered text. Zero console/page errors. All test-generated `exercise_submissions`/`exercise_review_states`/`user_progress` rows deleted afterward via direct `psql`.
- Recomputing the prerequisite graph after this module should be the first step of the next priority pass, per the standing method -- this ADR's starting six-way tie (13, 14, 24, 31, 38, 48) is now out of date with 13 shipped. Module 9 (Programming Paradigms) remains the one gap in this domain and is a reasonable low-effort pick for a future pass even though its second-order unlock value is currently 0.
