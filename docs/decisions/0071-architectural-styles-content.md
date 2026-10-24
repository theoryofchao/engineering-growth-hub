# ADR 0071: Layered and Modular Monolith content, module 31 session 1

## Status

Accepted

## Context

Continuing the computed prioritization plan (ADR 0056-0070). Recomputing the prerequisite graph after module 38 shipped surfaced a four-way tie at the top (modules 24, 31, 48, 74, each at second-order value 1). Module 31 (Architectural Styles) was picked for strong continuity with module 30 (Architecture Fundamentals) and module 35 (Distributed Fundamentals), both already shipped, and with module 16 (Frontend Architecture)'s component-boundary content, reusable at a larger grain.

Researching a citation for Segment's real monolith-vs-microservices case study found that the original primary source (`segment.com/blog/goodbye-microservices/`) is no longer reachable (connection failure, not a 404 -- Segment's engineering blog appears to have been reorganized since Twilio's acquisition). Rather than cite a dead link, the session uses a live, reputable secondary report of the same real case (InfoQ's coverage, `infoq.com/news/2018/07/segment-microservices`) -- confirmed via WebSearch that the InfoQ article's specific claims (operational overhead growing ~3 destinations/month, consolidation into a single "Centrifuge" service) accurately reflect the real, documented case, the same discipline applied to the Capital One/Krebs citation in module 47.

Session 1 covers subtopic 31.1 (Layered and modular monolith), following the module's natural subtopic order.

## Decisions

1. **New section** `content/curriculum/31-architectural-styles/`, attaching to the existing placeholder under "Software Architecture" (reusing `Module` id 6, the same one modules 30/32/33/34 use).
2. **Session 1 distinguishes a layered monolith from a modular one**, then uses **Martin Fowler's "MonolithFirst"** (`martinfowler.com/bliki/MonolithFirst.html` -- confirmed via WebSearch the specific observation cited: successful microservice stories usually started as a monolith, with a caveat about needing real internal modularity to split safely later) to argue monolith-first is a pattern-based observation, not mere caution.
3. **Segment's real reversal back to a monolith (block 5)** is presented as a concrete case where the tradeoff resolved in the monolith's favor for their specific situation -- explicitly not framed as a universal verdict against microservices, consistent with this effort's standing practice of giving tradeoffs their full shape rather than a one-sided conclusion.
4. **Three deliberate continuity callbacks, not restatements**: module 30's "translate constraints into a defensible decision" framing opens the session; module 16's component-boundary discipline is reused at module-grain for the modular-monolith block; Fowler's own caveat about needing real modularity to split safely ties directly back to that same modular-monolith block.
5. **No code exercise** -- architectural-style tradeoff reasoning doesn't reduce to a gradable function, consistent with other conceptual sessions this effort has built.
6. **First-draft bias audit flagged 3 of 4 quizzes**; rebalanced to 0/4 over two passes (one quiz needed a second length adjustment after the first pass left it still flagged). One of six blocks needed a padding pass to clear 900 characters.

## Consequences

- `pytest`: 139 passed (unchanged -- pure content; confirmed the section reused `Module` id 6 rather than creating a duplicate). Grepped the test suite for the new slug before seeding -- no hits, so no test fixes were needed this time.
- Verified against the live dev stack via Playwright: section and lesson pages render, both reference links (Fowler's MonolithFirst, InfoQ's Segment coverage) render with correct hrefs and resolve live (200), the layered-monolith-deployment quiz was answered correctly through the real UI, and no raw/unparsed markdown leaked into rendered text. Zero console/page errors. All test-generated `exercise_submissions`/`exercise_review_states`/`user_progress` rows deleted afterward via direct `psql`.
- Recomputing the prerequisite graph after this module should be the first step of the next priority pass, per the standing method -- this ADR's starting four-way tie (24, 31, 48, 74) is now out of date with 31 shipped.
