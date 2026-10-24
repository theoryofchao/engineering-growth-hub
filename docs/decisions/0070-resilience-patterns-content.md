# ADR 0070: Timeout Budgets and Deadlines content, module 38 session 1

## Status

Accepted

## Context

Continuing the computed prioritization plan (ADR 0056-0069). Recomputing the prerequisite graph after module 16 shipped surfaced a five-way tie at the top (modules 24, 31, 38, 48, 74, each at second-order value 1). Module 38 (Resilience Patterns) was picked for its strong continuity with two already-shipped modules in the same domain: module 35 (Distributed Fundamentals) and module 53 (Observability Fundamentals), plus module 20 (Backend Fundamentals).

Session 1 covers subtopic 38.1 (Timeout budgets and deadlines), following the module's natural subtopic order.

## Decisions

1. **New section** `content/curriculum/38-resilience-patterns/`, attaching to the existing placeholder under "Distributed Systems" (reusing `Module` id 7, the same one module 35 and modules 36/37/39 use).
2. **Session 1 is anchored on the Amazon Builders' Library article "Timeouts, retries, and backoff with jitter"** (`aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/`) -- confirmed via WebSearch the article's actual, specific claims before citing: matching an acceptable false-timeout rate to a dependency's measured latency percentile (e.g. a 0.1% tolerance maps to p99.9), and the concrete 3-retries-per-layer-across-5-layers = 3^5 = 243x load-amplification example.
3. **Deadline propagation across a call chain (block 3) is presented as a direct consequence of block 1's framing**, not a separate fact -- a shrinking deadline passed hop-to-hop is what keeps an end-to-end time budget meaningful past the first hop, versus each service picking its own timeout independently.
4. **The retry-amplification block explicitly connects back to block 2's timeout-picking approach**: a correctly-chosen timeout in isolation doesn't make an uncoordinated per-layer retry policy safe -- the two are separate dials that both affect the same load multiplier, a distinction easy to miss if timeouts and retries are tuned independently.
5. **A worked failure scenario (block 5) makes the amplification concrete and forward-references the next two subtopics** (circuit breakers, backoff-with-jitter) as the actual fixes for the blip-into-outage pattern it describes.
6. **No code exercise** -- timeout/deadline reasoning doesn't reduce to a gradable function in this platform's model, consistent with other conceptual sessions this effort has built.
7. **First-draft bias audit flagged 1 of 4 quizzes**; rebalanced to 0/4. One of six blocks needed a padding pass to clear 900 characters.

## Consequences

- `pytest`: 139 passed (unchanged -- pure content; confirmed the section reused `Module` id 7 rather than creating a duplicate). Grepped the test suite for the new slug before seeding -- no hits, so no test fixes were needed this time.
- Verified against the live dev stack via Playwright: section and lesson pages render, the AWS reference link renders with the correct href and resolves live (200), the p99.9-timeout quiz was answered correctly through the real UI, and no raw/unparsed markdown leaked into rendered text. Zero console/page errors. All test-generated `exercise_submissions`/`exercise_review_states`/`user_progress` rows deleted afterward via direct `psql`.
- Recomputing the prerequisite graph after this module should be the first step of the next priority pass, per the standing method -- this ADR's starting five-way tie (24, 31, 38, 48, 74) is now out of date with 38 shipped.
