# ADR 0033: Behavioral-question bank (backend slice of the decision-tree flow)

## Status

Accepted (backend slice only — the question-bank browsing page and the React Flow decision-tree visualization are separate, not-yet-built slices)

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

## Consequences

- `pytest`: 112 passed (98 before this slice + 14 new, across `test_leadership.py`, `test_leadership_service.py`, and `test_seed.py`), covering create/list/filter/get/delete for questions, blank-prompt and invalid-competency rejection, seeded-question delete rejection, and seed-bank idempotency.
- Verified against the live dev stack (real Postgres, seeded from the host venv per the quirk noted above): `GET /api/v1/leadership/questions` returns all 15 seeded questions with correct competency linkage; re-running `flask seed` confirmed idempotency (still 15, no duplicates).
- Not done this slice (by design, per the agreed plan): the `/leadership/questions` browsing page (list + "add your own" form) and the React Flow decision-tree visualization page are separate follow-up slices — this ADR covers only the backend contract they'll be built against.
