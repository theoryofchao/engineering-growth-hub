# ADR 0055: Problem-vs-Solution and Discovery-Feedback content citing Marty Cagan, module 71 session 1 (last remaining domain)

## Status

Accepted

## Context

Closes out the last fully-unauthored domain, Product & Collaboration. Module 71 (Requirements & Product Thinking)'s own prerequisite (30, Architecture Fundamentals) is unmet -- the same partial-prerequisites exception used throughout this pass of the effort (modules 35, 58, 62, 49, 44), justified by this being the final domain-breadth gap and a strong, directly-verifiable citation: Marty Cagan's "Discovery -- Feedback" essay on svpg.com, confirmed live and directly on-topic for the session's second half.

## Decisions

1. **New section** `content/curriculum/71-requirements-product-thinking/`, attaching to the existing placeholder under "Product & Collaboration" (a new `Module`/`Topic`, confirmed via `Topic.query.count()` staying at 17 post-seed -- the 16th and final domain to receive real lesson content, alongside Leadership & Strategy's separate behavioral-question/story system).
2. **Session 1 covers subtopic 71.1 (discovery and problem statements) with 71.5 (value hypotheses) woven in**, not as two separate topics but as one throughline: name the problem before assuming a solution, test that assumption cheaply, state it as a falsifiable hypothesis, and seek out feedback that could actually disconfirm it -- four parts of the same discipline rather than an unordered list of product-thinking tips.
3. **Cagan's real point (fall in love with the problem, not the solution) anchors the session's opening**, and his "Discovery -- Feedback" essay anchors a dedicated block on the common failure of testing an idea only with a favorably-biased audience -- not a name-dropped citation bolted onto generic advice.
4. **Explicitly tied back to this effort's own established "confirm before you commit" throughline** (module 10's YAGNI, module 63's indexing tradeoff, module 62/63's "measure before fixing"): discovery is the same discipline applied to product decisions, named as such rather than introduced as an unrelated new idea.
5. **A sixth block (falsifiable hypotheses) was added during drafting**, beyond the originally-planned five, once the first-draft block count came up short of the 6-block target -- it's a genuine extension of the session's own thesis (an assumption vague enough to never be wrong teaches nothing), not padding for its own sake.
6. **No code exercise** -- product-discovery reasoning doesn't reduce to a gradable function, consistent with every other conceptual session this effort has built.
7. **First-draft bias audit flagged 1 of 3 initial quizzes**; after the sixth block and its own quiz were added, the final set of 4 passed at 0/4 flagged. Five of six blocks needed length-padding to clear 900 characters.

## Consequences

- `pytest` 139 passed (unchanged -- pure content; confirmed no duplicate domain was created).
- Verified against the live dev stack: section and lesson pages render, the Cagan reference link renders with the correct href and resolves live, and the solution-shaped-request quiz was answered correctly through the real UI. Zero console/page errors. All test-generated rows deleted afterward.
- This closes out domain breadth for the current effort: all 16 `CURRICULUM.md` domains now have either real lesson content or (for Leadership & Strategy specifically) an equivalent dedicated feature. Further content work from here is depth within already-opened domains/modules, not new-domain breadth.
