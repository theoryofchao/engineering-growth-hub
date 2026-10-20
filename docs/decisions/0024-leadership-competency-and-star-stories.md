# ADR 0024: Leadership competency catalog and STAR story CRUD

## Status
Accepted

## Context
`docs/ROADMAP.md` Milestone 3 is next after Milestones 0-2 (scaffold, core loop, curriculum/knowledge management). Its full scope — "Competency catalog and STAR story CRUD; scenario selection and decision-tree visualization. Rubrics, self-reflection, links from stories to competencies" — is too much for one slice, so this covers only the first bullet: a competency catalog, STAR story CRUD, and the link between them, matching `docs/PRODUCT.md`'s own MVP framing ("Include a minimal leadership story form after the core loop works").

## Decisions
1. **Reused `Topic` as the competency a story is tagged to, instead of a new `Competency` table.** `docs/ARCHITECTURE.md`'s original candidate model used a free-text `competency` column on `leadership_stories`, but `CURRICULUM.md`'s "Leadership & Strategy" domain already models this exactly as five first-class `Topic` rows (modules 76-80: Technical Leadership, Mentorship & Team Development, Engineering Management Fundamentals, Engineering Economics, Engineering Strategy) — confirmed already seeded via `GET /api/v1/topics`. One FK (`leadership_stories.topic_id`), no parallel taxonomy, and stories get topic title/slug/description for free.
2. **New `LeadershipStory` model** (`title`, `situation`, `task`, `action`, `result` required; `reflection`, `quantified_outcome` nullable — a story can be drafted before its reflective/metrics pass). No `user_id`, matching `UserProgress`'s existing single-user-MVP precedent.
3. **New `app/services/leadership_service.py`**, following the ADR 0020 convention: `list_competencies()` (query-joins to the "Leadership & Strategy" domain by name), `list_stories`/`get_story`/`create_story`/`update_story`/`delete_story`, validating required STAR fields and that `topic_id` is actually one of the five competencies, raising `ValueError` (route maps to 400) rather than relying on DB constraints alone.
4. **New `GET/POST /api/v1/leadership/competencies` and `.../stories[/<id>]`** routes, thin per the established pattern (parse → service → schema → `jsonify`).
5. **Frontend**: `/leadership` (competency list with per-competency story counts and links), `/leadership/stories/new` and `/leadership/stories/[id]` sharing one `StoryForm` component (competency select + the four STAR textareas + optional reflection/quantified-outcome). Found and fixed a real `react-hooks/set-state-in-effect` violation while building the edit-mode prefill: syncing local editable state from an async fetch result is adjusted during render (bail-out-and-rerender), not inside a `useEffect`, per React's documented pattern for this exact case.
6. **Deferred to later Milestone 3 slices**: rubric-based self-assessment/scoring, the behavioral-question → competency → story decision-tree/scenario-selection flow and its later React Flow visualization, and any UI for the 30 fine-grained CURRICULUM.md leadership subtopics (76.1-80.6) — this slice only uses the 5 top-level topics.

## Consequences
- `pytest`: 72 tests pass (59 before this slice + 13 new: competency listing, story CRUD success/400/404 paths, filtering by competency, service-level validation).
- `ruff`/`black`/`mypy` clean. `npx vitest run`: 98 tests pass (89 before + 9 new, covering create/prefill/submit/error/delete/not-found). `eslint`/`prettier`/`tsc` clean.
- Verified against the live dev stack: migration applied/rolled back/reapplied symmetrically; curled the full competency list and a create/get/patch/delete round trip; a real browser (Playwright) pass creating, editing, and deleting a story through the actual UI, confirmed via a hard reload that data persisted correctly. Noted and investigated a transient double-rendered page after `router.push` immediately following a rapid scripted form submission (two `<main>` trees momentarily) — confirmed via a follow-up reload that this is a `next dev`-mode/Fast-Refresh artifact of the automation's timing, not a real data or routing bug: the created/edited data was always correct on a fresh load.
- No duplicate rows: the five competency `Topic` rows are read, never written, by this slice.
