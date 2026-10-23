# Threat model: code execution

Roadmap Milestone 4 calls for "a threat model before enabling arbitrary public code execution; separate secured runner for Python later." This document is that deliverable: a living risk register for the one code-execution feature that exists today (JS code exercises, ADR 0028), plus the concrete requirements any future escalation — a server-side Python runner, or public/multi-user exposure of either — must satisfy before it ships. Update this document, don't replace it, when either of those milestones is designed.

## Scope

**Covered**: the existing JS code-exercise feature — how learner-submitted code executes, what Flask ever sees, and what could go wrong under the current single-user, no-auth deployment model.

**Not covered**: a general web-application security audit (authentication, CORS hardening, dependency scanning, backup/restore). See `docs/ARCHITECTURE.md`'s Security section for that broader, still-aspirational checklist. This document also doesn't re-litigate ADR 0028's design decisions — it consolidates their security reasoning into one reviewable place and extends it into forward-looking requirements.

## Current system, as built (ADR 0028)

- **Where learner code runs**: only in the browser, in a fresh Web Worker per test case (`apps/web/src/lib/code-runner.ts`, `apps/web/src/workers/code-runner-worker-source.ts`), instantiated from a `Blob` URL. Never on the server.
- **What Flask ever touches**: the client runs the learner's code against every test case (visible and hidden) in the browser, then POSTs only the resulting *output values* to `POST /api/v1/exercises/<id>/submissions`. The server (`apps/api/app/services/exercises_service.py`) grades with a plain `actual_output == case["expected_output"]` comparison against its own stored answer key — it never executes, `eval`s, or even parses the learner's source. Confirmed: zero `eval`/`exec`/`subprocess`/`importlib` calls on learner input anywhere in `apps/api`.
- **Worker isolation**: a Web Worker has no `document`, cookie, or `localStorage` access — enforced by the browser, not by this app. It does still have `self`, `fetch`, `importScripts`, and `setTimeout`.
- **Timeout/kill**: each test case gets `exercise.timeout_ms` (server-defined, default 2000ms); on expiry the worker is hard-killed via `worker.terminate()`, no cooperation required from the learner's code.
- **Hidden answer keys**: `hidden_test_cases[].expected_output` never reaches the browser pre-grading — enforced twice, independently: the Pydantic type sent to the client (`CodeHiddenTestCaseInput`) has no `expected_output` field at all, and the route's serialization explicitly strips to `{"input": ...}` before sending.
- **Output rendering**: learner-code-derived output is rendered in `exercise-code.tsx` exclusively via JSX text interpolation and `JSON.stringify` — no `dangerouslySetInnerHTML`/`innerHTML` anywhere in that file.
- **No auth, no sessions, no `user_id` on any model.** Single learner, single browser, single Postgres instance that same learner already has full API access to. "Attacking" this system today mostly means attacking yourself.

## Threats considered

| # | Threat | Status | Why |
|---|---|---|---|
| T1 | Learner code infinite-loops or exhausts memory in their own tab | **Mitigated** | Fresh Worker per test case + hard timeout + `worker.terminate()` |
| T2 | Learner code reads DOM/cookies/`localStorage` to exfiltrate session data | **Mitigated** | Worker global scope has none of these, by browser design |
| T3 | Learner code calls `fetch`/`importScripts` inside the Worker to exfiltrate data or probe internal endpoints | **Accepted risk today** | No CSP/network restriction on Worker-scope `fetch`; low severity now since there's no session/secret reachable from the browser to exfiltrate, and no other learner to target |
| T4 | Learner bypasses the Worker via devtools, hand-submits fabricated output | **Accepted, by design** | Single-user personal tool; identical posture to quiz-answer submission today |
| T5 | Hidden test-case answer keys leak to the client before grading | **Mitigated** | Type-level guarantee (no field to leak) + explicit stripping, independently |
| T6 | Flask/API process executes learner-submitted code directly | **Mitigated** | Confirmed no `eval`/`exec`/`subprocess` on learner input anywhere server-side; grading is `==` on already-computed values |
| T7 | XSS via a learner's own code output rendered back to them | **Mitigated** | All such output goes through JSX/`JSON.stringify`, never raw HTML |
| T8 | `monaco-editor`'s transitive `dompurify` advisory is exploited | **Accepted/monitored** | No attacker-controlled HTML is ever passed through Monaco's markdown/hover rendering in this app's actual usage; no upstream fix currently available |
| T9 | No rate limiting on `/api/v1/exercises/<id>/submissions` (or any route) enables a DoS | **Not mitigated** | Confirmed: no rate-limiting library or mechanism exists anywhere in this API. Acceptable for a single-user personal dev tool; must be addressed before any public/multi-user deployment |

## Requirements for future escalations

### Before a server-side "secured Python runner" (ROADMAP Milestone 4)

Flask — or whatever process orchestrates this — must **never**:
- Execute Python learner code in-process, in the same interpreter as the API.
- Give the execution environment access to `DATABASE_URL`, any infrastructure secret, or any credential the main API process holds.
- Allow filesystem access beyond an ephemeral, auto-cleaned sandbox directory.
- Allow network egress beyond an explicit allowlist — ideally none at all.
- Share compute/memory/CPU with, or be influenceable by, any other concurrent request.

Concretely, this means an isolated execution environment — a locked-down container or microVM (gVisor, Firecracker, or at minimum an ephemeral Docker container run with `--network=none`, a non-root user, and cgroup CPU/memory/pids limits), run as a **separate service/process** from the main Flask app, with its own non-privileged credentials (or none at all). The orchestrating Flask code should only ever pass in source + inputs and read back a size-bounded stdout/stderr/exit-code — never an interactive shell, never a shared filesystem, never the app's own database connection.

### Before enabling public or multi-user code execution (any language)

- **Re-examine T3 and T4.** Both are accepted today specifically because there is no other learner to affect. The moment any feature lets one learner's code or its output be seen by, run in the context of, or attributed to another learner (e.g. a "share your solution" view), T3/T4 become real stored-code-injection/XSS vectors requiring actual sandboxing (CSP, strict output sanitization, or simply disallowing arbitrary code sharing).
- **Fix T9.** Add per-IP or per-account rate limiting to submission endpoints at minimum before any public exposure.
- **Add authentication and session isolation.** None exists today; one learner's submissions and data must never be reachable by another.
- **Revisit CORS and secret handling** for a real multi-tenant deployment, per `docs/ARCHITECTURE.md`'s Security section.

## References

- `docs/decisions/0028-code-exercises-client-side-sandbox.md` — the design this document's "current system" section summarizes.
- `docs/ARCHITECTURE.md` — Security section (broader, still-aspirational pre-public-launch checklist).
- `docs/ROADMAP.md` — Milestone 4, the item this document fulfills.
- `CLAUDE.md` — "Never execute untrusted learner code in Flask or with infrastructure secrets... browser coding runner is a separate security-reviewed milestone," the standing project-wide policy this document operationalizes.
