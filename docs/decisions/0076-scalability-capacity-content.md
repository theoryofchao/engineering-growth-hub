# ADR 0076: Throughput, Latency, and Concurrency content, module 64 session 1

## Status

Accepted

## Context

Continuing the computed prioritization plan (ADR 0056-0075). Recomputing the prerequisite graph after module 39 shipped surfaced module 64 (Scalability & Capacity) as the clear leader -- second-order unlock value 2, ahead of everything else's 1 or 0. All three of its prerequisites (39, 62, 63) were already authored, with 39 having just shipped immediately before this module, completing the full Distributed Systems domain.

Session 1 covers subtopic 64.1 (Throughput, latency, and concurrency), following the module's natural subtopic order -- deliberately foundational before subtopic 64.2 formalizes Little's Law.

## Decisions

1. **New section** `content/curriculum/64-scalability-capacity/`, attaching to the existing placeholder under "Performance Engineering" (reusing `Module` id 13, the same one modules 62/63/65 use).
2. **Citation: Marc Brooker's blog post on Little's Law** (`brooker.co.za/blog/2018/06/20/littles-law`) -- the same Marc Brooker already cited in module 38 (AWS Builders' Library), here cited for a different, independently-verified claim: the informal concurrency = throughput x latency relationship, and the less obvious point that throughput can genuinely *fall*, not just plateau, under heavy contention (a Universal Scalability Law insight).
3. **Session deliberately introduces the Little's Law relationship informally**, without deriving or naming the formal law, reserving that for the module's own next subtopic (64.2) -- consistent with this effort's practice of forward-referencing rather than fully covering an upcoming subtopic early.
4. **A worked connection-pool scenario (block 5)** makes the contention-cost point concrete: shrinking a pool can increase throughput by reducing contention, a real, counter-intuitive, well-known failure pattern, not a contrived example.
5. **One deliberate continuity callback**: contention's real cost is tied back to module 4's context-switch-overhead content as the same underlying mechanism (coordination overhead competing with useful work) recurring at a different layer.
6. **No code exercise** -- throughput/latency/concurrency reasoning doesn't reduce to a gradable function, consistent with other conceptual sessions this effort has built.
7. **First-draft bias audit flagged 1 of 4 quizzes**; rebalanced to 0/4. Five of six blocks needed a padding pass to clear 900 characters, the most blocks needing padding of any session this pass.

## Consequences

- `pytest`: 139 passed (unchanged -- pure content; confirmed the section reused `Module` id 13 rather than creating a duplicate). Grepped the test suite for the new slug before seeding -- no hits, so no test fixes were needed this time.
- Verified against the live dev stack via Playwright: section and lesson pages render, the Brooker reference link renders with the correct href and resolves live (200), the concurrency-estimate quiz was answered correctly through the real UI, and no raw/unparsed markdown leaked into rendered text. Zero console/page errors. All test-generated `exercise_submissions`/`exercise_review_states`/`user_progress` rows deleted afterward via direct `psql`.
- Recomputing the prerequisite graph after this module should be the first step of the next priority pass, per the standing method -- this ADR's starting point (64 leading at value 2) is now out of date with 64 shipped.
