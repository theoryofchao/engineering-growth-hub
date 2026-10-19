"""Pomodoro timer runs against a learning session.

Reload-safe timing: elapsed time is computed server-side from stored
timestamps (see StudySession.live_elapsed_seconds), never trusted from
the client, so a page reload or client clock skew can't lose or
fabricate progress.
"""

from __future__ import annotations

from flask import Blueprint, abort, jsonify, request

from app.models import StudySession
from app.schemas import StudySessionDetail
from app.services import study_sessions_service
from app.services.study_sessions_service import BREAK_MINUTES

study_sessions_bp = Blueprint("study_sessions", __name__, url_prefix="/api/v1")


def _serialize(session: StudySession) -> dict:
    body = StudySessionDetail(
        id=session.id,
        learning_session_id=session.learning_session_id,
        mode_minutes=session.mode_minutes,
        break_minutes=BREAK_MINUTES[session.mode_minutes],
        status=session.status,
        elapsed_seconds=session.live_elapsed_seconds(),
        completed_at=session.completed_at,
    )
    return body.model_dump()


@study_sessions_bp.post("/study-sessions")
def create_study_session():
    data = request.get_json(silent=True) or {}

    try:
        session = study_sessions_service.create(
            data.get("learning_session_id"), data.get("mode_minutes")
        )
    except ValueError as error:
        abort(400, description=str(error))

    if session is None:
        abort(400, description="learning_session_id does not exist")

    return jsonify(_serialize(session)), 201


@study_sessions_bp.get("/study-sessions/<int:session_id>")
def get_study_session(session_id: int):
    session = study_sessions_service.get(session_id)
    if session is None:
        abort(404, description="Study session not found")

    return jsonify(_serialize(session))


@study_sessions_bp.patch("/study-sessions/<int:session_id>")
def update_study_session(session_id: int):
    data = request.get_json(silent=True) or {}

    try:
        session = study_sessions_service.apply_action(session_id, data.get("action"))
    except ValueError as error:
        abort(400, description=str(error))

    if session is None:
        abort(404, description="Study session not found")

    return jsonify(_serialize(session))
