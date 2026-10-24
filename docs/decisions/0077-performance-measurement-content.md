# ADR 0077: Benchmark Design and Coordinated Omission content, module 65 session 1

## Status

Accepted

## Context

Continuing the computed prioritization plan (ADR 0056-0076). Recomputing the prerequisite graph after module 64 shipped surfaced module 65 (Performance Measurement) as the clear leader -- second-order unlock value 2, ahead of everything else's 1 or 0. All three of its prerequisites (40, 62, 64) were already authored, with 64 having just shipped immediately before this module.

Session 1 covers subtopic 65.1 (Benchmark design and baselines), following the module's natural subtopic order. Rather than a generic "how to design a benchmark" treatment, the session is anchored on one specific, well-documented, high-impact flaw: coordinated omission in closed-loop load testing.

## Decisions

1. **New section** `content/curriculum/65-performance-measurement/`, attaching to the existing placeholder under "Performance Engineering" (reusing `Module` id 13, the same one modules 62/63/64 use).
2. **Two citations, both independently verified via WebSearch before drafting**: **Gil Tene's "How NOT to Measure Latency"** QCon San Francisco 2012 slides (`qconsf.com/sf2012/dl/qcon-sanfran-2012/slides/GilTene_HowNotToMeasureLatency.pdf`) for coining/popularizing "coordinated omission" and the core mechanism; **Marc Brooker's "Open Versus Closed"** post (`brooker.co.za/blog/2023/05/10/open-closed`) for the concrete, measured number (closed-loop testing underestimated real p99 by at least 25x in his bimodal example) -- Brooker's second independent citation in this pass (after module 38 and module 64), each for a distinct, separately-verified claim.
3. **The session explicitly separates "what happens" from "why it specifically corrupts the tail"**: block 2 covers the mechanism (a waiting generator sends fewer requests during a stall rather than recording a backlog), block 3 covers why that specifically erases tail latency rather than distorting the average -- deliberately not conflating the two, and forward-referencing subtopic 65.3 (percentile interpretation) where percentiles get covered in depth.
4. **A worked regression scenario (block 5)** makes the "worse than no benchmark" framing from block 1 concrete: a closed-loop benchmark reports an improvement while production tail latency actually worsens, because the benchmark structurally couldn't detect the regression's real-world impact.
5. **No code exercise** -- benchmark-design reasoning doesn't reduce to a gradable function, consistent with other conceptual sessions this effort has built.
6. **First-draft bias audit flagged 2 of 4 quizzes**; rebalanced to 0/4. Four of six blocks needed a padding pass to clear 900 characters, tied with module 64 for the most blocks needing padding this pass.

## Consequences

- **Milestone: Performance Engineering (modules 62-65) is now the second domain with every module fully authored**, after Distributed Systems. Verified programmatically against CURRICULUM.md's own domain-ID-range index table before writing this claim, per the discipline established after the module 13 and module 39 domain-completion corrections earlier in this pass.
- `pytest`: 139 passed (unchanged -- pure content; confirmed the section reused `Module` id 13 rather than creating a duplicate). Grepped the test suite for the new slug before seeding -- no hits, so no test fixes were needed this time.
- Verified against the live dev stack via Playwright: section and lesson pages render, both reference links (Gil Tene's QCon slides, Marc Brooker's open-vs-closed post) render with correct hrefs and resolve live (200), the coordinated-omission-mechanism quiz was answered correctly through the real UI, and no raw/unparsed markdown leaked into rendered text. Zero console/page errors. All test-generated `exercise_submissions`/`exercise_review_states`/`user_progress` rows deleted afterward via direct `psql`.
- Recomputing the prerequisite graph after this module should be the first step of the next priority pass, per the standing method -- this ADR's starting point (65 leading at value 2) is now out of date with 65 shipped.
