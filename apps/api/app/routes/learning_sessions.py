"""Read access to learning session content for the learning page."""

from __future__ import annotations

from flask import Blueprint, abort, jsonify

from app.models import LearningSession
from app.schemas import (
    ContentBlockDetail,
    ContentExample,
    ExerciseSummary,
    LearningSessionDetail,
    LearningSessionSummary,
    NoteDetail,
    SectionSummary,
)
from app.services import learning_sessions_service

learning_sessions_bp = Blueprint("learning_sessions", __name__, url_prefix="/api/v1")


def _exercise_summary(exercise) -> ExerciseSummary:
    return ExerciseSummary(
        id=exercise.id,
        type=exercise.type,
        prompt=exercise.prompt,
        options=exercise.definition_json["options"],
    )


def _serialize(learning_session: LearningSession) -> dict:
    session_level_exercises = [e for e in learning_session.exercises if e.content_block_id is None]

    body = LearningSessionDetail(
        id=learning_session.id,
        title=learning_session.title,
        duration_minutes=learning_session.duration_minutes,
        objective=learning_session.objective,
        sequence=learning_session.sequence,
        access_tier=learning_session.access_tier,
        section=SectionSummary.model_validate(learning_session.section),
        section_sessions=[
            LearningSessionSummary(
                id=s.id, title=s.title, sequence=s.sequence, duration_minutes=s.duration_minutes
            )
            for s in learning_session.section.learning_sessions
        ],
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
                exercises=[_exercise_summary(e) for e in block.exercises],
                examples=[ContentExample(**example) for example in block.examples],
            )
            for block in learning_session.content_blocks
        ],
        exercises=[_exercise_summary(e) for e in session_level_exercises],
    )
    return body.model_dump()


@learning_sessions_bp.get("/learning-sessions/<int:session_id>")
def get_learning_session(session_id: int):
    learning_session = learning_sessions_service.get_detail(session_id)
    if learning_session is None:
        abort(404, description="Learning session not found")

    return jsonify(_serialize(learning_session))
