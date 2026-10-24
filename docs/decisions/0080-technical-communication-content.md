# ADR 0080: RFCs, ADRs, and Design Documents content, module 74 session 1

## Status

Accepted

## Context

Continuing the computed prioritization plan (ADR 0056-0079). Recomputing the prerequisite graph after module 55 shipped surfaced module 74 (Technical Communication) as the clear leader -- second-order unlock value 2, ahead of everything else's 1 or 0. Both of its prerequisites (30, 33) were already authored.

Session 1 covers subtopic 74.1 (RFCs, ADRs, and design documents), following the module's natural subtopic order. This is also this effort's first session in the Product & Collaboration domain's Technical Communication section, and the first module picked whose own artifact type (ADRs) this very content-authoring pass has been producing throughout -- the content stays general and doesn't reference this repository's own ADR practice, consistent with authoring generically-applicable content rather than self-referential material.

## Decisions

1. **New section** `content/curriculum/74-technical-communication/`, attaching to the existing placeholder under "Product & Collaboration" (reusing `Module` id 15, the same one modules 71/72/73/75 use).
2. **Citation: Michael Nygard's original 2011 post** "Documenting Architecture Decisions" (`cognitect.com/blog/2011/11/15/documenting-architecture-decisions`) -- the post that established the ADR format most teams use today. Confirmed via WebSearch the specific, quoted template details cited (value-neutral Context, active-voice Decision, "list all consequences, not just positive ones," superseded-not-deleted status) before drafting.
3. **The "list all consequences, not just favorable ones" point (block 3) is treated as the session's central non-obvious claim**, framed as what separates a genuine decision record from one-sided justification for an already-settled choice.
4. **Superseding vs. deleting (block 4)** is tied to a concrete, recurring failure mode: an already-rejected idea resurfacing and consuming fresh debate time because the original reasoning wasn't preserved.
5. **RFCs/design documents and ADRs are explicitly distinguished by lifecycle stage** (before a decision vs. after one), not treated as competing formats for the same job -- avoiding the common confusion of using one where the other fits.
6. **No code exercise** -- written-communication-format reasoning doesn't reduce to a gradable function, consistent with other conceptual sessions this effort has built.
7. **First-draft bias audit flagged 1 of 4 quizzes**; rebalanced to 0/4. Five of six blocks needed a padding pass to clear 900 characters.

## Consequences

- `pytest`: 139 passed (unchanged -- pure content; confirmed the section reused `Module` id 15 rather than creating a duplicate). Grepped the test suite for the new slug before seeding -- no hits, so no test fixes were needed this time.
- Verified against the live dev stack via Playwright: section and lesson pages render, the Nygard reference link renders with the correct href and resolves live (200), the value-neutral-Context quiz was answered correctly through the real UI, and no raw/unparsed markdown leaked into rendered text. Zero console/page errors. All test-generated `exercise_submissions`/`exercise_review_states`/`user_progress` rows deleted afterward via direct `psql`.
- Recomputing the prerequisite graph after this module should be the first step of the next priority pass, per the standing method -- this ADR's starting point (74 leading at value 2) is now out of date with 74 shipped.
