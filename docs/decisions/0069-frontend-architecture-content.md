# ADR 0069: Component Boundaries and Design content, module 16 session 1

## Status

Accepted

## Context

Continuing the computed prioritization plan (ADR 0056-0068). Recomputing the prerequisite graph after module 15 shipped surfaced module 16 (Frontend Architecture) as the clear leader -- second-order unlock value 2, ahead of everything else's 1. All three of its prerequisites (10, 14, 15) were authored earlier in this same pass, in order, immediately before it.

Session 1 covers subtopic 16.1 (Component boundaries and design), following the module's natural subtopic order.

## Decisions

1. **New section** `content/curriculum/16-frontend-architecture/`, attaching to the existing placeholder under "Web & Frontend" (reusing `Module` id 3, the same one modules 14/15/17/18/19 use).
2. **Session 1 is anchored on React's own official "Thinking in React" guide** (`react.dev/learn/thinking-in-react`), citing its real, confirmed content: "a component should ideally only do one thing," decomposed when it grows, illustrated with the guide's own worked example (`FilterableProductTable` -> `SearchBar`/`ProductTable` -> `ProductCategoryRow`/`ProductRow`).
3. **Three deliberate continuity callbacks, not restatements**: single-responsibility is tied to module 10's architecture content as the same principle applied to a component; a hard-to-name component is tied to module 11's naming-as-smell framing; a components-needing-heavy-mocking-to-test signal is introduced as a second, independent symptom of the same underlying scope problem.
4. **Prop drilling is explicitly reframed as a boundary symptom, not a passing-mechanism problem** -- the session's main non-obvious claim, distinguishing it from advice that treats prop drilling as something to fix with a shortcut syntax rather than a boundary redesign.
5. **No code exercise** -- component-boundary judgment doesn't reduce to a gradable function, consistent with other conceptual sessions this effort has built.
6. **First-draft bias audit flagged 2 of 4 quizzes**; rebalanced to 0/4 over two passes (one quiz needed a second length adjustment after the first pass left it still flagged). Two of six blocks needed a padding pass to clear 900 characters.

## Consequences

- `pytest`: 139 passed (unchanged -- pure content; confirmed the section reused `Module` id 3 rather than creating a duplicate). Grepped the test suite for the new slug before seeding -- no hits, so no test fixes were needed this time.
- Verified against the live dev stack via Playwright: section and lesson pages render, the React docs reference link renders with the correct href and resolves live (200), the single-responsibility quiz was answered correctly through the real UI, and no raw/unparsed markdown leaked into rendered text. Zero console/page errors. All test-generated `exercise_submissions`/`exercise_review_states`/`user_progress` rows deleted afterward via direct `psql`.
- Recomputing the prerequisite graph after this module should be the first step of the next priority pass, per the standing method -- this ADR's starting point (16 leading at value 2) is now out of date with 16 shipped.
