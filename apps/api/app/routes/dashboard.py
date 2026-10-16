"""Aggregate progress view: time spent vs. practiced vs. mastered.

Per docs/PRODUCT.md, these are deliberately separate metrics — finishing
a Pomodoro timer is not the same as demonstrating mastery through an
exercise.
"""
from __future__ import annotations

from flask import Blueprint, jsonify

from app.models import StudySession, Topic, UserProgress
from app.schemas import DashboardSummary, TopicProgressSummary

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/v1")


@dashboard_bp.get("/dashboard/summary")
def get_dashboard_summary():
    total_study_seconds = sum(
        session.live_elapsed_seconds() for session in StudySession.query.all()
    )

    topics_with_content = (
        Topic.query.join(Topic.learning_sessions).distinct().order_by(Topic.id)
    )

    topic_summaries = []
    for topic in topics_with_content:
        progress = UserProgress.query.filter_by(topic_id=topic.id).first()
        exercises = [
            exercise
            for learning_session in topic.learning_sessions
            for exercise in learning_session.exercises
        ]
        attempted = sum(1 for exercise in exercises if exercise.submissions)
        correct = sum(
            1 for exercise in exercises if any(s.score == 1.0 for s in exercise.submissions)
        )

        topic_summaries.append(
            TopicProgressSummary(
                topic_id=topic.id,
                title=topic.title,
                slug=topic.slug,
                status=progress.status if progress else "not_started",
                exercises_attempted=attempted,
                exercises_correct=correct,
            )
        )

    body = DashboardSummary(
        total_study_seconds=total_study_seconds,
        topics=topic_summaries,
    )
    return jsonify(body.model_dump())
