"""Read access to learning session content for the learning page."""
from __future__ import annotations

from flask import Blueprint, abort, jsonify

from app.extensions import db
from app.models import LearningSession
from app.schemas import (
    ContentBlockDetail,
    ExerciseSummary,
    LearningSessionDetail,
    NoteDetail,
    TopicSummary,
)

learning_sessions_bp = Blueprint("learning_sessions", __name__, url_prefix="/api/v1")


def _serialize(learning_session: LearningSession) -> dict:
    body = LearningSessionDetail(
        id=learning_session.id,
        title=learning_session.title,
        duration_minutes=learning_session.duration_minutes,
        objective=learning_session.objective,
        sequence=learning_session.sequence,
        access_tier=learning_session.access_tier,
        topic=TopicSummary.model_validate(learning_session.topic),
        content_blocks=[
            ContentBlockDetail(
                id=block.id,
                sequence=block.sequence,
                heading=block.heading,
                body=block.body,
                note=(
                    NoteDetail(body=block.note.body, updated_at=block.note.updated_at)
                    if block.note
                    else None
                ),
            )
            for block in learning_session.content_blocks
        ],
        exercises=[
            ExerciseSummary(
                id=exercise.id,
                type=exercise.type,
                prompt=exercise.prompt,
                options=exercise.definition_json["options"],
            )
            for exercise in learning_session.exercises
        ],
    )
    return body.model_dump()


@learning_sessions_bp.get("/learning-sessions/<int:session_id>")
def get_learning_session(session_id: int):
    learning_session = db.session.get(LearningSession, session_id)
    if learning_session is None:
        abort(404, description="Learning session not found")

    return jsonify(_serialize(learning_session))
