"""Exercise submission scoring and progress advancement. The answer key
(definition_json) never leaves this module until after scoring.
"""

from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy.orm import joinedload

from app.extensions import db
from app.models import Exercise, ExerciseSubmission, UserProgress


@dataclass
class ExerciseResult:
    exercise_id: int
    is_correct: bool
    score: float
    correct_index: int
    explanation: str


def submit(exercise_id: int, selected_index: int) -> ExerciseResult | None:
    """Returns None if the exercise doesn't exist. Raises ValueError if
    `selected_index` is out of range for this exercise's options.
    """
    exercise = db.session.get(
        Exercise, exercise_id, options=[joinedload(Exercise.learning_session)]
    )
    if exercise is None:
        return None

    options = exercise.definition_json["options"]
    if not isinstance(selected_index, int) or not (0 <= selected_index < len(options)):
        raise ValueError(f"selected_index must be an integer between 0 and {len(options) - 1}")

    correct_index = exercise.definition_json["correct_index"]
    is_correct = selected_index == correct_index
    score = 1.0 if is_correct else 0.0

    db.session.add(
        ExerciseSubmission(
            exercise_id=exercise.id,
            result_json={"selected_index": selected_index},
            score=score,
        )
    )

    if is_correct:
        section_id = exercise.learning_session.section_id
        UserProgress.get_or_create(section_id).advance_to("practiced")

    db.session.commit()

    return ExerciseResult(
        exercise_id=exercise.id,
        is_correct=is_correct,
        score=score,
        correct_index=correct_index,
        explanation=exercise.definition_json["explanation"],
    )
