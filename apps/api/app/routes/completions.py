"""Per-content-block completion tracking.

apps/web queues toggles locally and flushes them here in batches rather
than one request per click -- see ADR 0030.
"""

from __future__ import annotations

from flask import Blueprint, abort, jsonify, request
from pydantic import ValidationError

from app.schemas import BlockCompletionBatchRequest, BlockCompletionDetail
from app.services import completions_service

completions_bp = Blueprint("completions", __name__, url_prefix="/api/v1")


def _serialize(state) -> dict:
    return BlockCompletionDetail(
        content_block_id=state.content_block_id,
        completed=state.completed,
        updated_at=state.updated_at,
    ).model_dump()


@completions_bp.get("/learning-sessions/<int:learning_session_id>/completions")
def get_completions(learning_session_id: int):
    states = completions_service.get_completions_for_session(learning_session_id)
    if states is None:
        abort(404, description="Learning session not found")

    return jsonify([_serialize(state) for state in states])


@completions_bp.post("/content-blocks/completions/batch")
def batch_upsert_completions():
    data = request.get_json(silent=True) or {}
    try:
        batch = BlockCompletionBatchRequest.model_validate(data)
    except ValidationError as exc:
        abort(400, description=str(exc))

    if not batch.completions:
        return jsonify([])

    try:
        states = completions_service.apply_batch([item.model_dump() for item in batch.completions])
    except ValueError as exc:
        abort(404, description=str(exc))

    return jsonify([_serialize(state) for state in states])
