# ADR 0085: Coaching and Structured Feedback (SBI) content, module 77 session 1

## Status

Accepted

## Context

Continuing the computed prioritization plan (ADR 0056-0084). Recomputing the prerequisite graph after module 50 shipped surfaced module 77 (Mentorship & Team Development) as the sole leader at second-order value 1 -- everything else unlocked was at value 0. Both of its prerequisites (13, 74) were already authored.

This is the first lesson session authored anywhere in the Leadership & Strategy domain (modules 76-80), previously served only by the app's separate, pre-existing behavioral-question/story/rubric feature (`content/leadership/behavioral-questions.json`, distinct from lesson-session content). Confirmed before authoring that this feature is genuinely separate -- it uses `Section` rows purely as "competency" categories for stories/questions/rubrics and asserts nothing about learning-session counts, so adding real lesson content to section 77 doesn't conflict with it.

Session 1 covers subtopic 77.1 (Coaching and structured feedback), following the module's natural subtopic order.

## Decisions

1. **New section** `content/curriculum/77-mentorship-team-development/`, attaching to the existing placeholder under "Leadership & Strategy" (reusing `Module` id 16, the same one modules 76/78/79/80 use).
2. **Citation: the Center for Creative Leadership's SBI (Situation-Behavior-Impact) model**, specifically its article "Use SBI to Inquire About Intent" (`ccl.org/articles/leading-effectively-articles/closing-the-gap-between-intent-vs-impact-sbii/`) -- found via a more targeted WebSearch after an initial guessed CCL URL, confirmed as CCL's own primary page rather than relying solely on secondary summaries.
3. **The session's central reframe**: an observable Behavior ("checked your phone three times") can't be argued with, while an interpretation or character label ("unprofessional") can -- this distinction, not just "be specific," is treated as SBI's actual mechanism for reducing defensiveness.
4. **SBI is explicitly applied to praise, not just criticism (block 4)**, since generic positive feedback has the identical specificity problem as vague criticism.
5. **A full worked rewrite (block 5)** transforms a genuinely vague piece of feedback into SBI form, including an explicit note that the rewrite costs more words -- framing that cost as a deliberate tradeoff, not an accident of over-explaining.
6. **One deliberate continuity callback**: the specificity principle is tied back to module 74's point about an ADR's Consequences section needing to list real tradeoffs, not vague generalities.
7. **No code exercise** -- feedback-framing reasoning doesn't reduce to a gradable function, consistent with other conceptual sessions this effort has built.
8. **First-draft bias audit flagged 2 of 4 quizzes**; rebalanced to 0/4 over two passes on one quiz (a second length adjustment was needed after the first attempt left it still flagged by a single character). Five of six blocks needed a padding pass to clear 900 characters.

## Consequences

- **Milestone: the Leadership & Strategy domain now has its first real lesson session**, distinct from the pre-existing behavioral-question/story/rubric feature it shares `Section` rows with.
- `pytest`: 139 passed (unchanged -- pure content; confirmed the section reused `Module` id 16 rather than creating a duplicate, and that `test_leadership.py`'s references to `77-mentorship-team-development` -- which treat the section purely as a competency category -- still pass unaffected). Grepped the test suite for the new slug before seeding, per the now-standard pre-flight check -- this is the first time this pass that check found real hits, which turned out to be harmless rather than requiring a fix, unlike the module 3/4/5 WIP-stand-in cases.
- Verified against the live dev stack via Playwright: section and lesson pages render, the CCL reference link renders with the correct href and resolves live (200), the behavior-vs-interpretation quiz was answered correctly through the real UI, and no raw/unparsed markdown leaked into rendered text. Zero console/page errors. All test-generated `exercise_submissions`/`exercise_review_states`/`user_progress` rows deleted afterward via direct `psql`.
- Recomputing the prerequisite graph after this module should be the first step of the next priority pass, per the standing method -- this ADR's starting point (77 leading alone at value 1) is now out of date with 77 shipped.
