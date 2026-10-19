"""Exercise submissions. The answer key (definition_json) never leaves
this module until after the submission is scored.
"""

from __future__ import annotations

from flask import Blueprint, abort, jsonify, request

from app.schemas import ExerciseSubmissionResult
from app.services import exercises_service

exercises_bp = Blueprint("exercises", __name__, url_prefix="/api/v1")


@exercises_bp.post("/exercises/<int:exercise_id>/submissions")
def submit_exercise(exercise_id: int):
    data = request.get_json(silent=True) or {}
    selected_index = data.get("selected_index")

    try:
        result = exercises_service.submit(exercise_id, selected_index)
    except ValueError as error:
        abort(400, description=str(error))

    if result is None:
        abort(404, description="Exercise not found")

    body = ExerciseSubmissionResult(
        exercise_id=result.exercise_id,
        is_correct=result.is_correct,
        score=result.score,
        correct_index=result.correct_index,
        explanation=result.explanation,
    )
    return jsonify(body.model_dump()), 201
