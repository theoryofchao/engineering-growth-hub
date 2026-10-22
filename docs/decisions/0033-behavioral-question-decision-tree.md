# ADR 0033: Behavioral-question bank (backend slice of the decision-tree flow)

## Status

Accepted. Backend (slice 1) and the question-bank browsing page (slice 2) are both built; the React Flow decision-tree visualization (slice 3) is the remaining, not-yet-built piece.

## Context

ADR 0024 shipped the competency catalog and STAR story CRUD, explicitly deferring "the behavioral-question → competency → story decision-tree/scenario-selection flow and its later React Flow visualization." Asked to pick the next roadmap item from four candidates (this one, leadership rubrics, a security threat-model doc, multi-session projects) based on relevance to a Senior Software Engineer interview; chose this one, since behavioral/leadership questions are a heavily-weighted, non-optional part of Senior+ interview loops, and the core mechanic — "interviewer asks a question, I map it to a prepared story" — is exactly what this flow operationalizes.

Two design points confirmed with the user up front:
- The decision-tree visualization will use **React Flow** (as ADR 0024 named), not a lighter custom diagram.
- Questions come from **both** a seeded, author-curated bank **and** learner-added custom questions, the latter saved server-side (not local-only) so they could later be reviewed and promoted into the seeded bank — a promotion workflow not built now, just left open for.

## Decisions

1. **New `BehavioralQuestion` model**, reusing the same "competency = a `Section` under the Leadership & Strategy topic" pattern `LeadershipStory` already established (`section_id` FK, no new taxonomy table). Fields: `prompt` (Text), `source` (`'seed'` | `'custom'`, `CheckConstraint`-enforced, same enum-with-CheckConstraint convention as `StudySession.status`/`UserProgress.status`), `created_at`. No `user_id` yet — a "learner-added" question is private only in the sense that nothing else reads it yet, not via real access control; this matches every other single-user-MVP model in the schema, including `LeadershipStory` itself.
2. **`leadership_service.py` gained question functions** (`list_questions`, `get_question`, `create_question`, `delete_question`) rather than a new service module — same one-service-per-domain precedent the file already set for competencies + stories. `create_question` validates a non-blank `prompt` and a valid competency `section_id`, raising `ValueError` → 400, matching `create_story`'s validation style exactly. `delete_question` raises `ValueError` → 400 if the question's `source` is `"seed"` — seeded questions aren't learner-deletable through the API, matching the "author-provided, not learner-generated" posture of `ContentBlock.examples`/`reference_links` (ADR 0026/0032) rather than something a learner owns and can remove.
3. **`GET/POST /api/v1/leadership/questions`, `GET/DELETE /api/v1/leadership/questions/<id>`** added to the existing `leadership_bp` blueprint — no new blueprint, no request-body Pydantic schema (raw `request.get_json()` dict read directly, same as `create_story`/`update_story`).
4. **New seed content** at `content/leadership/behavioral-questions.json` — 15 real, well-established behavioral-interview question archetypes (3 per competency), loaded by a new `seed.py::load_behavioral_questions()` called from `seed_all()`. Idempotent by `(section_id, prompt text, source="seed")` rather than a stable numeric id — a deliberately lighter contract than the sequence-based upsert used for lesson content (ADR 0009), since nothing yet links a question to anything by id and editing a seeded question's wording later will add a new row rather than updating in place. Good enough for a first pass; revisit if that ever causes real duplicate-question clutter.
5. **Migration quirk discovered, not caused by this change**: running `flask seed` via `docker compose exec api` fails with `IndexError` on `CONTENT_DIR`'s `Path(__file__).resolve().parents[3]` — the container's bind mount (`./apps/api:/app`) puts `seed.py` fewer directory levels deep than the path math assumes, and `content/` isn't mounted into the container at all. This is a pre-existing condition (identical math already governed `CONTENT_DIR` before this slice); seeding has evidently always been run from the host venv against the exposed Postgres port instead. Not fixed here — out of scope for this feature, flagged for whoever next touches the dev-seeding workflow.

## Consequences (backend slice)

- `pytest`: 112 passed (98 before this slice + 14 new, across `test_leadership.py`, `test_leadership_service.py`, and `test_seed.py`), covering create/list/filter/get/delete for questions, blank-prompt and invalid-competency rejection, seeded-question delete rejection, and seed-bank idempotency.
- Verified against the live dev stack (real Postgres, seeded from the host venv per the quirk noted above): `GET /api/v1/leadership/questions` returns all 15 seeded questions with correct competency linkage; re-running `flask seed` confirmed idempotency (still 15, no duplicates).

## Decisions (question-bank browsing page slice)

6. **New `QuestionsHome` component** (`apps/web/src/components/questions-home.tsx`), mirroring `leadership-home.tsx`'s shape: two `useFetch` calls (competencies + questions), grouped by competency via inline `Array.filter` in the render loop, one card per competency (always rendered, "No questions yet." when empty — matching `LeadershipHome` always showing a competency card regardless of story count, not hiding empty ones).
7. **Local state mutated directly on add/delete, no refetch.** `useFetch` has no refetch/mutate escape hatch, so the questions list is synced from the fetch once (the same "adjust during render on first success" bail-out pattern `story-form.tsx` already uses for its edit-mode prefill), then `setQuestions` is updated directly from each POST/DELETE response — avoids inventing a cache-busting query-param hack or changing the shared `useFetch` hook's contract for one page.
8. **The "add your own question" form lives inline on the same page**, not a separate `/questions/new` route like stories have — it's two fields (competency + prompt) versus the STAR form's eight, and keeping it inline means an added question shows up immediately in its competency group without a navigation round-trip. A per-question "Delete" action appears only next to `source: "custom"` questions (seeded ones have no delete control at all, consistent with the backend already rejecting that server-side).
9. **A "Practice questions" link added to `leadership-home.tsx`'s header**, next to the existing "+ New story" button, as the discovery path into the new page.

## Consequences (question-bank browsing page slice)

- `vitest run`: 189 passed (183 before this slice + 6 new, across `questions-home.test.tsx` and one added to `leadership-home.test.tsx`), covering grouping, the seed-vs-custom delete-button distinction, add, delete, and the error state. `tsc --noEmit`, `eslint`, `prettier --check` all clean.
- Verified against the live dev stack with a real browser (Playwright): the "Practice questions" link navigates correctly; all 15 seeded questions render grouped by competency; adding a custom question shows it immediately with a Delete action (seeded questions have none); deleting it (with the confirm dialog accepted) removes it from the page; confirmed via a follow-up `curl` that the database was left with exactly the original 15 seeded rows, no leftover test data. Zero console/page errors.
- Not done this slice (by design): the React Flow decision-tree visualization (`/leadership/questions/[id]`) is the remaining slice — clicking a question currently links to a route that doesn't exist yet (expected, not a bug, until that slice ships).
