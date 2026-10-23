# ADR 0058: Memory Hierarchy/Cache Locality content citing Ulrich Drepper, module 3 session 1

## Status

Accepted

## Context

Continuing the computed prioritization plan (ADR 0056/0057). Recomputing the prerequisite graph after module 45 shipped confirmed modules 42 and 47 became newly unlocked as predicted. Among the new tied-top candidates (3, 27, 47, each unlocking 2 further modules), module 3 (Computer Architecture) was picked for an unusually strong, classic citation fit: Ulrich Drepper's 2007 "What Every Programmer Should Know About Memory" is the canonical reference for exactly this subtopic, still the standard citation for cache-locality reasoning two decades later.

## Decisions

1. **New section** `content/curriculum/03-computer-architecture/`, attaching to the existing placeholder under "Computer Science Foundations" (reusing `Module` id 1, the same one modules 01/02 use).
2. **Session 1 covers subtopic 03.2 (memory hierarchy and cache locality)** ahead of 03.1 (CPU pipelines), chosen because it connects most directly to content already shipped -- module 01's array-vs-linked-list contiguity framing and module 02's Big-O analysis both get a direct, concrete hardware explanation here, which 03.1 wouldn't offer as naturally.
3. **Explicitly reframes two already-taught ideas through the hardware lens**: module 01's "arrays are contiguous, linked lists aren't" becomes "arrays satisfy spatial locality, linked lists defeat it," and module 02's Big-O analysis is explicitly named as blind to cache effects -- same total operation count, same complexity class, materially different real speed, which is exactly what asymptotic analysis is defined not to capture.
4. **A concrete row-major-vs-column-major worked example** makes the abstract locality concept tangible with identical complexity and identical total work, differing only in memory access order -- deliberately chosen over a more abstract description since it isolates the one variable (access pattern) the session is actually about.
5. **Cites Drepper's paper via its canonical author-hosted URL** (`akkadia.org/drepper/cpumemory.pdf`), re-verified live before and after drafting, rather than a secondary summary.
6. **No code exercise** -- cache-locality reasoning doesn't reduce to a gradable function (grading compares output values, not wall-clock time), consistent with every other hardware/performance-adjacent session this effort has built.
7. **Discovered and fixed two pre-existing backend tests that hardcoded module 3 as the "still WIP" example** (`test_seed.py::test_seed_all_imports_full_curriculum_map`, `test_dashboard.py::test_dashboard_lists_only_sections_with_content`) -- both needed a different, still-genuinely-unauthored module (04, Operating Systems) substituted in as the WIP example, plus a new assertion confirming module 3 now has real content. This is the same "a new module needs session-count/WIP-example test updates" pattern documented in `content/curriculum/README.md`, just at the module-existence level rather than the session-count level.
8. **First-draft bias audit flagged 1 of 4 quizzes**, rebalanced to 0/4; four of six blocks needed length-padding to clear 900 characters.
9. **Hit a transient, multi-attempt outage of the session's tool-permission classifier** mid-slice, affecting Bash and briefly Edit -- content writing, seeding, and the two test fixes were already done and held; only running the suite, live verification, cleanup, and this commit were blocked until it recovered on a user-prompted retry.

## Consequences

- `pytest` 139 passed after fixing the two WIP-example tests (the two failures were expected and are the point of decision #7 above, not a content or code regression).
- Verified against the live dev stack: section and lesson pages render, the Drepper reference link renders with the correct href and resolves live, the memory-bottleneck quiz was answered correctly through the real UI, and the dashboard endpoint directly confirmed `03-computer-architecture` now appears in its section list while `04-operating-systems` correctly does not. Zero console/page errors. All test-generated rows deleted afterward.
- Recomputing the prerequisite graph after this module: modules 4 (Operating Systems) and 7 (Programming Language Theory) are both now newly unlocked, as predicted. The next priority pass should re-run the same computation rather than relying on this ADR's now-stale snapshot.
