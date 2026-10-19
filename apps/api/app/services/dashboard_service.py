"""Aggregate progress view: time spent vs. practiced vs. mastered.

Per docs/PRODUCT.md, these are deliberately separate metrics -- finishing
a Pomodoro timer is not the same as demonstrating mastery through an
exercise.
"""

from __future__ import annotations

from dataclasses import dataclass, field

from sqlalchemy.orm import selectinload

from app.models import Exercise, LearningSession, StudySession, Topic, UserProgress


@dataclass
class TopicProgressView:
    topic: Topic
    status: str
    exercises_attempted: int
    exercises_correct: int


@dataclass
class DashboardSummaryView:
    total_study_seconds: int
    topics: list[TopicProgressView] = field(default_factory=list)


def get_summary() -> DashboardSummaryView:
    total_study_seconds = sum(
        session.live_elapsed_seconds() for session in StudySession.query.all()
    )

    topics_with_content = (
        Topic.query.join(Topic.learning_sessions)
        .options(
            selectinload(Topic.learning_sessions)
            .selectinload(LearningSession.exercises)
            .selectinload(Exercise.submissions)
        )
        .distinct()
        .order_by(Topic.id)
        .all()
    )

    # One bulk query instead of one UserProgress lookup per topic.
    progress_by_topic_id = {
        progress.topic_id: progress
        for progress in UserProgress.query.filter(
            UserProgress.topic_id.in_([topic.id for topic in topics_with_content])
        ).all()
    }

    topic_views = []
    for topic in topics_with_content:
        progress = progress_by_topic_id.get(topic.id)
        exercises = [
            exercise
            for learning_session in topic.learning_sessions
            for exercise in learning_session.exercises
        ]
        attempted = sum(1 for exercise in exercises if exercise.submissions)
        correct = sum(
            1 for exercise in exercises if any(s.score == 1.0 for s in exercise.submissions)
        )

        topic_views.append(
            TopicProgressView(
                topic=topic,
                status=progress.status if progress else "not_started",
                exercises_attempted=attempted,
                exercises_correct=correct,
            )
        )

    return DashboardSummaryView(total_study_seconds=total_study_seconds, topics=topic_views)
