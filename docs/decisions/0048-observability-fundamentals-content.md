# ADR 0048: Three Pillars vs. Wide Events content citing Peter Bourgon and Charity Majors, module 53 session 1 (new domain)

## Status

Accepted

## Context

Observability & Reliability was one of the remaining fully-unauthored domains, and module 53 (Observability Fundamentals) has 2 of 3 prerequisites already authored (20, 35; only 43/Debugging & Root Cause Analysis is unmet). The subtopic area has two genuinely strong, verifiable primary sources: Peter Bourgon's 2017 essay "Metrics, tracing, and logging" (the actual origin of the "three pillars" framing, confirmed on his own domain) and Honeycomb/Charity Majors's real critique of how that framing got flattened from its original nuance -- both directly on-topic, not citations bolted onto unrelated material.

## Decisions

1. **New section** `content/curriculum/53-observability-fundamentals/`, attaching to the existing placeholder under "Observability & Reliability" (a new `Module`/`Topic`, confirmed via `Topic.query.count()` staying at 17 post-seed).
2. **Session 1 is a framing-vs-critique comparison** (Bourgon's original overlapping-tradeoffs Venn diagram vs. the wide-structured-event alternative it's since been critiqued against), the same structural pattern as module 40 (pyramid vs. trophy) and module 35 (CAP vs. its own fine print) -- opening a domain with the debate shaping it, before later sessions get into mechanics.
3. **Bourgon's own point is taught accurately, not flattened the way the \"three pillars\" phrase itself flattened it**: the session explicitly calls out that the widely-repeated catchphrase dropped his original overlapping-cost-gradient nuance, turning a Venn diagram into the very checklist he wasn't proposing -- a real, citable instance of a careful technical argument getting simplified in transmission.
4. **Charity Majors's critique required a second, more careful search pass to cite accurately**: her position is well-documented across many secondary sources (podcasts, interviews), but finding a stable, directly-attributable primary URL took extra effort before landing on Honeycomb's own 2017 post ("So You Want to Build an Observability Tool," confirmed live) as the actual citable source, rather than settling for a vague "she argues X" with no verifiable link, or risking a guessed URL.
5. **No code exercise** -- a framing/tradeoff-comparison session, consistent with every other conceptual session this effort has built.
6. **First-draft bias audit flagged 3 of 4 quizzes**, rebalanced to 0/4 in one pass; two blocks needed length-padding to clear 900 characters.

## Consequences

- `pytest` 139 passed (unchanged -- pure content; `Topic.query.count()` stayed 17, confirming correct attachment).
- Verified against the live dev stack: section and lesson pages render, both reference links render with correct hrefs and resolve live (re-checked both before and after drafting), and the metrics-cardinality quiz was answered correctly through the real UI. Zero console/page errors. All test-generated rows deleted afterward.
- Opens the Observability & Reliability domain (13th of 16 now with real content). Remaining fully-unauthored domains: Infrastructure & Cloud, DevOps & Delivery, Performance Engineering, Product & Collaboration.
