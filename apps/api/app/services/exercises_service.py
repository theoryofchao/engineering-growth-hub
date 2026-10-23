"""Exercise submission scoring and progress advancement. The answer key
(definition_json) never leaves this module ungraded.

Code exercises generalize the multiple_choice trust model instead of
replacing it: multiple_choice compares a submitted `selected_index` to
a stored `correct_index`; code compares a submitted list of `outputs`
(produced by the client's own sandboxed run of the learner's function)
to stored `expected_output` values, one per test case. Both are plain
data-equality checks against an answer key the server alone holds --
this module never executes learner code.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import timedelta
from typing import Any

from sqlalchemy.orm import joinedload

from app.extensions import db
from app.models import (
    Exercise,
    ExerciseReviewState,
    ExerciseSubmission,
    LearningSession,
    Module,
    ProjectProgress,
    Section,
    UserProgress,
    _utcnow,
)
from app.schemas import (
    ExerciseSummary,
    ExerciseSummaryCode,
    ExerciseSummaryProject,
    ExerciseSummaryQuiz,
)

# Leitner box -> days until next due, by box index. A correct review
# promotes to the next box (capped at the last one); an incorrect
# review resets to box 0.
REVIEW_BOX_INTERVALS_DAYS = [1, 3, 7, 14, 30]


@dataclass
class ExerciseResult:
    exercise_id: int
    is_correct: bool
    score: float
    correct_index: int
    explanation: str


@dataclass
class CodeCaseOutcome:
    hidden: bool
    input: list[Any]
    expected_output: Any
    actual_output: Any
    passed: bool


@dataclass
class CodeExerciseResult:
    exercise_id: int
    is_correct: bool
    score: float
    cases: list[CodeCaseOutcome]


def exercise_summary(exercise: Exercise) -> ExerciseSummary:
    """Client-safe view of an exercise, dispatched on `exercise.type`.
    Shared by the learning-session detail route and the review-queue
    route so both serialize exercises identically.
    """
    definition = exercise.definition_json
    if exercise.type == "code":
        return ExerciseSummaryCode(
            id=exercise.id,
            type="code",
            prompt=exercise.prompt,
            language=definition.get("language", "javascript"),
            function_name=definition["function_name"],
            starter_code=definition["starter_code"],
            timeout_ms=definition.get("timeout_ms", 2000),
            visible_test_cases=definition["visible_test_cases"],
            # Hidden cases are stripped down to their input only -- the
            # expected_output answer key must not reach the client
            # before a submission is scored. Don't "simplify" this to
            # passing `definition["hidden_test_cases"]` through as-is.
            hidden_test_cases=[
                {"input": case["input"]} for case in definition["hidden_test_cases"]
            ],
        )
    if exercise.type == "project":
        return ExerciseSummaryProject(
            id=exercise.id,
            type="project",
            prompt=exercise.prompt,
            checkpoints=definition["checkpoints"],
            checked_criteria=(
                exercise.project_progress.checked_criteria if exercise.project_progress else {}
            ),
        )
    return ExerciseSummaryQuiz(
        id=exercise.id,
        type="multiple_choice",
        prompt=exercise.prompt,
        options=definition["options"],
    )


def submit(exercise_id: int, payload: Any) -> ExerciseResult | CodeExerciseResult | None:
    """Returns None if the exercise doesn't exist. Raises ValueError if
    `payload` is malformed for this exercise's type.
    """
    exercise = db.session.get(
        Exercise, exercise_id, options=[joinedload(Exercise.learning_session)]
    )
    if exercise is None:
        return None

    if exercise.type == "code":
        return _submit_code(exercise, payload)
    return _submit_quiz(exercise, payload)


def _advance_progress(exercise: Exercise) -> None:
    section_id = exercise.learning_session.section_id
    UserProgress.get_or_create(section_id).advance_to("practiced")


def _record_review_outcome(exercise: Exercise, is_correct: bool) -> None:
    """Called on every quiz/code submission, not just the first one -- a
    scheduled review's own submission re-enters here too, which is what
    advances the box further. Demoting to box 0 on a wrong answer is
    deliberate: unlike `UserProgress.advance_to`, this schedule is
    allowed to regress.
    """
    now = _utcnow()
    state = ExerciseReviewState.query.filter_by(exercise_id=exercise.id).first()
    if state is None:
        # `box` must be set explicitly here, not left to the column's
        # `default=0` -- that default isn't applied to this in-memory
        # object until the next flush/commit (same gotcha as
        # ProjectProgress.checked_criteria in toggle_checkpoint_criterion).
        state = ExerciseReviewState(exercise_id=exercise.id, box=0, due_at=now)
        db.session.add(state)

    state.box = min(state.box + 1, len(REVIEW_BOX_INTERVALS_DAYS) - 1) if is_correct else 0
    state.due_at = now + timedelta(days=REVIEW_BOX_INTERVALS_DAYS[state.box])
    state.last_reviewed_at = now


def get_due_review_exercises() -> list[ExerciseReviewState]:
    """Review states whose schedule has come due, oldest-due first."""
    return (
        ExerciseReviewState.query.filter(ExerciseReviewState.due_at <= _utcnow())
        .order_by(ExerciseReviewState.due_at)
        .options(
            joinedload(ExerciseReviewState.exercise)
            .joinedload(Exercise.learning_session)
            .joinedload(LearningSession.section)
            .joinedload(Section.module)
            .joinedload(Module.topic)
        )
        .all()
    )


def _submit_quiz(exercise: Exercise, selected_index: Any) -> ExerciseResult:
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
        _advance_progress(exercise)
    _record_review_outcome(exercise, is_correct)

    db.session.commit()

    return ExerciseResult(
        exercise_id=exercise.id,
        is_correct=is_correct,
        score=score,
        correct_index=correct_index,
        explanation=exercise.definition_json["explanation"],
    )


def _submit_code(exercise: Exercise, outputs: Any) -> CodeExerciseResult:
    """`outputs` must be a list with one entry per test case, in the
    fixed `visible_test_cases` then `hidden_test_cases` order -- this
    ordering is the wire contract with the frontend's worker runner
    (apps/web/src/lib/code-runner.ts). Each entry is whatever value the
    client's sandboxed run produced; a worker error/timeout is encoded
    as a sentinel value by the client that will simply never equal a
    real expected output, so it scores as failed without this module
    needing to special-case it.
    """
    visible_cases = exercise.definition_json["visible_test_cases"]
    hidden_cases = exercise.definition_json["hidden_test_cases"]
    all_cases = [(case, False) for case in visible_cases] + [(case, True) for case in hidden_cases]

    if not isinstance(outputs, list) or len(outputs) != len(all_cases):
        raise ValueError(f"outputs must be a list of exactly {len(all_cases)} values")

    case_results = []
    for (case, hidden), actual_output in zip(all_cases, outputs, strict=True):
        passed = actual_output == case["expected_output"]
        case_results.append(
            CodeCaseOutcome(
                hidden=hidden,
                input=case["input"],
                expected_output=case["expected_output"],
                actual_output=actual_output,
                passed=passed,
            )
        )

    passed_count = sum(1 for c in case_results if c.passed)
    score = passed_count / len(case_results)
    is_correct = score == 1.0

    db.session.add(
        ExerciseSubmission(
            exercise_id=exercise.id,
            result_json={"outputs": outputs},
            score=score,
        )
    )

    if is_correct:
        _advance_progress(exercise)
    _record_review_outcome(exercise, is_correct)

    db.session.commit()

    return CodeExerciseResult(
        exercise_id=exercise.id,
        is_correct=is_correct,
        score=score,
        cases=case_results,
    )


def _total_criteria_count(checkpoints: list[dict]) -> int:
    return sum(len(checkpoint["acceptance_criteria"]) for checkpoint in checkpoints)


def toggle_checkpoint_criterion(
    exercise_id: int, checkpoint_index: int, criterion_index: int, checked: bool
) -> Exercise | None:
    """Self-attested project progress -- not a graded submission, so this
    doesn't create an `ExerciseSubmission` row the way quiz/code answers
    do. Returns None if the exercise doesn't exist. Raises ValueError if
    it isn't a project exercise, or the indices are out of range for its
    own `checkpoints` definition.
    """
    exercise = db.session.get(
        Exercise, exercise_id, options=[joinedload(Exercise.learning_session)]
    )
    if exercise is None:
        return None
    if exercise.type != "project":
        raise ValueError("exercise is not a project")

    checkpoints = exercise.definition_json["checkpoints"]
    if not (0 <= checkpoint_index < len(checkpoints)):
        raise ValueError("checkpoint_index out of range")
    criteria = checkpoints[checkpoint_index]["acceptance_criteria"]
    if not (0 <= criterion_index < len(criteria)):
        raise ValueError("criterion_index out of range")

    progress = ProjectProgress.query.filter_by(exercise_id=exercise_id).first()
    if progress is None:
        # `checked_criteria` must be set explicitly here, not left to the
        # column's `default=dict` -- that default isn't applied to this
        # in-memory object until the next flush/commit, so reading it
        # back immediately (as the next line does) would see None.
        progress = ProjectProgress(exercise_id=exercise_id, checked_criteria={})
        db.session.add(progress)

    key = f"{checkpoint_index}:{criterion_index}"
    checked_criteria = dict(progress.checked_criteria)
    if checked:
        checked_criteria[key] = True
    else:
        checked_criteria.pop(key, None)
    progress.checked_criteria = checked_criteria

    if len(checked_criteria) == _total_criteria_count(checkpoints):
        _advance_progress(exercise)

    db.session.commit()
    return exercise
