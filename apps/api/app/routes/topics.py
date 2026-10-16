"""Full curriculum breadth for the homepage: every domain/topic that
exists (per CURRICULUM.md), flagged with whether a lesson has actually
been authored yet. Most topics have no learning sessions — that's
expected, not a bug, until Milestone 2's full content import.
"""
from __future__ import annotations

from flask import Blueprint, jsonify

from app.models import Domain
from app.schemas import DomainWithTopics, TopicListItem

topics_bp = Blueprint("topics", __name__, url_prefix="/api/v1")


@topics_bp.get("/topics")
def list_topics():
    domains = Domain.query.order_by(Domain.id).all()

    body = [
        DomainWithTopics(
            id=domain.id,
            name=domain.name,
            description=domain.description,
            topics=[
                TopicListItem(
                    id=topic.id,
                    title=topic.title,
                    slug=topic.slug,
                    description=topic.description,
                    proficiency_tier=topic.proficiency_tier,
                    has_content=len(topic.learning_sessions) > 0,
                    first_learning_session_id=(
                        topic.learning_sessions[0].id if topic.learning_sessions else None
                    ),
                )
                for module in domain.modules
                for topic in module.topics
            ],
        )
        for domain in domains
    ]

    return jsonify([d.model_dump() for d in body])
