# ADR 0073: Queues, Pub/Sub, and Streams content, module 37 session 1

## Status

Accepted

## Context

Continuing the computed prioritization plan (ADR 0056-0072). Recomputing the prerequisite graph after module 24 shipped surfaced a three-way tie at the top (modules 37, 48, 74, each at second-order value 1). Module 37 (Messaging & Streaming) was picked for strong continuity with module 24 (Background Processing) and module 35 (Distributed Fundamentals), both already shipped, and for completing the Distributed Systems domain's fourth of five modules (35, 37, 38 now shipped; 36, 39 remain).

Session 1 covers subtopic 37.1 (Queues, pub/sub, and streams), following the module's natural subtopic order.

## Decisions

1. **New section** `content/curriculum/37-messaging-streaming/`, attaching to the existing placeholder under "Distributed Systems" (reusing `Module` id 7, the same one module 35 and modules 36/38/39 use).
2. **Citation research note**: the originally-planned citation, Jay Kreps' "The Log" post (`engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know...`), 404s -- LinkedIn's engineering blog appears to have restructured its URLs since the post's 2013 publication. Switched to **Apache Kafka's own official documentation** (`kafka.apache.org/documentation/#intro_concepts_and_terms`) instead, confirmed live and confirmed via WebSearch to contain the specific claims cited (the consumer-group abstraction generalizing queue and pub/sub behavior; retention independent of consumption).
3. **Session 1 distinguishes three models**: traditional queue (load-balanced, destructive consume), traditional pub/sub (broadcast), and Kafka's consumer-group abstraction that generalizes both via group membership -- then introduces retention/replay as the genuinely new capability a log-based stream adds beyond either traditional model.
4. **Direct contrast with module 24's job queue (block 4)**: module 24's SQS-style queue is explicitly identified as "squarely a traditional queue" with no retained history, framing the queue-vs-stream choice as "does this problem need replay," not "which is more modern."
5. **Partition-key ordering (block 5)** explains why ordering is per-partition, not per-topic, and why producers deliberately route related events (e.g., per-user) to the same partition -- with an explicit note that this constrains parallelism for that key, not a free guarantee.
6. **No code exercise** -- messaging-model reasoning doesn't reduce to a gradable function, consistent with other conceptual sessions this effort has built.
7. **First-draft bias audit flagged 1 of 4 quizzes**; rebalanced to 0/4 over three passes (one quiz needed two further length adjustments after the first two attempts left it still flagged by a small margin). One of six blocks needed a padding pass to clear 900 characters.

## Consequences

- `pytest`: 139 passed (unchanged -- pure content; confirmed the section reused `Module` id 7 rather than creating a duplicate). Grepped the test suite for the new slug before seeding -- no hits, so no test fixes were needed this time.
- Verified against the live dev stack via Playwright: section and lesson pages render, the Kafka documentation reference link renders with the correct href and resolves live (200), the consumer-group quiz was answered correctly through the real UI, and no raw/unparsed markdown leaked into rendered text. Zero console/page errors. All test-generated `exercise_submissions`/`exercise_review_states`/`user_progress` rows deleted afterward via direct `psql`.
- Recomputing the prerequisite graph after this module should be the first step of the next priority pass, per the standing method -- this ADR's starting three-way tie (37, 48, 74) is now out of date with 37 shipped.
