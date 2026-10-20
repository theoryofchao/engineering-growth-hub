"""The full curriculum breadth for the homepage: every topic, with every
section under it (per CURRICULUM.md), eager-loaded down through each
section's sessions, progress, and prerequisites (each prerequisite's own
progress too) in a fixed number of queries -- see ADR 0019.
"""

from __future__ import annotations

from sqlalchemy.orm import selectinload

from app.models import Module, Section, Topic


def list_topics() -> list[Topic]:
    return (
        Topic.query.options(
            selectinload(Topic.modules)
            .selectinload(Module.sections)
            .options(
                selectinload(Section.learning_sessions),
                selectinload(Section.progress),
                selectinload(Section.prerequisites).options(
                    selectinload(Section.progress),
                    selectinload(Section.module).selectinload(Module.topic),
                ),
            )
        )
        .order_by(Topic.id)
        .all()
    )
