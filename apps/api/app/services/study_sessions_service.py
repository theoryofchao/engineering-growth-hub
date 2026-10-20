"""Pomodoro timer session lifecycle: create, pause/resume/complete.

Reload-safe timing: elapsed time is computed server-side from stored
timestamps (see StudySession.live_elapsed_seconds), never trusted from
the client, so a page reload or client clock skew can't lose or
fabricate progress.
"""

from __future__ import annotations

from app.extensions import db
from app.models import LearningSession, StudySession, UserProgress

BREAK_MINUTES = {25: 5, 50: 10}


def create(learning_session_id: int, mode_minutes: int) -> StudySession | None:
    """Returns None if `learning_session_id` doesn't exist. Raises
    ValueError if `mode_minutes` isn't 25 or 50.
    """
    if mode_minutes not in BREAK_MINUTES:
        raise ValueError("mode_minutes must be 25 or 50")

    learning_session = db.session.get(LearningSession, learning_session_id)
    if learning_session is None:
        return None

    session = StudySession(learning_session_id=learning_session.id, mode_minutes=mode_minutes)
    db.session.add(session)

    UserProgress.get_or_create(learning_session.section_id).advance_to("learning")

    db.session.commit()
    return session


def get(session_id: int) -> StudySession | None:
    return db.session.get(StudySession, session_id)


def apply_action(session_id: int, action: str) -> StudySession | None:
    """Returns None if the session doesn't exist. Raises ValueError if
    `action` isn't one of pause/resume/complete.
    """
    session = db.session.get(StudySession, session_id)
    if session is None:
        return None

    if action == "pause":
        session.pause()
    elif action == "resume":
        session.resume()
    elif action == "complete":
        session.complete()
    else:
        raise ValueError("action must be one of pause, resume, complete")

    db.session.commit()
    return session
