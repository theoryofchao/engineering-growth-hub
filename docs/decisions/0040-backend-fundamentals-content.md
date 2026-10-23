# ADR 0040: Backend Fundamentals content, module 20 session 1

## Status

Accepted

## Context

Continuing the open-ended "add content for all domains and sections" effort (ADR 0039). Module 23 (Backend Architecture) is already authored, but its own `CURRICULUM.md` prerequisites (`10`, `20`, `21`, `25`) are all unmet -- module 20 (Backend Fundamentals) is the most directly relevant gap to close next, since it's the module 23 content already in the app is implicitly building on. It also reuses the existing "Backend & APIs" `Topic` the `23-backend-architecture` section already lives under, rather than opening a brand-new domain from scratch.

## Decisions

1. **New section** `content/curriculum/20-backend-fundamentals/`, attaching to the existing `curriculum-map.json` placeholder (`Topic` "Backend & APIs", `Section` slug `20-backend-fundamentals`).
2. **`module.title` set to the domain name ("Backend & APIs"), matching the documented one-`Module`-per-domain convention** -- not `23-backend-architecture/section.json`'s existing `module.title: "Backend Architecture"`, which (discovered this pass) created a second, inconsistent `Module` row under the same `Topic` instead of reusing the domain-level placeholder. That pre-existing inconsistency was left alone (out of scope, and `Module` is documented as a currently-unexposed structural pass-through with no functional consequence either way) -- but this new section deliberately followed the correct convention rather than copying the inconsistent precedent, confirmed post-seed: it reused `Module` id 4, not a third row.
3. **Session 1 covers subtopic 20.1 (HTTP server lifecycle and middleware)** as the onion/wrapping model: middleware's "before" code runs in registration order, "after" code runs in reverse, error-handling middleware must be registered outermost to see exceptions from anything else, and a hung request with no logged error is the specific signature of a missing `next()` call. Framework-neutral (Express/Koa/Flask/Django all share this model) rather than tied to Flask specifically, matching `CURRICULUM.md`'s framing of module 20 as fundamentals, not a framework tutorial.
4. **Code exercise (`middlewareExecutionOrder`) traces the onion ordering directly** -- given a list of middleware names, return the full before/handler/after execution trace -- rather than a syntax exercise, so getting it right requires actually modeling the wrap-and-unwind shape, not memorizing which framework function is called what.
5. **First-draft bias audit**: 1 of 3 flagged initially, rebalanced to 0/3.

## Consequences

- `pytest` 139 passed (unchanged -- pure content; `Topic.query.count()` stayed 17, confirming no duplicate domain was created, and the section reused the existing placeholder `Module` id rather than creating a third one under "Backend & APIs").
- Verified against the live dev stack: section and lesson pages render, the onion-ordering quiz was answered correctly through the real UI, and `middlewareExecutionOrder`'s full 4-case answer key was independently verified against a Node reference implementation and confirmed correct via a direct `POST /api/v1/exercises/<id>/submissions` call. Zero console/page errors. All test-generated rows deleted afterward.
- Module 20 is the Backend & APIs domain's second section (alongside `23-backend-architecture`), and the authored prerequisite gap for module 23 is now one module smaller (10, 21, 25 remain unmet).
