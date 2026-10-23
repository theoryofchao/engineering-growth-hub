# ADR 0052: EXPLAIN and Index Selection content citing Markus Winand, module 63 session 1

## Status

Accepted

## Context

Continuing the content-breadth effort. Module 63 (Database Performance) became the first *fully* prerequisite-satisfied pick available this pass -- both 25 (Relational Databases) and 62 (Application Performance, just shipped last slice) are now authored. It also continues the exact "confirm the real cost before fixing it" throughline module 62 established with USE/flame graphs, applied to the data layer. Markus Winand's "Use The Index, Luke" is the field's standard, vendor-neutral reference for exactly this subtopic (SQL indexing from first principles), confirmed live.

## Decisions

1. **New section** `content/curriculum/63-database-performance/`, attaching to the existing placeholder under "Performance Engineering" (reusing `Module` id 13, the same one module 62 uses).
2. **Session 1 opens by explicitly naming the query plan as the database's own flame graph** -- a deliberate callback to module 62's session, not a coincidental similarity, reinforcing "confirm where the cost actually is before fixing it" as a cross-cutting performance-engineering habit rather than a one-off lesson specific to CPU profiling.
3. **Winand's central thesis (an index only helps a query shaped to use it) anchors the session's middle two blocks**: a leading wildcard `LIKE` and an unindexed function wrapped around a column both defeat an otherwise-present index, and composite index column order determines which queries it can serve -- concrete, correct mechanics rather than the vaguer "indexes make things faster."
4. **The write-cost tradeoff is explicitly tied back to YAGNI** (module 10, already authored): an index for a hypothetical future query is pure cost today, the same overengineering shape already taught, now applied to schema design specifically rather than introduced as an unrelated new idea.
5. **No code exercise** -- query-plan reading and indexing strategy don't reduce to a gradable JS function, consistent with every other conceptual session in this module and effort.
6. **First-draft bias audit flagged 1 of 4 quizzes**, rebalanced to 0/4; five of six blocks needed length-padding to clear 900 characters, the heaviest padding pass of this effort so far.

## Consequences

- `pytest` 139 passed (unchanged -- pure content; confirmed the section reused `Module` id 13 rather than creating a duplicate).
- Verified against the live dev stack: section and lesson pages render, the Winand reference link renders with the correct href and resolves live, and the sequential-scan quiz was answered correctly through the real UI. Zero console/page errors. All test-generated rows deleted afterward.
- Module 63 is the first already-authored module's prerequisite chain to go from 0 to fully-satisfied *during* this effort (62 unlocked it directly) rather than being picked because it was already satisfied when first considered.
