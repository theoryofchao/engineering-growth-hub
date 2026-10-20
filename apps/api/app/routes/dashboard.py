"""Aggregate progress view: time spent vs. practiced vs. mastered.

Per docs/PRODUCT.md, these are deliberately separate metrics — finishing
a Pomodoro timer is not the same as demonstrating mastery through an
exercise.
"""

from __future__ import annotations

from flask import Blueprint, jsonify

from app.schemas import DashboardSummary, SectionProgressSummary
from app.services import dashboard_service

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/v1")


@dashboard_bp.get("/dashboard/summary")
def get_dashboard_summary():
    summary = dashboard_service.get_summary()

    body = DashboardSummary(
        total_study_seconds=summary.total_study_seconds,
        sections=[
            SectionProgressSummary(
                section_id=view.section.id,
                title=view.section.title,
                slug=view.section.slug,
                status=view.status,
                exercises_attempted=view.exercises_attempted,
                exercises_correct=view.exercises_correct,
            )
            for view in summary.sections
        ],
    )
    return jsonify(body.model_dump())
