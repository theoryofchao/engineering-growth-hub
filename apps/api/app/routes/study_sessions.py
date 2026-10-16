"""Pomodoro timer runs against a learning session.

Reload-safe timing: elapsed time is computed server-side from stored
timestamps (see StudySession.live_elapsed_seconds), never trusted from
the client, so a page reload or client clock skew can't lose or
fabricate progress.
"""
from __future__ import annotations

from flask import Blueprint, abort, jsonify, request

from app.extensions import db
from app.models import LearningSession, StudySession, UserProgress
from app.schemas import StudySessionDetail

study_sessions_bp = Blueprint("study_sessions", __name__, url_prefix="/api/v1")

_BREAK_MINUTES = {25: 5, 50: 10}


def _serialize(session: StudySession) -> dict:
    body = StudySessionDetail(
        id=session.id,
        learning_session_id=session.learning_session_id,
        mode_minutes=session.mode_minutes,
        break_minutes=_BREAK_MINUTES[session.mode_minutes],
        status=session.status,
        elapsed_seconds=session.live_elapsed_seconds(),
        completed_at=session.completed_at,
    )
    return body.model_dump()


@study_sessions_bp.post("/study-sessions")
def create_study_session():
    data = request.get_json(silent=True) or {}
    learning_session_id = data.get("learning_session_id")
    mode_minutes = data.get("mode_minutes")

    if mode_minutes not in _BREAK_MINUTES:
        abort(400, description="mode_minutes must be 25 or 50")

    learning_session = db.session.get(LearningSession, learning_session_id)
    if learning_session is None:
        abort(400, description="learning_session_id does not exist")

    session = StudySession(
        learning_session_id=learning_session.id,
        mode_minutes=mode_minutes,
    )
    db.session.add(session)

    progress = UserProgress.get_or_create(learning_session.topic_id)
    progress.advance_to("learning")

    db.session.commit()

    return jsonify(_serialize(session)), 201


@study_sessions_bp.get("/study-sessions/<int:session_id>")
def get_study_session(session_id: int):
    session = db.session.get(StudySession, session_id)
    if session is None:
        abort(404, description="Study session not found")

    return jsonify(_serialize(session))


@study_sessions_bp.patch("/study-sessions/<int:session_id>")
def update_study_session(session_id: int):
    session = db.session.get(StudySession, session_id)
    if session is None:
        abort(404, description="Study session not found")

    data = request.get_json(silent=True) or {}
    action = data.get("action")

    if action == "pause":
        session.pause()
    elif action == "resume":
        session.resume()
    elif action == "complete":
        session.complete()
    else:
        abort(400, description="action must be one of pause, resume, complete")

    db.session.commit()

    return jsonify(_serialize(session))
