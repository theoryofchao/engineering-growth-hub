# ADR 0057: Namespaces/cgroups content citing Julia Evans and Liz Rice, module 45 session 1

## Status

Accepted

## Context

Continuing the computed prioritization plan (ADR 0056). Recomputing the prerequisite graph after module 30 shipped confirmed the predicted cascade (modules 31 and 74 became newly unlocked). Among the next tied-highest-value candidates (3, 27, 45, each unlocking 2 further modules), module 45 (Containers & Virtualization) was picked for the strongest content continuity: it directly extends module 44's just-shipped syscall/kernel-boundary session, and unlocking it also fully satisfies module 47 (Cloud Platforms)'s prerequisite chain alongside module 32 (already authored). Researching the subtopic surfaced that "What even is a container" -- the exact framing this session needed -- is actually Julia Evans's own post title (not, as initially assumed, a Liz Rice talk), confirmed before citing either.

## Decisions

1. **New section** `content/curriculum/45-containers-virtualization/`, attaching to the existing placeholder under "Infrastructure & Cloud" (reusing `Module` id 9, the same one module 44 uses).
2. **Session 1 covers subtopic 45.2 (namespaces and cgroups) ahead of 45.1 (images/Dockerfiles)**, the same "concept before tooling" sequencing choice used in module 44 (debugging mechanism before the broader host topics) -- understanding what a container actually *is* mechanically is the foundation the more tooling-focused later sessions build on.
3. **Two real sources, two different framings, both independently verified**: Julia Evans's blog post explains the concept (namespaces control visibility, cgroups control consumption); Liz Rice's "Containers From Scratch" GitHub repo demonstrates it concretely (a working container in ~60 lines of Go, no runtime). The same two-source, framing-plus-demonstration pattern already used in modules 40 and 53.
4. **The shared-kernel security tradeoff gets its own dedicated block**, not left as a footnote -- a kernel-level vulnerability's materially different blast radius for a container versus a true VM is the actual substance behind "containers vs. VMs," not a vague tradeoff statement.
5. **Explicitly ties back to module 44's syscall-boundary content** in two places (the opening and the closing block) -- a container's isolation is enforced through the same kernel interfaces that session already covered, not a separate, unrelated mechanism.
6. **No code exercise** -- kernel-internals reasoning doesn't reduce to a gradable JS function, consistent with every other conceptual session this effort has built.
7. **First-draft bias audit flagged 2 of 4 quizzes, needing two rebalancing passes** before reaching 0/4 -- the second pass required more aggressive shortening of the correct option than usual. Four of six blocks needed length-padding to clear 900 characters.

## Consequences

- `pytest` 139 passed (unchanged -- pure content; confirmed the section reused `Module` id 9 rather than creating a duplicate).
- Verified against the live dev stack: section and lesson pages render, both reference links render with correct hrefs and resolve live, and the PID-namespace quiz was answered correctly through the real UI. Zero console/page errors. All test-generated rows deleted afterward.
- Recomputing the prerequisite graph after this module: module 42 (Test Infrastructure) and module 47 (Cloud Platforms) are both now newly unlocked, as predicted by ADR 0056's plan. The next priority pass should re-run the same computation rather than relying on this ADR's now-stale snapshot.
