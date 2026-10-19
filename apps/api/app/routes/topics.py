"""Full curriculum breadth for the homepage: every domain/topic that
exists (per CURRICULUM.md), flagged with whether a lesson has actually
been authored yet. Most topics have no learning sessions — that's
expected, not a bug, until Milestone 2's full content import.
"""

from __future__ import annotations

from flask import Blueprint, abort, current_app, jsonify

from app.schemas import (
    DomainWithTopics,
    LearningSessionSummary,
    PrerequisiteSummary,
    TopicDetail,
    TopicListItem,
)
from app.services import topics_service
from app.services.topics_service import TopicStatus

topics_bp = Blueprint("topics", __name__, url_prefix="/api/v1")


def _dev_bypass_active() -> bool:
    """Local dev-only backdoor: see DEV_UNLOCK_ALL_TOPICS in app/config.py.
    Only ever true under DevelopmentConfig -- TestingConfig and
    ProductionConfig don't define this key, so .get() falls back to False
    for them regardless of what's in the environment.
    """
    return bool(current_app.config.get("DEV_UNLOCK_ALL_TOPICS", False))


def _prerequisite_summary(prereq: topics_service.PrerequisiteStatus) -> PrerequisiteSummary:
    return PrerequisiteSummary(
        id=prereq.topic.id, title=prereq.topic.title, slug=prereq.topic.slug, status=prereq.status
    )


def _topic_list_item(topic_status: TopicStatus) -> TopicListItem:
    topic = topic_status.topic
    return TopicListItem(
        id=topic.id,
        title=topic.title,
        slug=topic.slug,
        description=topic.description,
        proficiency_tier=topic.proficiency_tier,
        has_content=len(topic.learning_sessions) > 0,
        first_learning_session_id=(
            topic.learning_sessions[0].id if topic.learning_sessions else None
        ),
        status=topic_status.status,
        is_locked=topic_status.is_locked,
        unmet_prerequisites=[_prerequisite_summary(p) for p in topic_status.unmet_prerequisites],
        dev_prerequisites_bypassed=topic_status.dev_bypassed,
    )


@topics_bp.get("/topics")
def list_topics():
    domains = topics_service.list_topics()
    dev_bypass = _dev_bypass_active()

    body = [
        DomainWithTopics(
            id=domain.id,
            name=domain.name,
            description=domain.description,
            topics=[
                _topic_list_item(topics_service.compute_topic_status(topic, dev_bypass))
                for module in domain.modules
                for topic in module.topics
            ],
        )
        for domain in domains
    ]

    return jsonify([d.model_dump() for d in body])


@topics_bp.get("/topics/<int:topic_id>")
def get_topic(topic_id: int):
    topic_status = topics_service.get_topic_detail(topic_id, _dev_bypass_active())
    if topic_status is None:
        abort(404, description="Topic not found")

    topic = topic_status.topic
    body = TopicDetail(
        id=topic.id,
        title=topic.title,
        slug=topic.slug,
        description=topic.description,
        proficiency_tier=topic.proficiency_tier,
        status=topic_status.status,
        is_locked=topic_status.is_locked,
        learning_sessions=[
            LearningSessionSummary(
                id=session.id,
                title=session.title,
                sequence=session.sequence,
                duration_minutes=session.duration_minutes,
            )
            for session in topic.learning_sessions
        ],
        prerequisites=[_prerequisite_summary(p) for p in topic_status.prerequisites],
        unmet_prerequisites=[_prerequisite_summary(p) for p in topic_status.unmet_prerequisites],
        dev_prerequisites_bypassed=topic_status.dev_bypassed,
    )

    return jsonify(body.model_dump())
