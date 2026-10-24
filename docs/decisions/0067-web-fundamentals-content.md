# ADR 0067: Semantic HTML and Forms content, module 14 session 1

## Status

Accepted

## Context

Continuing the computed prioritization plan (ADR 0056-0066). Recomputing the prerequisite graph after module 13 shipped surfaced a six-way tie at the top (modules 14, 24, 31, 38, 48, 74, each at second-order value 1). Module 14 (Web Fundamentals) was picked for direct continuity with module 5 (Computer Networking) and module 8 (Programming Fundamentals), both already shipped, and for opening real content in the Web & Frontend domain beyond the pre-existing legacy "Browser Rendering" topic (a known separate overlap, per `docs/decisions/0004-...md` and project memory -- confirmed via DB query that `14-web-fundamentals` attaches cleanly to `Module` id 3 ("Web & Frontend"), distinct from the legacy "Browser Fundamentals" module id 17 that holds `browser-rendering`).

Session 1 covers subtopic 14.1 (Semantic HTML and forms), following the module's natural subtopic order.

## Decisions

1. **New section** `content/curriculum/14-web-fundamentals/`, attaching to the existing placeholder under "Web & Frontend" (reusing `Module` id 3, the same one modules 15-19 use; confirmed this is a different module from the legacy `browser-rendering` topic's "Browser Fundamentals" module id 17).
2. **Session 1 is anchored on the W3C ARIA Authoring Practices Guide's own framing**: "a role is a promise" -- confirmed the exact phrase appears live on the cited page (`w3.org/WAI/ARIA/apg/practices/read-me-first/`) before citing, not just assumed from a summary. Covers what native elements provide for free (keyboard operability, accessible naming), what repurposing a generic element with ARIA actually commits the author to rebuilding, native form validation/submission behavior, and the accessibility-specific cost of skipping all of it.
3. **A concrete worked example (block 5)**: a custom `<div>`-based dropdown built in place of a native `<select>` for styling flexibility, itemizing the specific behaviors (keyboard navigation, focus trapping, screen-reader announcements) that choice takes on as the author's own responsibility.
4. **No code exercise** -- semantic-HTML judgment doesn't reduce to a gradable function in this platform's JS-execution grading model, consistent with other conceptual sessions this effort has built.
5. **First-draft bias audit cleared 0/4 immediately**; three of six blocks needed a padding pass to clear 900 characters.

## Consequences

- `pytest`: 139 passed (unchanged -- pure content; confirmed the section reused `Module` id 3 rather than creating a duplicate, and did not collide with the pre-existing `browser-rendering`/Module id 17 legacy overlap). Grepped the test suite for the new slug before seeding -- no hits, so no test fixes were needed this time.
- Verified against the live dev stack via Playwright: section and lesson pages render, the ARIA APG reference link renders with the correct href and resolves live (200), the role-is-a-promise quiz was answered correctly through the real UI, and no raw/unparsed markdown leaked into rendered text. Zero console/page errors. All test-generated `exercise_submissions`/`exercise_review_states`/`user_progress` rows deleted afterward via direct `psql`.
- Recomputing the prerequisite graph after this module should be the first step of the next priority pass, per the standing method -- this ADR's starting six-way tie (14, 24, 31, 38, 48, 74) is now out of date with 14 shipped.
