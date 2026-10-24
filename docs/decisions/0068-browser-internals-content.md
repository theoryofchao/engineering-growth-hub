# ADR 0068: JavaScript Event Loop (Tasks and Microtasks) content, module 15 session 1

## Status

Accepted

## Context

Continuing the computed prioritization plan (ADR 0056-0067). Recomputing the prerequisite graph after module 14 shipped surfaced a six-way tie at the top (modules 15, 24, 31, 38, 48, 74, each at second-order value 1). Module 15 (Browser Internals) was picked for direct continuity with module 14 (Web Fundamentals) and module 3 (Computer Architecture), both already shipped.

**Overlap check before drafting**: this app has a pre-existing, separate `browser-rendering` topic (predates CURRICULUM.md, `docs/decisions/0002-...md`) under a legacy "Browser Fundamentals" module (`Module` id 17), whose one session, "Critical Rendering Path," already covers HTML parsing/DOM/CSSOM/layout/paint/compositing -- exactly subtopics 15.1 and 15.2's territory. Rather than duplicate that, session 1 of this new, properly-attached module 15 (`Module` id 3, "Web & Frontend") covers subtopic 15.3 (JavaScript event loop, tasks, microtasks) instead -- genuinely uncovered ground, consistent with this effort's established practice of checking for overlap before authoring (the same check module 59 made against module 47, and the module-70 curriculum-mapping detour made against existing sessions).

## Decisions

1. **New section** `content/curriculum/15-browser-internals/`, attaching to the existing placeholder under "Web & Frontend" (reusing `Module` id 3, the same one module 14 and modules 16-19 use) -- confirmed via DB query this is distinct from `browser-rendering`'s `Module` id 17.
2. **Session 1 covers subtopic 15.3**, explicitly deferring 15.1/15.2 to the pre-existing "Critical Rendering Path" session (noted directly in the session's closing block, so a learner isn't left wondering why rendering-pipeline mechanics aren't covered here).
3. **Citation: Jake Archibald's "Tasks, microtasks, queues and schedules"** (`jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/`) -- confirmed via WebSearch that the post's actual content (the setTimeout-vs-promise ordering example, the "drain the microtask queue before the next task" rule) matches what's cited, not assumed from the post's general reputation.
4. **Two deliberate continuity callbacks, not restatements**: the single-main-thread framing ties back to module 4's general process/thread content, applied specifically to the browser's one JS/layout/paint thread; the "a task runs to completion, nothing interrupts it" point is reused in block 5 to explain why a long synchronous loop blocks regardless of task/microtask scheduling -- a different failure mode from the microtask-starvation case in block 4, deliberately distinguished rather than conflated.
5. **No code exercise** -- event-loop ordering reasoning doesn't fit this platform's output-equality grading model for a session about execution order and timing, consistent with other conceptual sessions this effort has built.
6. **First-draft bias audit cleared 0/4 immediately**; three of six blocks needed a padding pass to clear 900 characters.

## Consequences

- `pytest`: 139 passed (unchanged -- pure content; confirmed the section reused `Module` id 3 rather than creating a duplicate, and did not collide with the legacy `browser-rendering` section or its `Module` id 17). Grepped the test suite for the new slug before seeding -- no hits, so no test fixes were needed this time.
- Verified against the live dev stack via Playwright: section and lesson pages render, the Archibald reference link renders with the correct href and resolves live (200), the setTimeout-ordering quiz was answered correctly through the real UI, and no raw/unparsed markdown leaked into rendered text. Zero console/page errors. All test-generated `exercise_submissions`/`exercise_review_states`/`user_progress` rows deleted afterward via direct `psql`.
- Recomputing the prerequisite graph after this module should be the first step of the next priority pass, per the standing method -- this ADR's starting six-way tie (15, 24, 31, 38, 48, 74) is now out of date with 15 shipped.
