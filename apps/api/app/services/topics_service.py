"""Topic listing, detail, and prerequisite-lock computation.

Eager-loads the full domain->module->topic->(sessions/progress/
prerequisites) fan-out in a fixed number of queries -- see ADR 0019 for
why (previously O(domains + modules + topics * (3 + prerequisites))).
"""

from __future__ import annotations

from dataclasses import dataclass, field

from sqlalchemy.orm import selectinload

from app.extensions import db
from app.models import PROGRESS_STATUS_RANK, Domain, Module, Topic


@dataclass
class PrerequisiteStatus:
    topic: Topic
    status: str


@dataclass
class TopicStatus:
    topic: Topic
    status: str
    is_locked: bool
    dev_bypassed: bool
    prerequisites: list[PrerequisiteStatus] = field(default_factory=list)
    unmet_prerequisites: list[PrerequisiteStatus] = field(default_factory=list)


def _topic_status(topic: Topic) -> str:
    return topic.progress.status if topic.progress else "not_started"


def _is_prerequisite_met(status: str) -> bool:
    return PROGRESS_STATUS_RANK[status] >= PROGRESS_STATUS_RANK["practiced"]


def compute_topic_status(topic: Topic, dev_bypass: bool) -> TopicStatus:
    prerequisites = [
        PrerequisiteStatus(topic=prereq, status=_topic_status(prereq))
        for prereq in topic.prerequisites
    ]
    unmet = [p for p in prerequisites if not _is_prerequisite_met(p.status)]
    return TopicStatus(
        topic=topic,
        status=_topic_status(topic),
        is_locked=not dev_bypass and len(unmet) > 0,
        dev_bypassed=dev_bypass and len(unmet) > 0,
        prerequisites=prerequisites,
        unmet_prerequisites=unmet,
    )


def list_topics() -> list[Domain]:
    """Every domain, eager-loaded down through each topic's sessions,
    progress, and prerequisites (each prerequisite's own progress too).
    """
    return (
        Domain.query.options(
            selectinload(Domain.modules)
            .selectinload(Module.topics)
            .options(
                selectinload(Topic.learning_sessions),
                selectinload(Topic.progress),
                selectinload(Topic.prerequisites).selectinload(Topic.progress),
            )
        )
        .order_by(Domain.id)
        .all()
    )


def get_topic_detail(topic_id: int, dev_bypass: bool) -> TopicStatus | None:
    topic = db.session.get(
        Topic,
        topic_id,
        options=[
            selectinload(Topic.prerequisites).selectinload(Topic.progress),
            selectinload(Topic.learning_sessions),
            selectinload(Topic.progress),
        ],
    )
    if topic is None:
        return None
    return compute_topic_status(topic, dev_bypass)
