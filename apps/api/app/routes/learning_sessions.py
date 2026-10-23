"""Read access to learning session content for the learning page."""

from __future__ import annotations

from flask import Blueprint, abort, jsonify

from app.models import LearningSession
from app.schemas import (
    ContentBlockDetail,
    ContentExample,
    ExerciseSummary,
    ExerciseSummaryCode,
    ExerciseSummaryProject,
    ExerciseSummaryQuiz,
    LearningSessionDetail,
    LearningSessionSummary,
    NoteDetail,
    ReferenceLink,
    SectionSummary,
)
from app.services import completions_service, learning_sessions_service

learning_sessions_bp = Blueprint("learning_sessions", __name__, url_prefix="/api/v1")


def _exercise_summary(exercise) -> ExerciseSummary:
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


def _serialize(learning_session: LearningSession) -> dict:
    session_level_exercises = [e for e in learning_session.exercises if e.content_block_id is None]

    section_sessions = learning_session.section.learning_sessions
    completion_counts = completions_service.get_completion_counts_for_learning_sessions(
        [s.id for s in section_sessions]
    )

    body = LearningSessionDetail(
        id=learning_session.id,
        title=learning_session.title,
        duration_minutes=learning_session.duration_minutes,
        objective=learning_session.objective,
        sequence=learning_session.sequence,
        access_tier=learning_session.access_tier,
        section=SectionSummary.model_validate(learning_session.section),
        section_sessions=[
            LearningSessionSummary(
                id=s.id,
                title=s.title,
                sequence=s.sequence,
                duration_minutes=s.duration_minutes,
                is_complete=completions_service.is_fully_complete(*completion_counts.get(s.id, (0, 0))),
            )
            for s in section_sessions
        ],
        content_blocks=[
            ContentBlockDetail(
                id=block.id,
                sequence=block.sequence,
                heading=block.heading,
                body=block.body,
                note=(
                    NoteDetail(body=block.note.body, updated_at=block.note.updated_at)
                    if block.note
                    else None
                ),
                exercises=[_exercise_summary(e) for e in block.exercises],
                examples=[ContentExample(**example) for example in block.examples],
                reference_links=[ReferenceLink(**link) for link in block.reference_links],
            )
            for block in learning_session.content_blocks
        ],
        exercises=[_exercise_summary(e) for e in session_level_exercises],
    )
    return body.model_dump()


@learning_sessions_bp.get("/learning-sessions/<int:session_id>")
def get_learning_session(session_id: int):
    learning_session = learning_sessions_service.get_detail(session_id)
    if learning_session is None:
        abort(404, description="Learning session not found")

    return jsonify(_serialize(learning_session))
