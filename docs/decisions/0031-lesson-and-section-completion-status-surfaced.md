# ADR 0031: Surface lesson/section completion status in nav and section overview

## Status

Accepted

## Context

ADR 0030 added per-block completion tracking and a derived "lesson complete" state, but that state only existed where a learner was actively looking at a lesson's own blocks. The user asked for two more surfaces: the "Lessons in this section" sidebar (shown while reading a lesson) should mark which lessons are already fully done, and once every lesson in a section is done, the section's own overview page should say so.

Clarified with the user up front: the section-level indicator belongs on the section's own overview page (`/learn/<topic>/<section>`), not also pushed into the topic-wide curriculum tree — kept this slice scoped to that one page rather than touching the topic listing endpoint, which lists every section across every topic in one call.

## Decisions

1. **Completion derivation moves server-side for anything beyond "viewing that one lesson."** ADR 0030's `allBlocksComplete` was computed client-side from a per-lesson fetch; that doesn't scale to "is lesson 9 done" while looking at lesson 8's nav, or "are all 8 lessons in this section done," without either N client fetches or duplicating the derivation logic in the frontend (CLAUDE.md: Flask owns progress decisions). So `LearningSessionSummary` (the schema already used for both the lesson nav and the section's lesson list) gained `is_complete: bool`, and `SectionDetail` gained `is_fully_complete: bool`, both computed in the route layer.
2. **One new aggregate query, not per-lesson N+1**: `completions_service.get_completion_counts_for_learning_sessions(ids)` returns `{learning_session_id: (total_blocks, completed_blocks)}` for an arbitrary batch of ids in a single grouped query (`ContentBlock` outer-joined to `BlockCompletion`, `GROUP BY learning_session_id`), used by both `GET /api/v1/learning-sessions/<id>` (for `section_sessions`) and `GET /api/v1/sections/<slug>` (for `learning_sessions` + the section-wide rollup). `is_fully_complete(total, completed)` is a trivial helper (`total > 0 and completed == total` — a lesson/section with zero blocks is never "complete", not vacuously true).
3. **Section-wide `is_fully_complete` is derived in Python from the per-lesson results already computed for that same response**, not a second query — `all(session.is_complete for session in learning_sessions) and len(learning_sessions) > 0`.
4. **Query-count regression test adjusted, not removed**: `test_get_section_detail_query_count_is_small` (ADR 0019's N+1 guard) had its ceiling bumped from `<10` to `<11` with a comment explaining the one new fixed-cost query — still catches a real per-row N+1 regression, just accounts for this intentional, bounded addition.
5. **Frontend**: a small inline-SVG checkmark (same mark used by ADR 0030's `CompletionToggle`, but non-interactive here since lesson/section completion isn't directly toggleable — it's derived) is duplicated locally in both `lesson-content.tsx` (`SectionLessonNav`) and `section-overview.tsx`, matching this codebase's existing per-component icon convention (e.g. `site-settings.tsx`'s own gear icon) rather than extracting a shared icon component for a 7-line SVG used in two places.

## Consequences

- Backend: `pytest` 96 passed (92 before this slice + 4 new, in `test_sections.py` and `test_learning_sessions.py`), covering is_complete defaulting to false, flipping true once every block in a lesson is done, and the section-wide rollup requiring *every* lesson, not just one.
- Frontend: `vitest run` 181 passed (177 before this slice + 4 new), `tsc --noEmit`, `eslint`, `prettier --check` all clean.
- Verified against the live dev stack (real Postgres) with a real browser (Playwright): a completed lesson shows a checkmark in the sidebar nav while an untouched sibling lesson doesn't; a section whose one lesson was marked fully complete shows both the lesson-row checkmark and a "Section complete" line in its header. Zero console/page errors.
- **A genuine surprise surfaced during this verification, not a bug**: content block ids 42–48 (every block in lesson "How Senior Engineers Actually Use Coding Agents", module 70) were already marked complete in the dev database, timestamped the same day but from activity this session's own test scripts never produced — most likely the user (or another session) actually exercised the ADR 0030 checkmark UI for real between that slice shipping and this one starting. That data was left untouched; a different, confirmed-untouched lesson was used as the "should show no checkmark" comparison instead of assuming the first lesson tried was clean.
