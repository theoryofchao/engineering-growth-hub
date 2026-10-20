"""Full curriculum breadth for the homepage: every topic/section that
exists (per CURRICULUM.md), flagged with whether a lesson has actually
been authored yet. Most sections have no learning sessions — that's
expected, not a bug, until Milestone 2's full content import.
"""

from __future__ import annotations

from flask import Blueprint, current_app, jsonify

from app.schemas import (
    PrerequisiteSummary,
    SectionListItem,
    TopicRef,
    TopicWithSections,
)
from app.services import sections_service, topics_service
from app.services.sections_service import SectionStatus

topics_bp = Blueprint("topics", __name__, url_prefix="/api/v1")


def _dev_bypass_active() -> bool:
    """Local dev-only backdoor: see DEV_UNLOCK_ALL_SECTIONS in app/config.py.
    Only ever true under DevelopmentConfig -- TestingConfig and
    ProductionConfig don't define this key, so .get() falls back to False
    for them regardless of what's in the environment.
    """
    return bool(current_app.config.get("DEV_UNLOCK_ALL_SECTIONS", False))


def _prerequisite_summary(prereq: sections_service.PrerequisiteStatus) -> PrerequisiteSummary:
    section = prereq.section
    return PrerequisiteSummary(
        id=section.id,
        title=section.title,
        slug=section.slug,
        topic=TopicRef(name=section.module.topic.name, slug=section.module.topic.slug),
        status=prereq.status,
    )


def _section_list_item(section_status: SectionStatus) -> SectionListItem:
    section = section_status.section
    return SectionListItem(
        id=section.id,
        title=section.title,
        slug=section.slug,
        description=section.description,
        proficiency_tier=section.proficiency_tier,
        has_content=len(section.learning_sessions) > 0,
        first_learning_session_id=(
            section.learning_sessions[0].id if section.learning_sessions else None
        ),
        status=section_status.status,
        is_locked=section_status.is_locked,
        unmet_prerequisites=[_prerequisite_summary(p) for p in section_status.unmet_prerequisites],
        dev_prerequisites_bypassed=section_status.dev_bypassed,
    )


@topics_bp.get("/topics")
def list_topics():
    topics = topics_service.list_topics()
    dev_bypass = _dev_bypass_active()

    body = [
        TopicWithSections(
            id=topic.id,
            name=topic.name,
            slug=topic.slug,
            description=topic.description,
            sections=[
                _section_list_item(sections_service.compute_section_status(section, dev_bypass))
                for module in topic.modules
                for section in module.sections
            ],
        )
        for topic in topics
    ]

    return jsonify([t.model_dump() for t in body])
