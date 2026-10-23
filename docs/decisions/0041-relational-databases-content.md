# ADR 0041: Schema Modeling and Normalization content, module 25 session 1 (new domain)

## Status

Accepted

## Context

Continuing the open-ended content-breadth effort (ADR 0039/0040). Module 25 (Relational Databases) has prerequisites `01` and `20` -- both now authored, as of this pass -- making it immediately pickable without leaving a new unmet gap behind it. It's also a prerequisite of module 23 (Backend Architecture, already authored) and module 32 (System Design Building Blocks, already authored), and it opens the Data & Storage domain's first foothold -- a direct hit on both of this effort's goals (close a real prerequisite gap, add breadth to an untouched domain) at once.

## Decisions

1. **New section** `content/curriculum/25-relational-databases/`, attaching to the existing placeholder (`Topic` "Data & Storage", reused `Module` id 5 under the one-Module-per-domain convention established in ADR 0040).
2. **Session 1 covers subtopic 25.1 (schema modeling and normalization)**, framed around the actual cost of redundancy (update anomalies -- two rows silently disagreeing about one fact) rather than reciting normal-form definitions in the abstract. 1NF, 2NF, and 3NF are each tied to a concrete schema and a concrete consequence of violating it, matching the pattern set by every prior session this effort has authored.
3. **No code exercise in this session** -- schema design doesn't fit the existing code-exercise model (a single JS function graded on output values), and forcing one in would mean grading something other than the actual skill. Four multiple-choice exercises instead, one per teaching block; `content/curriculum/README.md`'s sizing rule doesn't require a code exercise, only that teaching blocks each carry roughly one exercise.
4. **Denormalization is presented as a legitimate, informed tradeoff, not a mistake** -- the dividing line drawn is whether the redundancy is documented and actively kept in sync (a trigger, an application write path, a stated eventual-consistency window) versus an accidental duplicate nobody is maintaining. This matches how the rest of the curriculum treats tradeoffs (measure costs, don't moralize about "correct" vs. "incorrect" patterns in the abstract).
5. **One worked `examples` block** (the before/after `order_items` schema for the 2NF fix) used instead of embedding a longer SQL snippet directly in body text, per the sizing rule's guidance.
6. **First-draft bias audit needed two passes**: 3 of 4 flagged after the initial 2NF/3NF block was split into two separate blocks (to hit the 6-block target), then 2 of the 4 remained flagged after a first rebalancing attempt, requiring a second pass before reaching 0/4. Worth noting as a slightly heavier-than-usual rebalancing pass, still well within the established "budget an iterative pass" expectation.

## Consequences

- `pytest` 139 passed (unchanged -- pure content; `Topic.query.count()` stayed 17, and the section reused the existing `Module` id 5 rather than creating a new row).
- Verified against the live dev stack: section and lesson pages render, the worked `examples` accordion displays correctly, and the first quiz (1NF violation) was answered correctly through the real UI. Zero console/page errors. All test-generated rows deleted afterward.
- Module 25 opens the Data & Storage domain and removes one of module 23's and module 32's remaining unmet prerequisites each (23 still needs 10, 21; 32 still needs 05, 28).
