"""Section detail and prerequisite-lock computation.

See ADR 0019 for why this eager-loads in a fixed number of queries
instead of letting a fan-out of lazy loads scale with the data.
"""

from __future__ import annotations

from dataclasses import dataclass, field

from sqlalchemy.orm import selectinload

from app.models import PROGRESS_STATUS_RANK, Module, Section


@dataclass
class PrerequisiteStatus:
    section: Section
    status: str


@dataclass
class SectionStatus:
    section: Section
    status: str
    is_locked: bool
    dev_bypassed: bool
    prerequisites: list[PrerequisiteStatus] = field(default_factory=list)
    unmet_prerequisites: list[PrerequisiteStatus] = field(default_factory=list)


def _section_status(section: Section) -> str:
    return section.progress.status if section.progress else "not_started"


def _is_prerequisite_met(status: str) -> bool:
    return PROGRESS_STATUS_RANK[status] >= PROGRESS_STATUS_RANK["practiced"]


def compute_section_status(section: Section, dev_bypass: bool) -> SectionStatus:
    prerequisites = [
        PrerequisiteStatus(section=prereq, status=_section_status(prereq))
        for prereq in section.prerequisites
    ]
    unmet = [p for p in prerequisites if not _is_prerequisite_met(p.status)]
    return SectionStatus(
        section=section,
        status=_section_status(section),
        is_locked=not dev_bypass and len(unmet) > 0,
        dev_bypassed=dev_bypass and len(unmet) > 0,
        prerequisites=prerequisites,
        unmet_prerequisites=unmet,
    )


def get_section_detail(section_slug: str, dev_bypass: bool) -> SectionStatus | None:
    section = (
        Section.query.filter_by(slug=section_slug)
        .options(
            selectinload(Section.module).selectinload(Module.topic),
            selectinload(Section.prerequisites).options(
                selectinload(Section.progress),
                selectinload(Section.module).selectinload(Module.topic),
            ),
            selectinload(Section.learning_sessions),
            selectinload(Section.progress),
        )
        .first()
    )
    if section is None:
        return None
    return compute_section_status(section, dev_bypass)
