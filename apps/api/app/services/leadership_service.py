"""STAR-method leadership stories, tagged to a competency.

A competency is a `Section` under the "Leadership & Strategy" topic
(modules 76-80) rather than a separate table -- see
docs/decisions/0024-leadership-competency-and-star-stories.md.
"""

from __future__ import annotations

from sqlalchemy.orm import joinedload

from app.extensions import db
from app.models import LeadershipStory, Module, Section, Topic

LEADERSHIP_TOPIC_NAME = "Leadership & Strategy"

_REQUIRED_STORY_FIELDS = ("title", "situation", "task", "action", "result")


def list_competencies() -> list[Section]:
    return (
        Section.query.join(Module)
        .join(Topic)
        .filter(Topic.name == LEADERSHIP_TOPIC_NAME)
        .order_by(Section.id)
        .all()
    )


def _is_valid_competency(section_id: int) -> bool:
    return any(section.id == section_id for section in list_competencies())


def list_stories(competency_id: int | None = None) -> list[LeadershipStory]:
    query = LeadershipStory.query.options(joinedload(LeadershipStory.section))
    if competency_id is not None:
        query = query.filter(LeadershipStory.section_id == competency_id)
    return query.order_by(LeadershipStory.created_at.desc()).all()


def get_story(story_id: int) -> LeadershipStory | None:
    return db.session.get(LeadershipStory, story_id, options=[joinedload(LeadershipStory.section)])


def _validate_fields(fields: dict) -> None:
    for name in _REQUIRED_STORY_FIELDS:
        if name in fields and not str(fields[name]).strip():
            raise ValueError(f"{name} is required")
    if "section_id" in fields and not _is_valid_competency(fields["section_id"]):
        raise ValueError("section_id must be one of the Leadership & Strategy competencies")


def create_story(
    *,
    section_id: int,
    title: str,
    situation: str,
    task: str,
    action: str,
    result: str,
    reflection: str | None = None,
    quantified_outcome: str | None = None,
) -> LeadershipStory:
    fields = {
        "section_id": section_id,
        "title": title,
        "situation": situation,
        "task": task,
        "action": action,
        "result": result,
    }
    _validate_fields(fields)

    story = LeadershipStory(
        section_id=section_id,
        title=title,
        situation=situation,
        task=task,
        action=action,
        result=result,
        reflection=reflection,
        quantified_outcome=quantified_outcome,
    )
    db.session.add(story)
    db.session.commit()
    return story


def update_story(story_id: int, **fields) -> LeadershipStory | None:
    story = db.session.get(LeadershipStory, story_id)
    if story is None:
        return None

    _validate_fields(fields)

    for name, value in fields.items():
        setattr(story, name, value)
    db.session.commit()
    return story


def delete_story(story_id: int) -> bool:
    story = db.session.get(LeadershipStory, story_id)
    if story is None:
        return False

    db.session.delete(story)
    db.session.commit()
    return True
