# ADR 0045: API Paradigms content, module 21 session 1 (closes module 23's last gap; corrects a misattribution)

## Status

Accepted

## Context

Module 21 (API Design) closes module 23's (Backend Architecture, already authored) final unmet prerequisite -- 20 and 25 are both now authored, leaving 21 as the last gap. Theo Browne had been earmarked here (ADR 0042) on the assumption he was connected to tRPC. Re-verifying before writing (per the "verify, don't guess" citation rule) surfaced a real correction: Theo Browne did not create tRPC -- that credit belongs to Alex/KATT and the tRPC project's own maintainers (confirmed via its GitHub). Theo Browne's own, accurately-attributable contribution is the T3 Stack (`create.t3.gg`), a full-stack TypeScript project structure he created that *bundles* tRPC as one of its pieces. The session was written to cite each correctly rather than drop the citation or misattribute it.

## Decisions

1. **New section** `content/curriculum/21-api-design/`, attaching to the existing placeholder under "Backend & APIs" (reusing `Module` id 4, the same one module 20 uses).
2. **Session 1 is a paradigm-comparison overview (REST vs. GraphQL vs. typed RPC)**, not a deep dive into any single subtopic -- consistent with how modules 40 and 10 opened their domains with a framing session before mechanics.
3. **tRPC is cited via `trpc.io` (the project's own site) for the schema-less typed-RPC idea**, and the T3 Stack is cited separately via `create.t3.gg` (Theo Browne's own project) for choosing to bundle that approach into a full-stack TypeScript default -- two citations, two correctly-scoped claims, not one citation doing double duty for a claim it doesn't support.
4. **Typed RPC's real constraint (same type system required on both ends) is stated as a scope limit, not a weakness** -- consistent with how this effort treats every paradigm/pattern tradeoff (REST's looseness, GraphQL's resolver cost) as a cost to weigh against a specific situation, not a verdict on which approach is "best."
5. **No code exercise** -- API-paradigm selection, like every other conceptual/comparison session this effort has built, doesn't reduce to a single gradable function.
6. **First-draft bias audit**: 2 of 4 flagged, rebalanced to 0/4 in one pass; three blocks needed length-padding to clear the 900-character floor.

## Consequences

- `pytest` 139 passed (unchanged -- pure content; confirmed the section reused `Module` id 4 rather than creating a duplicate).
- Verified against the live dev stack: section and lesson pages render, both reference links render with correct hrefs and were independently re-confirmed live (`curl` 200 on both, both before and after drafting), and the REST-contract-drift quiz was answered correctly through the real UI. Zero console/page errors. All test-generated rows deleted afterward.
- Module 23's full prerequisite chain (10, 20, 21, 25) is now entirely authored, the first already-shipped module in this effort to reach that state. Matt Pocock (TypeScript/generics) and John Lindquist (closures) remain earmarked for modules 09 and 08 session 2 respectively.
