# ADR 0062: Processes, Threads, and Scheduling content, module 4 session 1

## Status

Accepted

## Context

Continuing the computed prioritization plan (ADR 0056-0061). Recomputing the prerequisite graph after module 59 shipped surfaced a five-way tie at the top (modules 4, 12, 24, 31, 38, each newly unlocking 1 further module). Module 4 (Operating Systems) was picked for its direct continuity with module 3 (Computer Architecture), already shipped -- it's the OS-level mechanism built on top of the hardware/memory-hierarchy framing module 3 established, and was itself the backend tests' temporary "still WIP" stand-in module (see ADR 0058), which this module now resolves for real.

Subtopic 04.1 (Processes, threads, and scheduling) was chosen as session 1, following the module's natural subtopic order (consistent with how modules 01 and 08 sequenced their sessions) rather than deviating the way module 59 did -- no prior session has touched this ground, so there was no overlap to avoid.

## Decisions

1. **New section** `content/curriculum/04-operating-systems/`, attaching to the existing placeholder under "Computer Science Foundations" (reusing `Module` id 1, the same one modules 1/2/3/5/6/7 use).
2. **Session 1 covers the process-vs-thread isolation distinction**, fork()/exec() as Linux's real process-creation mechanism, the thread-creation-cost-vs-crash-isolation tradeoff, preemptive scheduling and context-switch cost, and a concrete process-per-request/thread-per-request/event-loop comparison.
3. **Citation: Michael Kerrisk's free sample chapter** ("Process Creation") from *The Linux Programming Interface*, found by checking `man7.org/tlpi/`'s own page for free sample-chapter PDFs rather than searching generically -- the general web search for this topic turned up only secondary/encyclopedia sources, not a specific, citable primary chapter.
4. **Two deliberate continuity callbacks, not restatements**: the isolation-vs-overhead tradeoff (thread vs. process) is explicitly tied to module 45's containers-vs-VMs tradeoff as the same shape one layer down; context-switch cache-eviction cost is tied to module 3's cache-locality framing.
5. **No code exercise** -- process/thread/scheduling concepts don't reduce to a gradable function, consistent with other conceptual sessions this effort has built.
6. **First-draft bias audit flagged 2 of 4 quizzes** (both from option lengths within a few characters of each other, including one case where the correct answer was uniquely longest by just 2-3 characters), rebalanced to 0/4. One block needed a second padding pass to clear 900 characters.

## Consequences

- **Fixed the module-3-era WIP-example substitution** (ADR 0058): `test_dashboard.py` and `test_seed.py` both referenced `04-operating-systems` as their "still WIP" stand-in; swapped in `05-computer-networking` (confirmed via direct DB query to have zero learning sessions) and added a new assertion that module 4 now has real content, matching the same pattern used when module 3 shipped.
- `pytest`: 139 passed (unchanged -- pure content plus the two test substitutions above; confirmed the section reused `Module` id 1 rather than creating a duplicate). Grepped the test suite for the new slug before seeding, per the now-standard pre-flight check -- this time it *did* find hits (the WIP-example substitution), which is exactly the failure mode this check exists to catch.
- Verified against the live dev stack via Playwright: section and lesson pages render, the Kerrisk TLPI reference link renders with the correct href and resolves live (200), the fork()/exec() quiz was answered correctly through the real UI, and no raw/unparsed markdown leaked into rendered text. Zero console/page errors. All test-generated `exercise_submissions`/`exercise_review_states`/`user_progress` rows deleted afterward via direct `psql`.
- Recomputing the prerequisite graph after this module should be the first step of the next priority pass, per the standing method -- this ADR's starting five-way tie (4, 12, 24, 31, 38) is now out of date with 4 shipped.
