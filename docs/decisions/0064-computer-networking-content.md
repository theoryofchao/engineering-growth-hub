# ADR 0064: TCP/IP Layering, Handshake, and Slow Start content, module 5 session 1

## Status

Accepted

## Context

Continuing the computed prioritization plan (ADR 0056-0063). Recomputing the prerequisite graph after module 12 shipped surfaced a six-way tie at the top (modules 5, 11, 24, 31, 38, 48, each at second-order value 1). Module 5 (Computer Networking) was picked for two reasons: it directly continues the Computer Science Foundations sequence (1->2->3->4->5, completing every module up to the domain's networking module), and it was the current "still WIP" test stand-in since module 4 shipped (ADR 0062) -- authoring it for real resolves that debt rather than deferring it further.

Subtopic 05.1 (OSI and TCP/IP) was chosen for session 1, following the module's natural subtopic order, but deliberately framed around the practical TCP/IP model and its real latency costs rather than academic seven-layer OSI recitation -- consistent with this effort's general preference for mechanism-and-cost framing over textbook taxonomy (the same choice module 3 made for memory hierarchy over pure cache-taxonomy, and module 4 made for process/thread cost over pure OS-taxonomy).

## Decisions

1. **New section** `content/curriculum/05-computer-networking/`, attaching to the existing placeholder under "Computer Science Foundations" (reusing `Module` id 1, the same one modules 1-4/6/7 use).
2. **Session 1 covers TCP/IP layering**, the three-way handshake's real latency cost (a full round trip before any data moves), TCP slow start's gradual throughput ramp-up, and the TCP-vs-UDP guarantees-vs-cost tradeoff, closing with DNS's typical use of UDP as a concrete worked case.
3. **Citation: Ilya Grigorik's free online book** *High Performance Browser Networking*, specifically its "Building Blocks of TCP" chapter (`hpbn.co/building-blocks-of-tcp/`) -- confirmed via WebSearch (not assumed) that the chapter's actual content covers the three-way handshake's round-trip cost and slow start, the two specific claims cited.
4. **Connection reuse (HTTP keep-alive) is framed as a direct consequence of blocks 2+3 combined**, not introduced as a separate fact -- a reused connection pays the handshake and slow-start ramp-up once, while a frequently-reopened one pays both costs repeatedly.
5. **No code exercise** -- TCP/UDP tradeoff reasoning doesn't reduce to a gradable function, consistent with other conceptual sessions this effort has built.
6. **First-draft bias audit cleared 0/4 immediately**; only one of six blocks needed a short padding pass to clear 900 characters.

## Consequences

- **Resolved the module-4-era WIP-example substitution** (ADR 0062): `test_dashboard.py` and `test_seed.py` both referenced `05-computer-networking` as their "still WIP" stand-in; swapped in `06-mathematics-for-computing` (confirmed via direct DB query to have zero learning sessions) and added a new assertion that module 5 now has real content.
- `pytest`: 139 passed (unchanged -- pure content plus the two test substitutions above; confirmed the section reused `Module` id 1 rather than creating a duplicate). Grepped the test suite for the new slug before seeding, per the now-standard pre-flight check -- found the expected WIP-stand-in hits, consistent with the pattern established across modules 3/4/5.
- Verified against the live dev stack via Playwright: section and lesson pages render, the Grigorik HPBN reference link renders with the correct href and resolves live (200), the handshake-latency quiz was answered correctly through the real UI, and no raw/unparsed markdown leaked into rendered text. Zero console/page errors. All test-generated `exercise_submissions`/`exercise_review_states`/`user_progress` rows deleted afterward via direct `psql`.
- Recomputing the prerequisite graph after this module should be the first step of the next priority pass, per the standing method -- this ADR's starting six-way tie (5, 11, 24, 31, 38, 48) is now out of date with 5 shipped.
