# ADR 0020: Extract a service layer out of route handlers

## Status
Accepted

## Context
Continuing the architecture sweep (ADR 0019 fixed query performance): `docs/ARCHITECTURE.md` calls for "thin routes, explicit services," but every route module had real business logic embedded directly in the handler function — lock/prerequisite computation and status null-coalescing in `topics.py`, per-topic aggregation in `dashboard.py`, scoring and progress-advancement in `exercises.py`, mode/action validation and progress-advancement in `study_sessions.py`. The audit also found the same `topic.progress.status if topic.progress else "not_started"` pattern independently duplicated in two route files.

## Decisions
1. **New `app/services/` package**, one module per route file with real domain logic (`topics_service`, `dashboard_service`, `exercises_service`, `study_sessions_service`, `learning_sessions_service`). Skipped `notes.py` (already thin via the existing `Note.upsert` model method) and `health.py` (a single trivial query, nothing to extract).
2. **Services return plain dataclasses or ORM objects, never Pydantic schemas.** `TopicStatus`/`PrerequisiteStatus` (topics_service), `TopicProgressView`/`DashboardSummaryView` (dashboard_service), `ExerciseResult` (exercises_service) carry exactly the fields their callers need, with no dependency on the API response shape — Pydantic schema construction stays in the route layer, which is an HTTP-contract concern, not a domain one. This keeps the dependency direction one-way (routes depend on services; services never import `app.schemas`).
3. **Error signaling convention, consistent across all four services**: a function returns `None` when the thing it was asked to fetch/act on doesn't exist (route maps to 404, except `study_sessions_service.create`'s missing-`learning_session_id` case, which the original route already mapped to 400 — preserved exactly, not "fixed" to 404, since that would be an unannounced behavior change); a function raises `ValueError` for invalid *input* (bad `selected_index`, bad `mode_minutes`, bad `action` string) and the route maps that to 400 via `abort(400, description=str(error))`.
4. **Verified byte-for-byte behavior preservation**, not just "tests still pass": re-checked each route's original status-code/ordering logic line by line while writing the replacement (e.g. `study_sessions.py`'s `create` checks `mode_minutes` validity *before* `learning_session_id` existence, and a missing `learning_session_id` is 400 not 404 — both preserved exactly) rather than "cleaning up" behavior as a side effect of moving the code.
5. **Added service-level unit tests** (`test_topics_service.py`, `test_exercises_service.py`, `test_study_sessions_service.py`) that call service functions directly against seeded ORM data, with no Flask test client/HTTP round-trip — these test the actual domain logic (lock computation, scoring, validation) in isolation, which the route-level tests could only exercise indirectly through a full request/response cycle.

## Consequences
- `pytest`: 58 tests pass (47 after ADR 0019 + 11 new service-unit tests).
- Verified against the live dev stack: restarted `api`, confirmed `/api/v1/topics` (81 topics), `/api/v1/dashboard/summary`, and `/api/v1/learning-sessions/3` all still 200; confirmed the exercise-submission 400 (out-of-range `selected_index`) and study-session-creation 400 (invalid `mode_minutes`) error paths return byte-identical messages to before the extraction.
- No schema, migration, or API response-shape changes. Route files are now ~40-60% shorter and contain only request parsing, service calls, and response shaping — no business rules.
- `routes/topics.py` kept `_dev_bypass_active()` (reads `current_app.config`) and `_prerequisite_summary()`/`_topic_list_item()` (Pydantic shaping) at the route layer, deliberately, per decision 2 — the dev-bypass flag is a runtime/HTTP-layer concern, not a domain rule.
