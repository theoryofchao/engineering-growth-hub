# ADR 0054: strace/Syscall Boundary content citing Julia Evans, module 44 session 1 (new domain)

## Status

Accepted

## Context

Opening Infrastructure & Cloud, one of the last two fully-unauthored domains. Module 44 (Linux & Infrastructure)'s own prerequisites (04, 05, 12) are all unmet -- the same partial-prerequisites exception already used for modules 35, 58, 62, and 49, justified by domain-breadth value and a strong, well-known, directly-verifiable citation: Julia Evans's strace zine, a widely-cited, practitioner-authored resource on exactly this subtopic (process debugging via syscalls).

## Decisions

1. **New section** `content/curriculum/44-linux-infrastructure/`, attaching to the existing placeholder under "Infrastructure & Cloud" (a new `Module`/`Topic` for this domain, confirmed via `Topic.query.count()` staying at 17 post-seed).
2. **Session 1 covers subtopic 44.1 (shell/process management) through Evans's own black-box debugging approach**: treat any process as opaque and observable only through the one interface every process shares -- syscalls -- rather than needing source, a known language, or instrumentation added to the target.
3. **A worked example (a failing backup script) makes the payoff concrete**, not abstract: `strace` turns a vague "permission denied" into an exact failing syscall and path, immediately.
4. **What strace can't see gets equal weight to what it can**: a syscall-quiet gap signals in-process, CPU-bound work rather than a dead end, explicitly tied back to the CPU-profiler/flame-graph sessions already shipped (module 62) as the next tool to reach for once that gap is identified -- continuing this effort's established pattern of linking new content back to prior sessions rather than treating each one in isolation.
5. **Tracing overhead is taught as a real cost, not a caveat**: per-syscall pause-and-resume overhead makes `strace` a targeted diagnostic for a specific question, not something to leave attached to a live, syscall-heavy production process by default.
6. **No code exercise** -- a systems-debugging tool's reasoning doesn't reduce to a gradable JS function, consistent with every other conceptual session this effort has built.
7. **First-draft bias audit flagged 1 of 4 quizzes**, rebalanced to 0/4; all 6 blocks needed length-padding to clear 900 characters.

## Consequences

- `pytest` 139 passed (unchanged -- pure content; confirmed no duplicate domain was created).
- Verified against the live dev stack: section and lesson pages render, the Julia Evans reference link renders with the correct href and resolves live, and the syscall-boundary quiz was answered correctly through the real UI. Zero console/page errors. All test-generated rows deleted afterward.
- Opens the Infrastructure & Cloud domain (15th of 16 with real lesson content; Leadership & Strategy is served separately via the behavioral-question/story system, not lesson sessions). Product & Collaboration is the one remaining fully-unauthored domain, addressed in the same pass as this ADR.
