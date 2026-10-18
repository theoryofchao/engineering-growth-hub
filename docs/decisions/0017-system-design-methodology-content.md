# ADR 0017: System Design Methodology content (the interview-shaped module)

## Status
Accepted

## Context
User request, continuing the job-prep work from ADR 0016: "continue onwards and make your most educated predictions on what a senior level full-stack engineer should know," without further specifics — an explicit invitation to use engineering judgment on scope rather than wait for a narrower ask.

Reasoning behind the choice made here: of everything still unauthored and relevant to an active Senior Fullstack interview loop (module 33's methodology, modules 35-39's distributed systems, Node.js/TypeScript-specific runtime content, observability/incident-response content, mentorship content), module 33 ("System Design Methodology") was judged the single highest-leverage next slice for three reasons: (1) it's explicitly interview-*format* — virtually every senior+ IC loop includes a system design round, and this module's subtopics (requirements, capacity estimation, API/data model design, diagramming, bottleneck analysis, tradeoff articulation) map directly onto that round's actual structure, not just its content; (2) it's the natural sequel to ADR 0016's module 32 content, numerically and pedagogically — 33 is explicitly about *leading a design discussion*, which presupposes the building blocks 32 just covered; (3) it let the Tenant Context Service case study from ADR 0016 be reused as a worked, concrete example throughout, rather than introducing a new case study from scratch.

Scope was deliberately kept to one topic (3 sessions) rather than attempting several of the above areas at once, per CLAUDE.md's instruction not to build all phases in one task.

## Decisions
1. **New topic directory** `content/curriculum/33-system-design-methodology/`, matching module 33's existing `curriculum-map.json` entry exactly (slug, title, description, tier), attaching to the pre-existing WIP topic row the same way ADR 0016 did for module 32. Verified post-seed: no duplicate domain rows.
2. **Three sessions, each covering two of the module's six subtopics**, in the order a real design conversation actually proceeds:
   - Sequence 1, "Framing the Problem: Requirements and Capacity Estimation" (33.1, 33.2) — functional vs. nonfunctional requirements, back-of-envelope capacity math, and the reframe that a capacity number is a design constraint, not trivia to recite.
   - Sequence 2, "Designing the API, Data Model, and Communicating the Design" (33.3, 33.4) — API design as a contract (idempotency, pagination, versioning), schema design driven by access pattern rather than abstract normalization, and diagramming/narration as a communication skill with a concrete "can this diagram answer a failure-mode question" bar for done.
   - Sequence 3, "Finding the Bottleneck, and Handling the Curveball" (33.5, 33.6) — systematically walking the request path for single points of failure and the true bottleneck, naming rejected alternatives as part of a strong answer, and adapting a design to a changed constraint instead of restarting from scratch.
3. **Reused the module 32 case study and sessions as continuity anchors** rather than treating this as a standalone topic: the capacity-estimation session cites the Tenant Context Service's cross-region latency numbers; the data-model session cites the earlier tenant-isolation tradeoff; the bottleneck session cites the TCS case study's own request-path walk directly. This both reduces net-new material to verify and reflects how these skills actually compound in practice, the same continuity ADR 0016 built between its own three sessions.
4. **Sized and audited to the standing rule**, with the same iterative rebalancing cost as ADR 0012/0015/0016 — first-draft blocks across all three files ran short (roughly 580–1050 characters against the 900–1800 target) and roughly a third of first-draft exercises were flagged by the answer-length-bias audit, both requiring several rounds of padding and rebalancing before landing clean. This is now a consistent enough pattern across four content ADRs that first-draft content from this process should be expected to need a sizing/bias pass, not treated as a sign something went wrong.

## Consequences
- `pytest`: 29 tests pass unchanged — no test hardcodes a count for `33-system-design-methodology`, matching module 32's experience in ADR 0016.
- Verified against the live stack: reseeded and confirmed via direct SQL that all 3 sessions landed with the expected 6 blocks / 4 exercises each, confirmed no duplicate domain/module/topic rows, and confirmed via the live API that content and navigation render correctly.
- Did not build modules 35-39 (Distributed Systems), Node.js/TypeScript-specific runtime content, observability/incident-response content, or mentorship content — all flagged as reasonable next candidates for the same job-prep goal, left for a future slice rather than attempted here.
