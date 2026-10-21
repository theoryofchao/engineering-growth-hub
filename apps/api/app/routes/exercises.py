"""Exercise submissions. The answer key (definition_json) never leaves
this module until after the submission is scored.
"""

from __future__ import annotations

from flask import Blueprint, abort, jsonify, request

from app.schemas import ExerciseSubmissionResultCode, ExerciseSubmissionResultQuiz
from app.services import exercises_service
from app.services.exercises_service import CodeExerciseResult, ExerciseResult

exercises_bp = Blueprint("exercises", __name__, url_prefix="/api/v1")


@exercises_bp.post("/exercises/<int:exercise_id>/submissions")
def submit_exercise(exercise_id: int):
    data = request.get_json(silent=True) or {}
    # multiple_choice submits `selected_index`; code submits `outputs`
    # (a list of values produced by the client's sandboxed run). Which
    # key is read is just routing the payload to the matching exercise
    # type's grading path in the service -- the service itself decides
    # based on the exercise's own `type`, not this route.
    payload = data.get("outputs", data.get("selected_index"))

    try:
        result = exercises_service.submit(exercise_id, payload)
    except ValueError as error:
        abort(400, description=str(error))

    if result is None:
        abort(404, description="Exercise not found")

    if isinstance(result, CodeExerciseResult):
        body = ExerciseSubmissionResultCode(
            exercise_id=result.exercise_id,
            is_correct=result.is_correct,
            score=result.score,
            cases=[
                {
                    "hidden": c.hidden,
                    "input": c.input,
                    "expected_output": c.expected_output,
                    "actual_output": c.actual_output,
                    "passed": c.passed,
                }
                for c in result.cases
            ],
        )
    else:
        assert isinstance(result, ExerciseResult)
        body = ExerciseSubmissionResultQuiz(
            exercise_id=result.exercise_id,
            is_correct=result.is_correct,
            score=result.score,
            correct_index=result.correct_index,
            explanation=result.explanation,
        )
    return jsonify(body.model_dump()), 201
