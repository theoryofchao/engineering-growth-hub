# ADR 0043: SOLID/DRY/KISS/YAGNI content citing Sandi Metz, module 10 session 1

## Status

Accepted

## Context

Continuing the content-breadth effort with the user's broadened instruction to actively research influential engineers' real advice and integrate it wherever it genuinely fits, not just the four names raised earlier. Module 10 (Design Principles & Patterns) is a direct unmet prerequisite of module 23 (Backend Architecture, already authored) -- one of its two remaining gaps (10, 21), alongside module 20's and 25's already closing out the other two. Researching this subtopic surfaced Sandi Metz (author of *Practical Object-Oriented Design in Ruby*) as a genuine, verified fit: her 2016 post "The Wrong Abstraction" (confirmed live, `sandimetz.com/blog/2016/1/20/the-wrong-abstraction`) is the specific, well-known articulation of DRY's failure mode -- duplication being cheaper than a forced abstraction -- which is exactly the nuance this session needed for its DRY block anyway, independent of the citation.

## Decisions

1. **New section** `content/curriculum/10-design-principles-patterns/`, attaching to the existing placeholder under "Programming & Code Quality" (reusing `Module` id 2, the same one module 08 already uses).
2. **Session 1 covers subtopic 10.1 ("SOLID DRY KISS YAGNI") as a survey**, but deliberately not an equal-depth survey of all five SOLID letters -- single responsibility gets the one deep, concrete worked example (an `Invoice`/`User`-style class doing three unrelated jobs), since it's the single most common real violation, with the other four letters left for a later session's deeper pass rather than four shallow one-liners here.
3. **Each of the four principles is framed with its mirror-image failure mode**, not presented as an unconditional good: SRP's overcorrection into excessive splitting, DRY's overcorrection into a forced/wrong abstraction (Metz's citation lands here), KISS's actual use as a tiebreaker rather than an absolute, and YAGNI as the rule for *when* an abstraction DRY might ask for is actually safe to extract -- tying the two together rather than treating them as unrelated acronyms.
4. **Sandi Metz's post cited via `reference_links` on the DRY block specifically**, not the session generally, matching the established per-block citation convention (ADR 0032, reused in ADR 0042 for Kent C. Dodds). Re-verified live (`curl` 200) both before and after the content was finalized.
5. **No code exercise** -- design-principle recognition, like the testing-strategy and schema-modeling sessions before it, doesn't reduce to a single gradable function; four multiple-choice exercises instead, one per principle.
6. **First-draft bias audit**: 2 of 4 flagged, requiring two rebalancing passes (similar to module 25's and 40's heavier-than-average passes) before reaching 0/4.

## Consequences

- `pytest` 139 passed (unchanged -- pure content; confirmed the section correctly reused the existing `Module` id 2 rather than creating a duplicate, same as module 08).
- Verified against the live dev stack: section and lesson pages render, the Sandi Metz reference link renders with the correct href and resolves live, and the SRP quiz was answered correctly through the real UI. Zero console/page errors. All test-generated rows deleted afterward.
- Module 23's remaining unmet prerequisite gap is now just module 21 (API Design) -- which is also where Theo Browne's work was already earmarked to land (ADR 0042), continuing the same "close a real gap, cite a real source where one fits" pattern.
