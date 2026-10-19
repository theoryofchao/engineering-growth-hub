"""Unit tests for the study-sessions service's validation, exercised
directly now that it's not embedded in the route handler.
"""

import pytest

from app.models import Topic
from app.seed import seed_all
from app.services import study_sessions_service


def _browser_rendering_session_id(app) -> int:
    with app.app_context():
        seed_all()
        topic = Topic.query.filter_by(slug="browser-rendering").first()
        return topic.learning_sessions[0].id


def test_create_raises_value_error_for_invalid_mode_minutes(app):
    session_id = _browser_rendering_session_id(app)

    with app.app_context():
        with pytest.raises(ValueError, match="mode_minutes"):
            study_sessions_service.create(session_id, 999)


def test_create_returns_none_for_missing_learning_session(app):
    with app.app_context():
        seed_all()
        assert study_sessions_service.create(999999, 25) is None


def test_apply_action_raises_value_error_for_invalid_action(app):
    session_id = _browser_rendering_session_id(app)

    with app.app_context():
        study_session = study_sessions_service.create(session_id, 25)
        with pytest.raises(ValueError, match="action must be"):
            study_sessions_service.apply_action(study_session.id, "not-a-real-action")


def test_apply_action_returns_none_for_missing_session(app):
    with app.app_context():
        seed_all()
        assert study_sessions_service.apply_action(999999, "pause") is None
