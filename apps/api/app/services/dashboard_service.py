"""Aggregate progress view: time spent vs. practiced vs. mastered.

Per docs/PRODUCT.md, these are deliberately separate metrics -- finishing
a Pomodoro timer is not the same as demonstrating mastery through an
exercise.
"""

from __future__ import annotations

from dataclasses import dataclass, field

from sqlalchemy.orm import selectinload

from app.models import Exercise, LearningSession, Section, StudySession, UserProgress


@dataclass
class SectionProgressView:
    section: Section
    status: str
    exercises_attempted: int
    exercises_correct: int


@dataclass
class DashboardSummaryView:
    total_study_seconds: int
    sections: list[SectionProgressView] = field(default_factory=list)


def get_summary() -> DashboardSummaryView:
    total_study_seconds = sum(
        session.live_elapsed_seconds() for session in StudySession.query.all()
    )

    sections_with_content = (
        Section.query.join(Section.learning_sessions)
        .options(
            selectinload(Section.learning_sessions)
            .selectinload(LearningSession.exercises)
            .selectinload(Exercise.submissions)
        )
        .distinct()
        .order_by(Section.id)
        .all()
    )

    # One bulk query instead of one UserProgress lookup per section.
    progress_by_section_id = {
        progress.section_id: progress
        for progress in UserProgress.query.filter(
            UserProgress.section_id.in_([section.id for section in sections_with_content])
        ).all()
    }

    section_views = []
    for section in sections_with_content:
        progress = progress_by_section_id.get(section.id)
        exercises = [
            exercise
            for learning_session in section.learning_sessions
            for exercise in learning_session.exercises
        ]
        attempted = sum(1 for exercise in exercises if exercise.submissions)
        correct = sum(
            1 for exercise in exercises if any(s.score == 1.0 for s in exercise.submissions)
        )

        section_views.append(
            SectionProgressView(
                section=section,
                status=progress.status if progress else "not_started",
                exercises_attempted=attempted,
                exercises_correct=correct,
            )
        )

    return DashboardSummaryView(total_study_seconds=total_study_seconds, sections=section_views)
