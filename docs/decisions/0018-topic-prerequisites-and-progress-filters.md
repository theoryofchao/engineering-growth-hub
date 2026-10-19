# ADR 0018: Topic prerequisites and progress filters

## Status
Accepted

## Context
`docs/ROADMAP.md` Milestone 2's last open bullet is "Prerequisites and progress filters." ADR 0002 explicitly deferred this: "no multi-topic prerequisite data exists yet... Add it when Milestone 2 introduces real prerequisites," and also deferred `GET /api/v1/topics/<id>` "until the frontend topic-browsing view needs it." `CURRICULUM.md` already encodes real prerequisite data as text per module (`- **Prerequisites:** \`08\``, commonly 2-6 per module), but it was never parsed into `curriculum-map.json` or the database. `CURRICULUM.md` itself has an outstanding backlog line asking to "validate prerequisites as a directed acyclic graph" — never done.

## Decisions

1. **Self-referential many-to-many**, not a single `parent_topic_id`. `docs/ARCHITECTURE.md`'s original modeling candidates listed both a `parent_topic_id?` self-ref and a separate `topic_dependencies` join table; real `CURRICULUM.md` data confirms modules commonly have multiple prerequisites (module 2 depends on modules 1, 6, and 8), so a tree-shaped single FK would be insufficient. Added `topic_prerequisites(topic_id, prerequisite_topic_id)` as a plain `db.Table` (no extra columns, so a mapped association class would be speculative), with a `Topic.prerequisites` relationship (`backref="unlocks"`) and a `ck_topic_prerequisites_no_self_reference` check constraint. Named `topic_prerequisites` rather than the architecture doc's `topic_dependencies` — reads naturally as `topic.prerequisites`.

2. **Backfilled from `CURRICULUM.md`, not hand-typed.** Added a one-off `scripts/sync_prerequisites_from_curriculum_md.py` that parses `CURRICULUM.md`'s `#### NN — Title` / `- **Prerequisites:** ...` pairs and splices a `"prerequisites": [...]` field into each of `curriculum-map.json`'s 80 module objects via a targeted per-line regex (not a full `json.dumps` reformat, which would have turned an 80-entry data change into an unreviewable ~600-line formatting diff). Run once; the resulting `curriculum-map.json` diff is committed. Not invoked by the app or CI — re-run by hand if `CURRICULUM.md`'s prerequisites change.

3. **Cycle validation added at seed time.** `app/seed.py`'s `_validate_no_prerequisite_cycles` runs a DFS over the plain `{module_id: [prereq_ids]}` dict before any DB writes, raising `ValueError` naming the cycle (or an unknown module id) on failure. The real 80-module/204-edge graph is confirmed acyclic. `load_curriculum_map` now links prerequisites in a second pass, after every `Topic` row exists (a module can depend on one appearing later in iteration order), via a full-list reassignment (`topic.prerequisites = [...]`) — idempotent for free via SQLAlchemy's collection diffing.

4. **Locked = has at least one prerequisite not yet `practiced` or `mastered`.** Reuses the existing `UserProgress` status ranking (now exported as `app.models.PROGRESS_STATUS_RANK`, no longer module-private since it's used from `routes/topics.py` too). `is_locked` and `has_content` are kept orthogonal in the API — a topic can be unlocked-but-WIP (no sessions authored yet) or locked-with-content; the frontend renders the combination rather than the API collapsing them into one state.

5. **New `GET /api/v1/topics/<id>`** (the endpoint ADR 0002 deferred), returning a topic's sessions, lock status, and full/unmet prerequisite lists (each with its own status, via a new `PrerequisiteSummary` schema kept separate from the existing `TopicSummary` so `LearningSessionDetail.topic`'s shape is untouched). `GET /api/v1/topics` gained the same `status`/`is_locked`/`unmet_prerequisites` fields per topic. Neither route calls `UserProgress.get_or_create` — that would create spurious progress rows from a read-only GET; status defaults to `"not_started"` when no row exists, matching `dashboard.py`'s existing pattern.

6. **Progress filters are client-side only.** With `status`/`is_locked` now in the existing `GET /api/v1/topics` payload (81 topics, small JSON), no new query params were added. `topic-list.tsx` filters the already-fetched data in the browser — simpler, no new backend surface or tests for what's a single-user-app UI convenience.

7. **Frontend**: new `/topics/[id]` route + `topic-overview.tsx` component (same thin-shell/`fetch`+`State`-union conventions as every other page in this app — no OpenAPI codegen exists here). `topic-list.tsx`'s topic cards now link to `/topics/{id}` for every topic with content (locked or not), instead of jumping straight to `/learning/{first_learning_session_id}` — this keeps the lock/unlock decision rendered in exactly one place instead of duplicating a "you're locked" check inside the lesson player.

## Consequences
- `apps/api`: `pytest` — 37 tests pass (8 new: prerequisite resolution from the real map, M2M idempotency across reseeds, the legacy `browser-rendering` topic correctly getting zero prerequisites, 3 cycle-validation unit tests, locked/unlocked list assertions, topic-detail 200/404).
- Verified against real Postgres: migration `02874d94e932` applied/rolled back/reapplied symmetrically; `flask seed` run twice, `topic_prerequisites` row count stable at 204; manually curled `/api/v1/topics` and `/api/v1/topics/2` (locked, 3 unmet prerequisites) and a 404 for a missing id.
- `apps/web`: new `topic-overview.test.tsx` and updated `topic-list.test.tsx` cover locked/unlocked rendering and the filter control.
- Remaining Milestone 2 cleanup, if ever revisited: the legacy `browser-rendering` topic (predates `curriculum-map.json`, no CURRICULUM.md module id) still has no prerequisites by construction, not by data — fine for now, flagged in ADR 0004 already as known reconciliation debt.
