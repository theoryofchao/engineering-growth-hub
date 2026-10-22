# ADR 0030: Per-block/lesson completion tracking — backend slice (local-first batched sync)

## Status

Accepted (backend slice only — frontend local store, sync engine, and checkmark UI are separate, not-yet-built slices per the plan agreed with the user)

## Context

The user wants to mark individual content blocks ("slides") as read/complete with a checkmark, have the lesson's own completion derive automatically from its blocks, and have that state queue locally in the browser and batch-sync to the backend periodically rather than one request per click. This sits below the existing `UserProgress` model, which tracks coarser per-*section* mastery (`not_started`/`learning`/`practiced`/`mastered`) — this feature adds a new, finer-grained tier at the content-block level, not a replacement.

Three design points were decided with the user up front:
- Lesson-level completion is **derived** (all blocks complete ⇒ lesson complete), not a separately stored flag.
- Completion is **reversible** (unlike `UserProgress.advance_to`, which never downgrades).
- Sync is **debounced + periodic + best-effort on unload**, not purely manual or purely time-boxed.

## Decisions

1. **New `block_completions` table** (`app/models.py`): `id`, `content_block_id` (FK → `content_blocks.id`, `unique=True` — no `user_id` yet, same single-user-MVP posture as every other table in this schema), `completed_at` (nullable `DateTime(timezone=True)`; `NULL` = not completed, a timestamp = completed), `updated_at` (`DateTime(timezone=True)`, not nullable). Reversibility is just toggling `completed_at` between `NULL` and a timestamp — no separate status enum needed. `ContentBlock` gained a `completion` relationship (`uselist=False`, mirroring its existing `note` relationship).
2. **`updated_at` is stamped from the client's own clock reading at toggle time, not server receipt time.** This is the field the batch-sync endpoint uses for last-write-wins conflict resolution (e.g. two tabs toggling the same block, or a retried flush arriving out of order) — comparing by client logical time rather than arrival order means a delayed retry can never clobber a toggle that already landed more recently. A `_as_aware()` helper normalizes naive vs. tz-aware datetimes before comparing, because SQLite (used by the test suite) round-trips `DateTime(timezone=True)` as naive while Postgres keeps it tz-aware — this was caught by `test_batch_ignores_stale_write` failing with a `TypeError` before the fix.
3. **Lesson completion has no stored column.** `GET /api/v1/learning-sessions/<id>/completions` returns the state of every block in the session (including untouched ones, as not-completed) via `completions_service.get_completions_for_session`; the frontend (next slice) derives "lesson complete" by checking all entries are `completed: true`.
4. **New `completions_service.py`** — the one exception to this codebase's "simple CRUD lives directly in the route, no service file" convention (as seen in `notes.py`), because the batch endpoint needs to bulk-fetch existing rows for all blocks in one query rather than one `get_or_create` round-trip per item, which the per-item static-method pattern (`Note.upsert`, `UserProgress.get_or_create`) doesn't support efficiently.
5. **`POST /api/v1/content-blocks/completions/batch`** accepts `{"completions": [{"content_block_id", "completed", "client_updated_at"}, ...]}`, validated by a new Pydantic request schema (`BlockCompletionBatchRequest` — this codebase's first Pydantic-validated *request* body; every prior route hand-validates a plain dict, per `notes.py`). Validates every `content_block_id` exists in one query before writing anything (raises `ValueError` → 404 if not, matching the `study_sessions_service.py` convention of raising `ValueError` for bad input). Returns the canonical post-merge state for every item, including ones whose write was rejected as stale, so the frontend sync engine can reconcile its local queue either way.
6. **New `completions_bp` blueprint** (`app/routes/completions.py`), registered in `app/__init__.py` alongside the others — no route-registration pattern changes.
7. **Migration** `6f7371823939_add_block_completions_table.py`, generated via `flask db migrate` against the live dev Postgres container and hand-tidied (quote style, dropped the autogenerate comment markers) to match the rest of the migration history; chains from the existing head (`e47746f88a8c`).

## Consequences

- `pytest`: 92 passed (85 before this slice + 7 new, in `tests/test_completions.py`), including coverage for defaulting to incomplete, mark/unmark, multi-block batches, stale-write rejection, missing-block 404, and malformed-body 400.
- Verified against the live dev stack (`docker compose`, real Postgres) via `curl`: `GET .../completions` returns all three blocks of a real lesson as not-completed; a batch mark persists and is reflected on a subsequent `GET`; a batch write with an older `client_updated_at` than the stored one is correctly ignored (confirmed the `completed: true` state survives the stale write attempt). Test data was reset to its prior unmarked state afterward.
- Not done this slice (by design, per the agreed plan): the `localStorage` queue, debounce/periodic/unload sync engine, and the checkmark/lesson-banner/jump-to-incomplete UI are separate follow-up slices — this ADR covers only the backend contract they'll be built against.
