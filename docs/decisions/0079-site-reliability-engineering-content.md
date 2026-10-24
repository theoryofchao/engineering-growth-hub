# ADR 0079: SLIs, SLOs, and SLAs content, module 55 session 1

## Status

Accepted

## Context

Continuing the computed prioritization plan (ADR 0056-0078). Recomputing the prerequisite graph after module 54 shipped surfaced a three-way tie at the top (modules 48, 55, 74, each at second-order value 1). Module 55 (Site Reliability Engineering) was picked for strong continuity with module 53, module 54, and module 64, all already shipped.

Session 1 covers subtopic 55.1 (SLIs, SLOs, and SLAs), following the module's natural subtopic order.

## Decisions

1. **New section** `content/curriculum/55-site-reliability-engineering/`, attaching to the existing placeholder under "Observability & Reliability" (reusing `Module` id 11, the same one modules 53/54/56/57 use).
2. **Citation: Google's SRE book**, chapter "Service Level Objectives" (`sre.google/sre-book/service-level-objectives/`) -- the same book already cited in module 54 for a different chapter/claim (monitoring distributed systems). Confirmed via WebSearch the specific, quoted definitions cited (SLI, SLO, the "what happens if it's missed" test for SLA status) and the Google Search example (no public SLA, yet real consequences from poor availability still exist) before drafting.
3. **The Google Search example is used specifically to separate two conflated ideas**: "has real consequences" versus "has a formal agreement naming them" -- only the latter promotes an SLO to an SLA, a distinction the session treats as the central non-obvious point rather than a footnote.
4. **An SLI is explicitly tied to module 54's golden signals** (an SLI is often literally one of them, refined for accountability purposes) rather than introduced as an unrelated new concept.
5. **The 99.5%-not-100% worked example (block 5)** ties the "why not perfect" question back to modules 35/38/39's already-shipped partial-failure/resilience content, framing a sub-100% target as the economically and technically correct choice rather than a compromise.
6. **No code exercise** -- SLI/SLO/SLA definitional reasoning doesn't reduce to a gradable function, consistent with other conceptual sessions this effort has built.
7. **First-draft bias audit flagged 3 of 4 quizzes**; rebalanced to 0/4 over three passes on one quiz (two further length adjustments were needed after the first two attempts each left it flagged by a small margin). Four of six blocks needed a padding pass to clear 900 characters.

## Consequences

- `pytest`: 139 passed (unchanged -- pure content; confirmed the section reused `Module` id 11 rather than creating a duplicate). Grepped the test suite for the new slug before seeding -- no hits, so no test fixes were needed this time.
- Verified against the live dev stack via Playwright: section and lesson pages render, the SRE book SLO-chapter reference link renders with the correct href and resolves live (200), the SLI-precision quiz was answered correctly through the real UI, and no raw/unparsed markdown leaked into rendered text. Zero console/page errors. All test-generated `exercise_submissions`/`exercise_review_states`/`user_progress` rows deleted afterward via direct `psql`.
- Recomputing the prerequisite graph after this module should be the first step of the next priority pass, per the standing method -- this ADR's starting three-way tie (48, 55, 74) is now out of date with 55 shipped.
