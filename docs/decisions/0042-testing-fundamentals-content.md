# ADR 0042: Test Pyramid vs. Testing Trophy content, module 40 session 1 (first cited practitioner besides the Atlassian case study)

## Status

Accepted

## Context

The user named four influential web-dev educators (Matt Pocock, Kent C. Dodds, Theo Browne, John Lindquist) and asked that their work be incorporated where it's a genuine topical fit, not forced into unrelated existing content. Research (web search, not guessed URLs, per `content/curriculum/README.md`'s citation rule) confirmed Kent C. Dodds is specifically known for React Testing Library and two real, verifiable blog posts that directly originated the "testing trophy" model: `kentcdodds.com/blog/write-tests` and `kentcdodds.com/blog/the-testing-trophy-and-testing-classifications`. Testing & Quality (module 40) was, independently, already one of the 8 fully-unauthored domains in the ongoing content-breadth effort (ADR 0039-0041) -- this is a genuine intersection, not a coincidence manufactured to justify a citation. Matt Pocock (TypeScript/generics), Theo Browne (T3 stack/tRPC), and John Lindquist (egghead.io, closures/scope-style short lessons) were deliberately *not* cited here or retrofitted into already-published sessions, since none of them are a specific fit for anything authored so far -- they're earmarked instead for the future sessions where they genuinely are (module 09 generics, module 21 API design/tRPC, module 08 session 2 on scope/closures).

## Decisions

1. **New section** `content/curriculum/40-testing-fundamentals/`, attaching to the existing placeholder (`Topic` "Testing & Quality", reusing `Module` id 8).
2. **Session 1 covers subtopic 40.5 (test pyramid and coverage strategy) as the opening session, ahead of 40.1-40.4's mechanics** -- a deliberate sequencing choice: establishing *why* a testing strategy allocates effort the way it does is a better foundation for the later mechanical sessions (unit tests, integration tests, test doubles) than starting with mechanics and backfilling the rationale.
3. **Both real Dodds posts cited via `reference_links` on the block that actually introduces the trophy**, not sprinkled elsewhere -- matching the existing `reference_links` convention (ADR 0032) of author-verified, stable links placed on the specific block they support. Both URLs were re-verified live (HTTP 200) during this slice, not just confirmed to exist via search.
4. **The pyramid is presented as a real, still-valid model for a different kind of codebase (logic-dense, few integration seams), not a strawman the trophy simply replaces** -- consistent with how this whole content-authoring effort treats tradeoffs throughout (measure costs, don't moralize "correct" vs. "incorrect" patterns).
5. **Quiz-only session, no code exercise** -- testing *strategy* isn't itself a function with a canonical output to grade, the same reasoning that applied to module 25's schema-modeling session.
6. **First-draft bias audit**: 1 of 4 flagged, rebalanced to 0/4. Three blocks also needed length-padding to clear the 900-character floor on the first draft.

## Consequences

- `pytest` 139 passed (unchanged -- pure content; `Topic.query.count()` stayed 17, confirming attach-not-duplicate).
- Verified against the live dev stack: section and lesson pages render, both reference links render with the correct hrefs and were independently confirmed live via `curl` (200 on both), and the first quiz was answered correctly through the real UI. Zero console/page errors. All test-generated rows deleted afterward.
- This opens the Testing & Quality domain (9th of 16) and is the first content this effort has cited a named, verified practitioner source for since the Atlassian engineering-blog case study in modules 32/33 -- the same sourcing bar (verify before citing, cite only where genuinely on-topic) applied to a different kind of source (an individual educator rather than a company blog).
