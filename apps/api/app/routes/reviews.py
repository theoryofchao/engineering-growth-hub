"""Spaced-repetition review queue (Leitner boxes) -- see
app/services/exercises_service.py for the scheduling logic.
"""

from __future__ import annotations

from flask import Blueprint, jsonify

from app.schemas import ExerciseReviewQueueItem, TopicRef
from app.services import exercises_service

reviews_bp = Blueprint("reviews", __name__, url_prefix="/api/v1")


@reviews_bp.get("/reviews/due")
def get_due_reviews():
    states = exercises_service.get_due_review_exercises()
    items = [
        ExerciseReviewQueueItem(
            exercise=exercises_service.exercise_summary(state.exercise),
            box=state.box,
            due_at=state.due_at,
            topic=TopicRef(
                name=state.exercise.learning_session.section.module.topic.name,
                slug=state.exercise.learning_session.section.module.topic.slug,
            ),
            section_title=state.exercise.learning_session.section.title,
            section_slug=state.exercise.learning_session.section.slug,
            learning_session_id=state.exercise.learning_session_id,
            learning_session_title=state.exercise.learning_session.title,
        )
        for state in states
    ]
    return jsonify([item.model_dump() for item in items])
