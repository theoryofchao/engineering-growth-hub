# ADR 0078: Golden Signals (RED and USE) content, module 54 session 1

## Status

Accepted

## Context

Continuing the computed prioritization plan (ADR 0056-0077). Recomputing the prerequisite graph after module 65 shipped surfaced a three-way tie at the top (modules 48, 54, 74, each at second-order value 1). Module 54 (Monitoring & Alerting) was picked for strong continuity with module 53 (Observability Fundamentals) and module 65 (Performance Measurement), both already shipped.

Session 1 covers subtopic 54.1 (Golden signals, RED and USE), following the module's natural subtopic order, and deliberately builds on module 62's already-shipped USE content rather than re-explaining it.

## Decisions

1. **New section** `content/curriculum/54-monitoring-alerting/`, attaching to the existing placeholder under "Observability & Reliability" (reusing `Module` id 11, the same one module 53 and modules 55/56/57 use).
2. **Two citations, both confirmed via WebSearch before drafting**: **Google's SRE book**, chapter "Monitoring Distributed Systems" (`sre.google/sre-book/monitoring-distributed-systems/`) for the four golden signals (latency, traffic, errors, saturation) and its specific, non-obvious guidance to track failed-request latency separately from successful-request latency; **Grafana Labs' RED method post** (`grafana.com/blog/2018/08/02/the-red-method-how-to-instrument-your-services/`) for Tom Wilkie's RED method, explicitly developed as a complement to Brendan Gregg's USE method (already cited in module 62) for request-driven services specifically.
3. **RED and USE are framed as a detect-then-diagnose pipeline, not competing choices**: RED's service-level view (is this service healthy) for noticing a problem quickly and generically; USE's resource-level view (which specific resource is the cause) for diagnosing it once attention is correctly directed -- the session's central, non-obvious reframe.
4. **A worked incident (block 5) ties the two together concretely**, and explicitly reuses module 64's connection-pool-contention content as the actual root cause a USE-style drill-down would surface.
5. **The latency-separation detail (block 2)** is included specifically because it's a real, documented failure mode (a rising share of fast failures can make average latency look *better* while real user impact worsens) rather than a generic "measure carefully" platitude.
6. **No code exercise** -- monitoring-methodology reasoning doesn't reduce to a gradable function, consistent with other conceptual sessions this effort has built.
7. **First-draft bias audit flagged 1 of 4 quizzes**; rebalanced to 0/4 over two passes. Five of six blocks needed a padding pass to clear 900 characters.

## Consequences

- `pytest`: 139 passed (unchanged -- pure content; confirmed the section reused `Module` id 11 rather than creating a duplicate). Grepped the test suite for the new slug before seeding -- no hits, so no test fixes were needed this time.
- Verified against the live dev stack via Playwright: section and lesson pages render, both reference links (Google SRE book, Grafana's RED method post) render with correct hrefs and resolve live (200), the latency-averaging-gotcha quiz was answered correctly through the real UI, and no raw/unparsed markdown leaked into rendered text. Zero console/page errors. All test-generated `exercise_submissions`/`exercise_review_states`/`user_progress` rows deleted afterward via direct `psql`.
- Recomputing the prerequisite graph after this module should be the first step of the next priority pass, per the standing method -- this ADR's starting three-way tie (48, 54, 74) is now out of date with 54 shipped.
