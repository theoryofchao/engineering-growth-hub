"""Aggregate progress view: time spent vs. practiced vs. mastered.

Per docs/PRODUCT.md, these are deliberately separate metrics — finishing
a Pomodoro timer is not the same as demonstrating mastery through an
exercise.
"""

from __future__ import annotations

from flask import Blueprint, jsonify

from app.schemas import DashboardSummary, TopicProgressSummary
from app.services import dashboard_service

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/v1")


@dashboard_bp.get("/dashboard/summary")
def get_dashboard_summary():
    summary = dashboard_service.get_summary()

    body = DashboardSummary(
        total_study_seconds=summary.total_study_seconds,
        topics=[
            TopicProgressSummary(
                topic_id=view.topic.id,
                title=view.topic.title,
                slug=view.topic.slug,
                status=view.status,
                exercises_attempted=view.exercises_attempted,
                exercises_correct=view.exercises_correct,
            )
            for view in summary.topics
        ],
    )
    return jsonify(body.model_dump())
