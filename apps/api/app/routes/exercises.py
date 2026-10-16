"""Exercise submissions. The answer key (definition_json) never leaves
this module until after the submission is scored.
"""
from __future__ import annotations

from flask import Blueprint, abort, jsonify, request

from app.extensions import db
from app.models import Exercise, ExerciseSubmission, UserProgress
from app.schemas import ExerciseSubmissionResult

exercises_bp = Blueprint("exercises", __name__, url_prefix="/api/v1")


@exercises_bp.post("/exercises/<int:exercise_id>/submissions")
def submit_exercise(exercise_id: int):
    exercise = db.session.get(Exercise, exercise_id)
    if exercise is None:
        abort(404, description="Exercise not found")

    data = request.get_json(silent=True) or {}
    selected_index = data.get("selected_index")
    options = exercise.definition_json["options"]

    if not isinstance(selected_index, int) or not (0 <= selected_index < len(options)):
        abort(400, description=f"selected_index must be an integer between 0 and {len(options) - 1}")

    correct_index = exercise.definition_json["correct_index"]
    is_correct = selected_index == correct_index
    score = 1.0 if is_correct else 0.0

    submission = ExerciseSubmission(
        exercise_id=exercise.id,
        result_json={"selected_index": selected_index},
        score=score,
    )
    db.session.add(submission)

    if is_correct:
        topic_id = exercise.learning_session.topic_id
        progress = UserProgress.get_or_create(topic_id)
        progress.advance_to("practiced")

    db.session.commit()

    body = ExerciseSubmissionResult(
        exercise_id=exercise.id,
        is_correct=is_correct,
        score=score,
        correct_index=correct_index,
        explanation=exercise.definition_json["explanation"],
    )
    return jsonify(body.model_dump()), 201
