# ADR 0083: Product/Engineering Design Collaboration content, module 75 session 1

## Status

Accepted

## Context

Continuing the computed prioritization plan (ADR 0056-0082). Recomputing the prerequisite graph after module 72 shipped surfaced a two-way tie at the top (modules 50, 75, each at second-order value 1). Module 75 (Cross-Functional Engineering) was picked for continuity with modules 71, 72, and 74, all already shipped -- advancing Product & Collaboration to 4 of its 5 modules (module 73, Product Analytics & Experimentation, remains the sole gap).

Session 1 covers subtopic 75.1 (Product/engineering design collaboration), following the module's natural subtopic order.

## Decisions

1. **New section** `content/curriculum/75-cross-functional-engineering/`, attaching to the existing placeholder under "Product & Collaboration" (reusing `Module` id 15, the same one modules 71/72/73/74 use).
2. **Citation research correction, caught before drafting**: the original plan was to cite either Marty Cagan/SVPG or Basecamp's Shape Up for the "product trio"/early-engineering-involvement concept. WebSearch found Shape Up's own description describes a fixed-parameter handoff *to* engineers after shaping, not collaborative shaping *with* them -- the opposite of the intended claim -- and that the "product trio" term's clearest, most directly documented primary source is actually **Teresa Torres's Product Talk** (`producttalk.org/product-trio/`), not Cagan's own site, with secondary sources noting the underlying idea predates any single person's coining of the term. Cited Torres accurately rather than attributing the concept to Cagan on an unverified assumption.
3. **Session frames the product trio model around timing, not role reassignment**: an engineer's technical judgment matters most *during* discovery, not after a design is finalized -- explicitly stated as not a claim that engineers should design or that designers should write requirements.
4. **A new block (4) was added mid-draft** addressing engineer hesitation to raise concerns during discovery, directly matching the module's own stated learning objective ("without hiding engineering constraints") -- added after an initial oversight left the session at only 5 blocks instead of the standard 6-7.
5. **Two deliberate continuity callbacks**: the worked API-limitation contrast (block 3) builds on module 71's problem-vs-solution framing; the headcount-flexibility point (block 5) is tied to module 72's warning against treating a practical principle as a rigid ritual.
6. **No code exercise** -- cross-functional collaboration reasoning doesn't reduce to a gradable function, consistent with other conceptual sessions this effort has built.
7. **First-draft bias audit flagged 3 of 4 quizzes**; rebalanced to 0/4 over two passes on one quiz (a second length adjustment was needed). Four of six blocks needed a padding pass to clear 900 characters.

## Consequences

- `pytest`: 139 passed (unchanged -- pure content; confirmed the section reused `Module` id 15 rather than creating a duplicate). Grepped the test suite for the new slug before seeding -- no hits, so no test fixes were needed this time.
- Verified against the live dev stack via Playwright: section and lesson pages render, the Product Talk reference link renders with the correct href and resolves live (200), the engineer-timing quiz was answered correctly through the real UI, and no raw/unparsed markdown leaked into rendered text. Zero console/page errors. All test-generated `exercise_submissions`/`exercise_review_states`/`user_progress` rows deleted afterward via direct `psql`.
- Recomputing the prerequisite graph after this module should be the first step of the next priority pass, per the standing method -- this ADR's starting two-way tie (50, 75) is now out of date with 75 shipped.
