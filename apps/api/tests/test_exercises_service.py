"""Unit tests for the exercises service's scoring/validation, exercised
directly now that it's not embedded in the route handler.
"""

import pytest

from app.models import Section
from app.seed import seed_all
from app.services import exercises_service


def _browser_rendering_exercise_id(app) -> int:
    with app.app_context():
        seed_all()
        section = Section.query.filter_by(slug="browser-rendering").first()
        return section.learning_sessions[0].exercises[0].id


def test_submit_returns_none_for_missing_exercise(app):
    with app.app_context():
        seed_all()
        assert exercises_service.submit(999999, 0) is None


def test_submit_raises_value_error_for_out_of_range_index(app):
    exercise_id = _browser_rendering_exercise_id(app)

    with app.app_context():
        with pytest.raises(ValueError, match="selected_index"):
            exercises_service.submit(exercise_id, 999)


def test_submit_scores_correctly_and_advances_progress(app):
    exercise_id = _browser_rendering_exercise_id(app)

    with app.app_context():
        from app.extensions import db
        from app.models import Exercise

        correct_index = db.session.get(Exercise, exercise_id).definition_json["correct_index"]

        result = exercises_service.submit(exercise_id, correct_index)

        assert result.is_correct is True
        assert result.score == 1.0
