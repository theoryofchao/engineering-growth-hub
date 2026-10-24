# ADR 0084: Rolling, Blue-Green, and Canary Deployment content, module 50 session 1

## Status

Accepted

## Context

Continuing the computed prioritization plan (ADR 0056-0083). Recomputing the prerequisite graph after module 75 shipped surfaced a two-way tie at the top (modules 50, 77, each at second-order value 1). Module 50 (Deployment Strategies) was picked for continuity with module 49 (CI/CD) and module 55 (Site Reliability Engineering, via error budgets), both already shipped.

Session 1 covers subtopic 50.1 (Rolling, blue-green, and canary), following the module's natural subtopic order.

## Decisions

1. **New section** `content/curriculum/50-deployment-strategies/`, attaching to the existing placeholder under "DevOps & Delivery" (reusing `Module` id 10, the same one module 49 and modules 51/52 use).
2. **Two citations, both confirmed via WebSearch before drafting**: **Martin Fowler's BlueGreenDeployment bliki entry** (`martinfowler.com/bliki/BlueGreenDeployment.html`) for the two-identical-environments/instant-cutover/instant-rollback model; **Fowler's CanaryRelease bliki entry** (`martinfowler.com/bliki/CanaryRelease.html`) for deliberately targeted, gradually-expanding exposure to real users. Both already-used sources (Fowler cited twice earlier this pass, modules 11 and 31) for distinct, newly-verified claims.
3. **The three strategies are explicitly contrasted along one dimension -- who's exposed, and how deliberately**: blue-green (everyone, instantly, via cutover), canary (a small, deliberately chosen subset, expanded gradually), rolling (incidental exposure based on which instance happens to serve a given user, not deliberate targeting) -- framed as a genuine tradeoff spectrum, not a ranked "best to worst" list.
4. **Two deliberate continuity callbacks**: the session opens by tying deployment risk to module 65's benchmark-design content (pre-production testing can miss real-load failures) and module 55's error-budget framing (a bad release burns budget, and the strategy chosen is a lever on how much); block 5's worked data-dependent-bug scenario makes "blast radius" concrete.
5. **No code exercise** -- deployment-strategy tradeoff reasoning doesn't reduce to a gradable function, consistent with other conceptual sessions this effort has built.
6. **First-draft bias audit flagged 1 of 4 quizzes**; rebalanced to 0/4 over two passes on one quiz (a second length adjustment was needed after the first attempt left it still flagged by a small margin). Three of six blocks needed a padding pass to clear 900 characters.

## Consequences

- `pytest`: 139 passed (unchanged -- pure content; confirmed the section reused `Module` id 10 rather than creating a duplicate). Grepped the test suite for the new slug before seeding -- no hits, so no test fixes were needed this time.
- Verified against the live dev stack via Playwright: section and lesson pages render, both reference links (Fowler's BlueGreenDeployment and CanaryRelease entries) render with correct hrefs and resolve live (200), the full-cutover-exposure quiz was answered correctly through the real UI, and no raw/unparsed markdown leaked into rendered text. Zero console/page errors. All test-generated `exercise_submissions`/`exercise_review_states`/`user_progress` rows deleted afterward via direct `psql`.
- Recomputing the prerequisite graph after this module should be the first step of the next priority pass, per the standing method -- this ADR's starting two-way tie (50, 77) is now out of date with 50 shipped.
