"""Single-section detail (lessons, lock status, prerequisites) for the
section-overview page. Looked up by slug, not id -- the slug is already
a globally unique, human-readable identifier, so the page's URL
(`/learn/<topic-slug>/<section-slug>`) doesn't need a numeric id at all.
"""

from __future__ import annotations

from flask import Blueprint, abort, current_app, jsonify

from app.schemas import LearningSessionSummary, PrerequisiteSummary, SectionDetail, TopicRef
from app.services import sections_service

sections_bp = Blueprint("sections", __name__, url_prefix="/api/v1")


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


@sections_bp.get("/sections/<string:section_slug>")
def get_section(section_slug: str):
    section_status = sections_service.get_section_detail(section_slug, _dev_bypass_active())
    if section_status is None:
        abort(404, description="Section not found")

    section = section_status.section
    body = SectionDetail(
        id=section.id,
        title=section.title,
        slug=section.slug,
        topic=TopicRef(name=section.module.topic.name, slug=section.module.topic.slug),
        description=section.description,
        proficiency_tier=section.proficiency_tier,
        status=section_status.status,
        is_locked=section_status.is_locked,
        learning_sessions=[
            LearningSessionSummary(
                id=session.id,
                title=session.title,
                sequence=session.sequence,
                duration_minutes=session.duration_minutes,
            )
            for session in section.learning_sessions
        ],
        prerequisites=[_prerequisite_summary(p) for p in section_status.prerequisites],
        unmet_prerequisites=[_prerequisite_summary(p) for p in section_status.unmet_prerequisites],
        dev_prerequisites_bypassed=section_status.dev_bypassed,
    )

    return jsonify(body.model_dump())
