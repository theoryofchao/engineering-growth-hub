# ADR 0081: Declarative IaC and Plan/Apply content, module 48 session 1

## Status

Accepted

## Context

Continuing the computed prioritization plan (ADR 0056-0080). Recomputing the prerequisite graph after module 74 shipped surfaced a two-way tie at the top (modules 48, 72, each at second-order value 1). Module 48 (Infrastructure as Code) was picked for continuity with module 12 (Developer Tools & Workflows) and module 47 (Cloud Platforms), both already shipped, and to advance the Infrastructure & Cloud domain to 4 of its 5 modules (44/45/47/48 now shipped; only 46, Kubernetes, remains).

Session 1 covers subtopic 48.1 (Terraform/OpenTofu principles), following the module's natural subtopic order.

## Decisions

1. **New section** `content/curriculum/48-infrastructure-as-code/`, attaching to the existing placeholder under "Infrastructure & Cloud" (reusing `Module` id 9, the same one modules 44/45/46/47 use).
2. **Two citations, both independently verified via WebSearch before drafting**: **HashiCorp's own Terraform intro docs** (`developer.hashicorp.com/terraform/intro`) for the declarative-vs-imperative distinction and the plan/apply workflow mechanics (plan compares live state via the provider API against desired state without changing anything; apply executes and asks for confirmation); **OpenTofu's own fork-announcement blog post** (`opentofu.org/blog/opentofu-announces-fork-of-terraform/`) for the real 2023 licensing-fork history (MPL 2.0 -> BSL 1.1 -> community fork -> Linux Foundation project).
3. **The HashiCorp/Linux Foundation legal dispute over the fork is explicitly flagged as unresolved and not taken a position on** -- the session states the fork happened and why, without claiming any outcome for the ongoing disagreement, since WebSearch found the dispute's current status unconfirmed.
4. **Three deliberate continuity callbacks, not restatements**: infrastructure-as-code's reviewability is tied to module 13's code-review content; the safe-to-reapply property is explicitly named as idempotence, the same term module 24 used for job handlers; state's role in drift detection forward-references the module's own 48.5 subtopic.
5. **No code exercise** -- declarative-IaC and workflow reasoning doesn't reduce to a gradable function, consistent with other conceptual sessions this effort has built.
6. **First-draft bias audit flagged 1 of 4 quizzes**; rebalanced to 0/4 over four passes on one quiz (three further length adjustments were needed after earlier attempts each left it flagged by a small margin, the most iterations any single quiz has needed this pass). Four of six blocks needed a padding pass to clear 900 characters.

## Consequences

- `pytest`: 139 passed (unchanged -- pure content; confirmed the section reused `Module` id 9 rather than creating a duplicate). Grepped the test suite for the new slug before seeding -- no hits, so no test fixes were needed this time.
- Verified against the live dev stack via Playwright: section and lesson pages render, both reference links (HashiCorp's Terraform intro, OpenTofu's fork announcement) render with correct hrefs and resolve live (200), the re-apply-is-a-no-op quiz was answered correctly through the real UI, and no raw/unparsed markdown leaked into rendered text. Zero console/page errors. All test-generated `exercise_submissions`/`exercise_review_states`/`user_progress` rows deleted afterward via direct `psql`.
- Recomputing the prerequisite graph after this module should be the first step of the next priority pass, per the standing method -- this ADR's starting two-way tie (48, 72) is now out of date with 48 shipped.
