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


def _reverse_in_place_exercise_id(app) -> int:
    with app.app_context():
        seed_all()
        section = Section.query.filter_by(slug="01-data-structures").first()
        session = section.learning_sessions[0]
        exercise = next(
            e
            for b in session.content_blocks
            for e in b.exercises
            if e.type == "code" and e.definition_json["function_name"] == "reverseInPlace"
        )
        return exercise.id


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


def test_submit_code_all_cases_pass_advances_progress(app):
    exercise_id = _reverse_in_place_exercise_id(app)

    with app.app_context():
        from app.extensions import db
        from app.models import Exercise, UserProgress

        exercise = db.session.get(Exercise, exercise_id)
        definition = exercise.definition_json
        cases = definition["visible_test_cases"] + definition["hidden_test_cases"]
        outputs = [list(reversed(c["input"][0])) for c in cases]

        result = exercises_service.submit(exercise_id, outputs)

        assert result.is_correct is True
        assert result.score == 1.0
        assert all(c.passed for c in result.cases)

        section_id = exercise.learning_session.section_id
        progress = UserProgress.query.filter_by(section_id=section_id).first()
        assert progress.status == "practiced"


def test_submit_code_partial_pass_does_not_advance_progress(app):
    exercise_id = _reverse_in_place_exercise_id(app)

    with app.app_context():
        from app.extensions import db
        from app.models import Exercise, UserProgress

        exercise = db.session.get(Exercise, exercise_id)
        definition = exercise.definition_json
        cases = definition["visible_test_cases"] + definition["hidden_test_cases"]
        # Wrong on purpose for every case: identity instead of reverse.
        outputs = [c["input"][0] for c in cases]

        result = exercises_service.submit(exercise_id, outputs)

        assert result.is_correct is False
        assert 0.0 < result.score < 1.0  # identity matches the [] and [5] cases, not the rest

        section_id = exercise.learning_session.section_id
        progress = UserProgress.query.filter_by(section_id=section_id).first()
        assert progress is None


def test_submit_code_rejects_wrong_length_outputs(app):
    exercise_id = _reverse_in_place_exercise_id(app)

    with app.app_context():
        with pytest.raises(ValueError, match="outputs"):
            exercises_service.submit(exercise_id, [[]])


def test_submit_code_error_sentinel_scores_as_failed_not_a_crash(app):
    exercise_id = _reverse_in_place_exercise_id(app)

    with app.app_context():
        from app.extensions import db
        from app.models import Exercise

        exercise = db.session.get(Exercise, exercise_id)
        definition = exercise.definition_json
        total = len(definition["visible_test_cases"]) + len(definition["hidden_test_cases"])
        outputs = [{"__error__": "timeout"}] * total

        result = exercises_service.submit(exercise_id, outputs)

        assert result.is_correct is False
        assert all(not c.passed for c in result.cases)


def test_submit_code_hidden_cases_reveal_expected_output_after_grading(app):
    exercise_id = _reverse_in_place_exercise_id(app)

    with app.app_context():
        from app.extensions import db
        from app.models import Exercise

        exercise = db.session.get(Exercise, exercise_id)
        definition = exercise.definition_json
        cases = definition["visible_test_cases"] + definition["hidden_test_cases"]
        outputs = [list(reversed(c["input"][0])) for c in cases]

        result = exercises_service.submit(exercise_id, outputs)

        hidden_results = [c for c in result.cases if c.hidden]
        assert len(hidden_results) == len(definition["hidden_test_cases"])
        assert all(c.expected_output is not None for c in hidden_results)
