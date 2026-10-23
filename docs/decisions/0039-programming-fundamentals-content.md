# ADR 0039: Programming Fundamentals content, module 08 session 1 (first content in a new domain)

## Status

Accepted

## Context

The user asked to "keep adding more content for all domains and sections" -- an open-ended, ongoing effort, not a single bounded slice. Before this, 5 of 16 `CURRICULUM.md` domains had any real authored content at all (Computer Science Foundations, Web & Frontend, Backend & APIs, Software Architecture, AI & ML Engineering); 11 domains were 100% metadata-only placeholders from `curriculum-map.json`. Given the "all domains and sections" framing, breadth across domains takes priority over further-deepening any single already-started module. Module 08 (Programming Fundamentals) was picked as the next one because it's a direct prerequisite of module 01 (Data Structures, already authored) that didn't itself exist yet -- fixing a load-bearing gap in the prerequisite chain, not an arbitrary pick -- and because it opens the entire Programming & Code Quality domain's first foothold.

## Decisions

1. **New section** `content/curriculum/08-programming-fundamentals/`, attaching to the *existing* `curriculum-map.json` placeholder `Section` row (slug `08-programming-fundamentals`) rather than creating a duplicate -- confirmed by matching `Topic.name` ("Programming & Code Quality"), `Module.title` (same string, the domain-level pass-through), and `Section.slug` exactly against the map's own id-based slug format (`{id:02d}-{slugified title}`), per the established convention (`project_curriculum_doc` memory) and verified post-seed: `Topic.query.count()` stayed at 17 and the section row kept its original id.
2. **Session 1 covers subtopic 08.1 ("Variables, types, control flow, functions") pitched above beginner level**, matching this module's `Core` seniority signal (meaning "everyone needs this," not "this is easy"): value vs. reference semantics, `==`/`===` coercion footguns, `||` vs. `??` for falsy-but-valid defaults, and `let`/`const` hoisting and the temporal dead zone. These are the four corners of "basic" JS syntax that most reliably produce real, subtle production bugs even for experienced engineers -- chosen over a plain syntax walkthrough to match the rigor bar module 01's session 1 set (measuring tradeoffs, not reciting definitions).
3. **One code exercise** (`getConfigValue`), built around the `||`-vs-`??` default-value bug directly: returns a config value even when it's falsy (`0`, `false`, `''`), only falling back when the key is actually missing -- a problem that's impossible to get right without internalizing the truthy/falsy distinction the block teaches, not just a syntax drill.
4. **First-draft quiz options were rebalanced for the answer-length-bias check**, same recurring pattern as every prior content ADR: 2 of 3 flagged initially, brought to 0/3 by trimming the correct option and lengthening distractors without changing their technical content.

## Consequences

- `pytest` 139 passed (unchanged -- pure content; `Section.query.count() == 81` held because the section already existed as a placeholder, confirming no duplicate was created). The answer-length-bias audit reports 0/3 flagged.
- Verified against the live dev stack: the homepage now shows "Programming & Code Quality" with real content instead of pure WIP styling, the section and lesson pages render correctly, the value-vs-reference quiz was answered correctly through the real UI, and `getConfigValue`'s full 5-case answer key was confirmed correct both by running the reference solution in Node directly against each input and via a direct `POST /api/v1/exercises/<id>/submissions` call (`is_correct: true`, all 5 cases passed). Zero console/page errors. All test-generated submissions/review-states/progress rows were deleted afterward.
- This is the first of an open-ended series of content-breadth additions; expect further ADRs in this numbering range to follow the same pattern (pick the next highest-value gap, author to the sizing rule, audit, seed, live-verify, clean up) without each one re-litigating the overall approach.
