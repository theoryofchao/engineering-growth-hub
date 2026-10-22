"""Per-content-block completion state, synced from apps/web's local-first
queue in batches rather than one request per toggle.

Conflicts (e.g. two tabs open on the same block) are resolved last-write-
wins by the client-supplied `client_updated_at`, not by server receipt
order, so a delayed retry can't clobber a newer toggle that already landed.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime

from sqlalchemy.orm import selectinload

from app.extensions import db
from app.models import BlockCompletion, ContentBlock, LearningSession


def _as_aware(value: datetime) -> datetime:
    """SQLite (used in tests) round-trips `DateTime(timezone=True)` as
    naive, while Postgres keeps it tz-aware -- normalize to UTC-aware
    before comparing so last-write-wins behaves the same in both.
    """
    return value if value.tzinfo is not None else value.replace(tzinfo=UTC)


@dataclass
class CompletionState:
    content_block_id: int
    completed: bool
    updated_at: datetime | None


def get_completions_for_session(learning_session_id: int) -> list[CompletionState] | None:
    """Returns the state of every block in the session, including blocks
    that have never been toggled (as not-completed). None if the
    learning session doesn't exist.
    """
    learning_session = db.session.get(
        LearningSession,
        learning_session_id,
        options=[selectinload(LearningSession.content_blocks).selectinload(ContentBlock.completion)],
    )
    if learning_session is None:
        return None

    return [
        CompletionState(
            content_block_id=block.id,
            completed=block.completion is not None and block.completion.completed_at is not None,
            updated_at=block.completion.updated_at if block.completion else None,
        )
        for block in learning_session.content_blocks
    ]


def apply_batch(items: list[dict]) -> list[CompletionState]:
    """Upserts each `{content_block_id, completed, client_updated_at}`.

    Raises ValueError if any content_block_id doesn't exist. A write is
    applied only if its client_updated_at is at least as new as the
    stored updated_at, so an out-of-order or retried flush can't
    overwrite a newer toggle with a stale one.
    """
    block_ids = {item["content_block_id"] for item in items}
    found_ids = {row.id for row in ContentBlock.query.filter(ContentBlock.id.in_(block_ids)).all()}
    missing = block_ids - found_ids
    if missing:
        raise ValueError(f"content_block_id(s) not found: {sorted(missing)}")

    existing = {
        row.content_block_id: row
        for row in BlockCompletion.query.filter(BlockCompletion.content_block_id.in_(block_ids)).all()
    }

    results: dict[int, CompletionState] = {}
    for item in items:
        content_block_id = item["content_block_id"]
        completed = item["completed"]
        client_updated_at = item["client_updated_at"]

        completion = existing.get(content_block_id)
        if completion is None:
            completion = BlockCompletion(content_block_id=content_block_id)
            db.session.add(completion)
            existing[content_block_id] = completion
            completion.completed_at = client_updated_at if completed else None
            completion.updated_at = client_updated_at
        elif _as_aware(client_updated_at) >= _as_aware(completion.updated_at):
            completion.completed_at = client_updated_at if completed else None
            completion.updated_at = client_updated_at

        results[content_block_id] = CompletionState(
            content_block_id=content_block_id,
            completed=completion.completed_at is not None,
            updated_at=completion.updated_at,
        )

    db.session.commit()
    return list(results.values())
