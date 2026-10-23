# ADR 0046: Scope, Closures, and Modules content citing John Lindquist, module 08 session 2

## Status

Accepted

## Context

Closes out the last of the four originally-named creators' earmarked fits (ADR 0042, 0043, 0045 covered Kent C. Dodds, Sandi Metz, and the tRPC/T3 Stack correction respectively). John Lindquist, egghead.io's co-founder, has a real, verified, directly-on-topic course: "Composing Closures and Callbacks in JavaScript" (confirmed live, redirecting to `egghead.io/courses/composing-closures-and-callbacks-in-javascript-1223`), which works through exactly the capture-the-binding mental model this session needed anyway. Module 08 (Programming Fundamentals) already had session 1 (08.1); this is subtopic 08.2, continuing the module rather than starting a new one.

## Decisions

1. **New session file** `content/curriculum/08-programming-fundamentals/02-scope-closures-and-modules.json`, sequence 2, matching session 1's established conventions for this section.
2. **The session's throughline is one precise idea -- a closure captures the variable binding, not a value snapshot** -- used to explain both the classic `var`-in-a-loop bug and the deliberate counter-factory private-state pattern as two faces of the same mechanism, rather than treating "closures" and "the classic gotcha" as separate topics.
3. **One code exercise (`runCounterOperations`) demonstrates closure-based private state without needing functions as JSON-serializable input/output** -- the exercise grading model (positional JSON args in, one JSON value out) can't represent "returns an array of functions" directly, so the exercise is designed around a plain string-array-in/number-array-out signature whose natural, idiomatic implementation uses a closure internally, the same workaround pattern as module 20's `middlewareExecutionOrder`.
4. **ES modules are explicitly positioned as solving a different-shaped problem (file-level encapsulation) than closures (per-instance private state), not as having superseded them** -- avoiding the common but inaccurate framing that `import`/`export` made the revealing-module/closure pattern obsolete.
5. **Lindquist's course cited via `reference_links` on the classic-bug block**, matching the established per-block citation convention; the final URL (after following a redirect from the search-result URL) was the one actually recorded, re-verified live both during drafting and again before shipping.

## Consequences

- `pytest` 139 passed (unchanged -- pure content; the new session landed correctly as sequence 2 under the existing section).
- Verified against the live dev stack: section page lists both sessions, lesson page renders, the Lindquist reference link renders with the correct (post-redirect) href and resolves live, the lexical-scope quiz was answered correctly through the real UI, and `runCounterOperations`'s full 4-case answer key was confirmed correct via a direct `POST /api/v1/exercises/<id>/submissions` call. Zero console/page errors. All test-generated rows deleted afterward.
- All four originally-named creators (Pocock, Dodds, Browne, Lindquist) have now either been cited where genuinely relevant (Dodds: module 40; Browne/T3 Stack: module 21) or are the remaining earmark: Matt Pocock for module 09 (generics) or 08.6 (idiomatic TypeScript), not yet built.
