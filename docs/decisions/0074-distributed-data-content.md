# ADR 0074: Leader, Follower, and Quorum Replication content, module 36 session 1

## Status

Accepted

## Context

Continuing the computed prioritization plan (ADR 0056-0073). Recomputing the prerequisite graph after module 37 shipped surfaced a three-way tie at the top (modules 36, 48, 74, each at second-order value 1). Module 36 (Distributed Data) was picked for continuity with module 27 (Data Architecture) and module 35 (Distributed Fundamentals), both already shipped, and for advancing the Distributed Systems domain to 4 of its 5 modules (35/36/37/38 now shipped; only 39 remains).

Session 1 covers subtopic 36.1 (Leader/follower and quorum replication), following the module's natural subtopic order.

## Decisions

1. **New section** `content/curriculum/36-distributed-data/`, attaching to the existing placeholder under "Distributed Systems" (reusing `Module` id 7, the same one modules 35/37/38/39 use).
2. **Citation: the Raft consensus paper** ("In Search of an Understandable Consensus Algorithm," Ongaro & Ousterhout, `raft.github.io/raft.pdf`) -- confirmed via WebSearch the specific claims cited: understandability as an explicit design goal over multi-Paxos, the decomposition into leader election/log replication/safety, and the paper's own user-study result (students answering Raft questions more accurately than Paxos questions).
3. **The majority/quorum requirement is presented in two layers**: first as a practical availability tradeoff (tolerating a minority of slow/unreachable replicas without blocking writes), then as the actual safety mechanism (any two majorities from the same replica set must overlap, which is what guarantees a committed write survives a leader crash and re-election) -- deliberately separating "why it helps" from "why it's actually safe," since the two are often conflated.
4. **A worked cluster-sizing example (block 5)** makes the odd-replica-count convention concrete with real numbers (3 vs. 4 vs. 5 vs. 7 replicas), rather than asserting the convention without justification.
5. **One forward reference, not a restatement**: block 3's closing note on stale reads from a lagging replica explicitly previews the module's next subtopic (consistency models) as where that tradeoff gets covered in depth.
6. **No code exercise** -- quorum/consensus reasoning doesn't reduce to a gradable function, consistent with other conceptual sessions this effort has built.
7. **First-draft bias audit flagged 2 of 4 quizzes**; rebalanced to 0/4. Two of six blocks needed a padding pass to clear 900 characters.

## Consequences

- `pytest`: 139 passed (unchanged -- pure content; confirmed the section reused `Module` id 7 rather than creating a duplicate). Grepped the test suite for the new slug before seeding -- no hits, so no test fixes were needed this time.
- Verified against the live dev stack via Playwright: section and lesson pages render, the Raft paper reference link renders with the correct href and resolves live (200), the leader-election-rationale quiz was answered correctly through the real UI, and no raw/unparsed markdown leaked into rendered text. Zero console/page errors. All test-generated `exercise_submissions`/`exercise_review_states`/`user_progress` rows deleted afterward via direct `psql`.
- Recomputing the prerequisite graph after this module should be the first step of the next priority pass, per the standing method -- this ADR's starting three-way tie (36, 48, 74) is now out of date with 36 shipped.
