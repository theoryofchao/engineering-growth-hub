# ADR 0019: Fix N+1 queries, add logging and a catch-all error handler

## Status
Accepted

## Context
User asked for a full architecture/code sweep for scalability and cleanliness. An audit found every `relationship()` in `app/models.py` using the unqualified SQLAlchemy default (`lazy='select'`), with zero eager-loading anywhere in the codebase. `GET /api/v1/topics` lazy-loaded `domain.modules`→`module.topics`→ per-topic `.progress`/`.learning_sessions`/`.prerequisites` (and each prerequisite's own `.progress`), making it roughly O(domains + modules + topics×(3 + prerequisites)) queries for what's currently 17 domains / 81 topics / 204 prerequisite edges — the one issue in the sweep that actively degrades as the curriculum grows. `GET /api/v1/dashboard/summary` was worse: a fresh `UserProgress.query.filter_by(...)` *inside a loop over topics*. Separately, the audit found zero logging anywhere in the API and no catch-all error handler — an unhandled exception in production would vanish with no trace, and `routes/health.py` had a bare `except Exception:` silently swallowing real DB errors.

## Decisions
1. **Eager-load via query-site `.options()`**, not relationship-level `lazy=` changes — nothing currently overrides the default, so there was nothing to fight. `selectinload` for one-to-many fan-outs (avoids cartesian-product row blowup); `joinedload` reserved for single-valued relationships (`ContentBlock.note`, `LearningSession.topic`, `Exercise.learning_session`). Fixed in `routes/topics.py` (`list_topics`, `get_topic`), `routes/dashboard.py` (`get_dashboard_summary`), `routes/learning_sessions.py` (`get_learning_session`), and `routes/exercises.py` (`submit_exercise`).
2. **Dashboard's per-topic `UserProgress` lookup became one bulk `IN (...)` query** indexed into a dict by `topic_id`, instead of N queries for N topics-with-content.
3. **Added a `count_queries` pytest fixture** (`tests/conftest.py`) using `sqlalchemy.event.listen(engine, "before_cursor_execute", ...)`, since the audit found nothing in the test suite would have caught this class of regression. One bounded-count test per fixed endpoint, asserting a small fixed ceiling rather than an exact count (resilient to minor query-plan changes, still catches a regression back to per-row lazy loading).
4. **Added app-wide logging**: `logging.basicConfig` in `create_app`, level from a new `LOG_LEVEL` config key (`INFO` in `BaseConfig`/`ProductionConfig`/`TestingConfig`, `DEBUG` in `DevelopmentConfig`, both overridable via the `LOG_LEVEL` env var).
5. **Added `@app.errorhandler(HTTPException)`** alongside the existing 404/400 handlers — catches any werkzeug HTTP error without its own specific handler (e.g. 405) so every error response from this API is JSON, never werkzeug's default HTML page; Flask still dispatches 404/400 to their existing specific handlers since those are more specific matches.
6. **Added `@app.errorhandler(Exception)`**: logs the full exception (`app.logger.exception(...)`) and returns a generic `{"error": "Internal server error"}`, 500 — never leaks exception details to the client.
7. **Fixed `routes/health.py`'s silent `except Exception:`** to log before downgrading `db_status` to `"unavailable"`.

## Consequences
- `pytest`: 47 tests pass (43 before this slice + 4 new query-count regression tests).
- Verified against the live dev stack: restarted the `api` container, confirmed `/api/v1/topics` (81 topics), `/api/v1/dashboard/summary`, and `/api/v1/learning-sessions/3` all still return correct 200 responses; confirmed a 404 and a deliberately wrong-method request (`DELETE /api/v1/topics`) both now return JSON (the 405 previously would have been werkzeug's default HTML page); confirmed via `docker compose logs` that request logging is flowing.
- No schema, migration, or API response-shape changes — purely query-plan and error-handling changes, verified behavior-identical by the full existing test suite passing unchanged plus the new regression tests.
- Sets up slice 2 (service-layer extraction, ADR 0020) to move this now-correct query logic into `app/services/` without needing to revisit the eager-loading itself.
