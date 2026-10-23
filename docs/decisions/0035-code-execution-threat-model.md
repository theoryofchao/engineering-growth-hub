# ADR 0035: Code-execution threat model document

## Status

Accepted

## Context

`docs/ROADMAP.md` Milestone 4 calls for "a threat model before enabling arbitrary public code execution; separate secured runner for Python later," distinct from the JS code-exercise feature itself (already built, ADR 0028). With Milestone 3 fully closed, the user asked to start Milestone 4 without specifying which of its two remaining bullets (this, or multi-session projects). Picked the threat model first: it's the smaller, documentation-only deliverable, matches the roadmap's own bullet ordering, and is a logical prerequisite for the Python-runner work the roadmap explicitly gates behind it.

## Decisions

1. **New standalone `docs/THREAT_MODEL.md`**, not a new ADR's full content and not a `docs/security/` subdirectory (no precedent for either existed). An ADR documents a decision made at a point in time; this is meant to be a living risk register that future milestones (the Python runner, any multi-user exposure) re-read and update, not a frozen record — closer in spirit to `docs/ARCHITECTURE.md`/`docs/ROADMAP.md` than to `docs/decisions/*.md`. This ADR exists only to record that it was written and summarize its conclusions, per CLAUDE.md's "capture important decisions" directive — the substance lives in the standalone doc.
2. **Grounded entirely in re-verified current behavior, not assumptions**: re-confirmed directly (not just by re-reading ADR 0028's prose) that Flask has zero `eval`/`exec`/`subprocess` calls on learner input anywhere in `apps/api`, that hidden test-case answer keys are stripped by both a type-level guarantee and an explicit serialization step, that no XSS vector exists in how learner-code output is rendered, and that no rate-limiting mechanism exists anywhere in the API (a gap the document calls out as a pre-public-launch requirement, not yet a problem for a single-user tool).
3. **Nine threats enumerated (T1-T9)** as a table: mitigated / accepted-and-why / not-yet-mitigated. Three genuinely unaddressed items carried forward explicitly rather than glossed over: Worker-scope `fetch`/`importScripts` being unrestricted (T3), devtools bypass of the Worker (T4) — both accepted today specifically because there is no other learner to affect — and the complete absence of API rate limiting (T9), acceptable for a personal single-user tool but flagged as a hard requirement before any public exposure.
4. **Two forward-looking requirement sections**, not just a point-in-time snapshot: concrete, specific conditions the Python-runner milestone must satisfy (isolated container/microVM, no shared credentials, no filesystem/network access beyond an explicit allowlist, bounded output only — never a live shell) and a separate list of what public/multi-user exposure requires regardless of language (re-examining T3/T4 once another learner could be affected, fixing T9, adding real auth/session isolation, revisiting CORS/secrets).
5. **Added as a "Read first" doc in `CLAUDE.md`**, alongside `PRODUCT.md`/`ARCHITECTURE.md`/`ROADMAP.md`, so any future session picking up the Python-runner or multi-user milestones is pointed at it without having to be told.

## Consequences

- No code changes — this slice is documentation only, as scoped.
- `docs/THREAT_MODEL.md` and this ADR are the only new files; `CLAUDE.md`'s "Read first" list gained one line.
- Not done: the actual Python runner and any multi-user/auth work remain unbuilt — this document defines their entry requirements, it doesn't implement them.
