# ADR 0002: Curriculum models and the first learning-session read endpoint

## Status
Accepted

## Context
`docs/ROADMAP.md` Milestone 1 needs real seeded content and a learning page backed by Flask/PostgreSQL before Pomodoro, exercises, and the dashboard can be built on top of it. This slice covers only that foundation: the content models, one migration, one seed source, and one read endpoint — not the timer, exercise submission, or dashboard, which are separate follow-up slices.

## Decisions

1. **Four models added** (`Domain`, `Module`, `Topic`, `LearningSession`) in a single `app/models.py`, matching the fields in `docs/ARCHITECTURE.md`'s core modeling candidates. Left out for now: `parent_topic_id` self-reference and a `topic_dependencies` table — no multi-topic prerequisite data exists yet, so modeling it would be speculative. Add it when Milestone 2 introduces real prerequisites.

2. **One Alembic migration** (`062cd1f66925`), generated with `flask db migrate` against a real local Postgres (via `docker compose up -d db`) and reviewed before being treated as final — not hand-written.

3. **Curriculum content lives in `content/curriculum/*.json`**, not hard-coded in Python, per `docs/ARCHITECTURE.md` and the existing `content/curriculum/README.md`. Used JSON (stdlib `json`) rather than YAML to avoid adding a new dependency for one file; Milestone 2's richer seed pipeline can revisit the format. `app/seed.py` loads every `*.json` file in that directory, upserting by natural key (domain name, module title, topic slug, session sequence) so it is safe to re-run. Exposed as `flask seed`.

4. **One read endpoint**: `GET /api/v1/learning-sessions/<id>`, returning the session plus its parent topic, serialized through a Pydantic `LearningSessionDetail` model (`app/schemas.py`) rather than hand-built dicts, so the response shape is typed and will support generated TS types later. `GET /api/v1/topics/<id>` from the architecture doc's route list is deferred until the frontend topic-browsing view needs it.

5. **Added a JSON 404 handler** app-wide (`app/__init__.py`) so missing resources return `{"error": ...}` instead of Flask's default HTML error page, per the "consistent JSON errors" requirement in `docs/ARCHITECTURE.md`.

6. **Seeded exactly the roadmap's example**: domain `Frontend Engineering`, module `Browser Fundamentals`, topic `Browser Rendering`, one 25-minute learning session `Critical Rendering Path`. `duration_minutes` has a check constraint restricting it to `25` or `50` per the Pomodoro model in `docs/PRODUCT.md`.

## Consequences
- Verified end-to-end against real Postgres (not just the SQLite test config): ran the migration, ran the seed twice to confirm idempotency (row counts stayed at 1), and curled the live endpoint for both the 200 and 404 cases.
- `pytest` (5 tests: health + seed + learning-session route) passes against the SQLite `testing` config used by `tests/conftest.py`.
- No frontend changes yet — the Next.js learning page that consumes this endpoint, the Pomodoro timer, the quiz exercise, and the dashboard remain open Milestone 1 work.
