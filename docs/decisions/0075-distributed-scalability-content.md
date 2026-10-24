# ADR 0075: Horizontal Scaling and Statelessness content, module 39 session 1

## Status

Accepted

## Context

Continuing the computed prioritization plan (ADR 0056-0074). Recomputing the prerequisite graph after module 36 shipped surfaced a three-way tie at the top (modules 39, 48, 74, each at second-order value 1). Module 39 (Distributed Scalability) was picked specifically because it completes the entire Distributed Systems domain -- modules 35/36/37/38 were all shipped earlier in this same pass, and 39 was the last of its five modules remaining.

Session 1 covers subtopic 39.1 (Horizontal scaling and statelessness), following the module's natural subtopic order.

## Decisions

1. **New section** `content/curriculum/39-distributed-scalability/`, attaching to the existing placeholder under "Distributed Systems" (reusing `Module` id 7, the same one modules 35/36/37/38 use).
2. **Citation: the Twelve-Factor App's "VI. Processes"** (`12factor.net/processes`) -- confirmed via WebSearch the specific claims cited: the stateless/share-nothing rule, the explicit treatment of sticky sessions as a methodology violation, and the recommendation to use a store with time-based expiration for session data.
3. **Sticky sessions are framed as the mechanism that quietly reintroduces the exact single-point-of-failure problem statelessness is meant to eliminate**, not a neutral workaround -- the session's central reframe, tied directly back to module 4's process-isolation content (in-memory state is private to one process).
4. **Two deliberate continuity callbacks, not restatements**: the fix (shared backing service) is tied to module 38's resilience content (a stateless instance is trivially replaceable when it crashes, since it holds nothing unique); the closing worked example explicitly notes that moving state into Redis *relocates* rather than eliminates distributed-systems concerns, tying back to module 36's replication/consistency content.
5. **No code exercise** -- statelessness/scaling reasoning doesn't reduce to a gradable function, consistent with other conceptual sessions this effort has built.
6. **First-draft bias audit flagged 2 of 4 quizzes**; rebalanced to 0/4 over two passes (one quiz needed a second length adjustment after the first pass left a three-way tie at the max length, which the audit script correctly treats as not-uniquely-longest and therefore not flagged). Two of six blocks needed a padding pass to clear 900 characters.

## Consequences

- **Milestone: the entire Distributed Systems domain (modules 35-39) now has real lesson content.** Verified programmatically against the domain-ID ranges in CURRICULUM.md's own index table (not just recalled) that this is the *first* domain to reach full module coverage during this content-depth pass -- every other domain touched so far (Computer Science Foundations 5/7, Programming & Code Quality 5/6, Software Architecture 4/5, Backend & APIs 4/5, etc.) still has at least one unauthored module.
- `pytest`: 139 passed (unchanged -- pure content; confirmed the section reused `Module` id 7 rather than creating a duplicate). Grepped the test suite for the new slug before seeding -- no hits, so no test fixes were needed this time.
- Verified against the live dev stack via Playwright: section and lesson pages render, the Twelve-Factor App reference link renders with the correct href and resolves live (200), the process-memory quiz was answered correctly through the real UI, and no raw/unparsed markdown leaked into rendered text. Zero console/page errors. All test-generated `exercise_submissions`/`exercise_review_states`/`user_progress` rows deleted afterward via direct `psql`.
- Recomputing the prerequisite graph after this module should be the first step of the next priority pass, per the standing method -- this ADR's starting three-way tie (39, 48, 74) is now out of date with 39 shipped.
