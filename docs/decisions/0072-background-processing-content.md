# ADR 0072: Job Queues, Workers, and Visibility Timeouts content, module 24 session 1

## Status

Accepted

## Context

Continuing the computed prioritization plan (ADR 0056-0071). Recomputing the prerequisite graph after module 31 shipped surfaced a three-way tie at the top (modules 24, 48, 74, each at second-order value 1). Module 24 (Background Processing) was picked for strong continuity with module 20, module 21, and module 35, all already shipped, and especially with module 38 (Resilience Patterns, shipped immediately before this one), whose timeout-tradeoff framing reuses directly.

Session 1 covers subtopic 24.1 (Job queues, workers, and schedulers), following the module's natural subtopic order.

## Decisions

1. **New section** `content/curriculum/24-background-processing/`, attaching to the existing placeholder under "Backend & APIs" (reusing `Module` id 4, the same one modules 20/21/22/23 use).
2. **Session 1 is anchored on the visibility timeout mechanism**, citing **AWS's own SQS documentation** (`docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/AboutVT.html`) -- confirmed via WebSearch the specific claims (a message becomes invisible on receipt, reappears if not deleted within the window, and AWS's own guidance states duplicate delivery on standard queues is expected, not a guarantee violation).
3. **Duplicate processing is framed as the normal, expected consequence of the mechanism**, not a bug -- the session's central reframe, deliberately distinct from treating at-least-once delivery as an edge case to work around.
4. **Visibility-timeout sizing (block 4) is explicitly tied back to module 38's network-timeout tradeoff** as the same shape (too aggressive -> false positives; too generous -> slow recovery) applied to job visibility instead of a network call, including reusing module 38's "size against the measured distribution" fix.
5. **A concrete worked failure (block 5)**: a payment job exceeding its visibility timeout under load, processed twice by two workers, forward-referencing idempotency (this module's subtopic 24.3) as the actual fix rather than a better-tuned timeout.
6. **No code exercise** -- queue/timeout reasoning doesn't reduce to a gradable function, consistent with other conceptual sessions this effort has built.
7. **First-draft bias audit flagged all 4 quizzes**; rebalanced to 0/4 over two passes (one quiz needed a second length adjustment after the first pass left it still flagged). Three of six blocks needed a padding pass to clear 900 characters.

## Consequences

- `pytest`: 139 passed (unchanged -- pure content; confirmed the section reused `Module` id 4 rather than creating a duplicate). Grepped the test suite for the new slug before seeding -- no hits, so no test fixes were needed this time.
- Verified against the live dev stack via Playwright: section and lesson pages render, the SQS reference link renders with the correct href and resolves live (200), the crashed-worker quiz was answered correctly through the real UI, and no raw/unparsed markdown leaked into rendered text. Zero console/page errors. All test-generated `exercise_submissions`/`exercise_review_states`/`user_progress` rows deleted afterward via direct `psql`.
- Recomputing the prerequisite graph after this module should be the first step of the next priority pass, per the standing method -- this ADR's starting three-way tie (24, 48, 74) is now out of date with 24 shipped.
