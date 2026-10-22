"""STAR-method leadership stories and behavioral questions, both tagged
to a competency.

A competency is a `Section` under the "Leadership & Strategy" topic
(modules 76-80) rather than a separate table -- see
docs/decisions/0024-leadership-competency-and-star-stories.md and
docs/decisions/0033-behavioral-question-decision-tree.md.
"""

from __future__ import annotations

from sqlalchemy.orm import joinedload

from app.extensions import db
from app.models import BehavioralQuestion, LeadershipStory, Module, Section, Topic

LEADERSHIP_TOPIC_NAME = "Leadership & Strategy"

_REQUIRED_STORY_FIELDS = ("title", "situation", "task", "action", "result")

# Fixed self-assessment rubric (ADR 0034) -- not author- or
# learner-configurable, same posture as BREAK_MINUTES/PROGRESS_STATUS_RANK
# elsewhere in this codebase: a small, hardcoded set rather than its own
# taxonomy table.
RUBRIC_DIMENSIONS = [
    {
        "key": "clarity",
        "label": "Clarity",
        "description": "Is the Situation/Task easy to follow, without unexplained jargon?",
    },
    {
        "key": "specificity",
        "label": "Specificity of Action",
        "description": "Are the actions concrete things YOU did, not a vague team action?",
    },
    {
        "key": "quantified_result",
        "label": "Quantified Result",
        "description": "Does the Result include a measurable outcome?",
    },
    {
        "key": "relevance",
        "label": "Relevance to Competency",
        "description": "Does this story actually demonstrate the competency it's tagged to?",
    },
    {
        "key": "reflection_growth",
        "label": "Reflection & Growth",
        "description": "Does the Reflection show genuine learning, not just a recap of the Result?",
    },
]
RUBRIC_DIMENSION_KEYS = {dimension["key"] for dimension in RUBRIC_DIMENSIONS}


def compute_overall_score(rubric_scores: dict) -> float | None:
    """None until every dimension has been scored -- a partial average
    would misrepresent a not-yet-assessed story as weaker than it's
    actually been found to be.
    """
    if set(rubric_scores) != RUBRIC_DIMENSION_KEYS:
        return None
    return round(sum(rubric_scores.values()) / len(rubric_scores), 1)


def _validate_rubric_scores(rubric_scores: dict) -> None:
    if not isinstance(rubric_scores, dict):
        raise ValueError("rubric_scores must be an object")
    for key, value in rubric_scores.items():
        if key not in RUBRIC_DIMENSION_KEYS:
            raise ValueError(f"unknown rubric dimension: {key}")
        if not isinstance(value, int) or isinstance(value, bool) or not (1 <= value <= 5):
            raise ValueError(f"{key} score must be an integer from 1 to 5")


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
    if "rubric_scores" in fields:
        _validate_rubric_scores(fields["rubric_scores"])


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
    rubric_scores: dict | None = None,
) -> LeadershipStory:
    fields = {
        "section_id": section_id,
        "title": title,
        "situation": situation,
        "task": task,
        "action": action,
        "result": result,
    }
    if rubric_scores is not None:
        fields["rubric_scores"] = rubric_scores
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
        rubric_scores=rubric_scores or {},
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


def list_questions(competency_id: int | None = None) -> list[BehavioralQuestion]:
    query = BehavioralQuestion.query.options(joinedload(BehavioralQuestion.section))
    if competency_id is not None:
        query = query.filter(BehavioralQuestion.section_id == competency_id)
    return query.order_by(BehavioralQuestion.id).all()


def get_question(question_id: int) -> BehavioralQuestion | None:
    return db.session.get(
        BehavioralQuestion, question_id, options=[joinedload(BehavioralQuestion.section)]
    )


def create_question(*, section_id: int, prompt: str) -> BehavioralQuestion:
    if not str(prompt or "").strip():
        raise ValueError("prompt is required")
    if not _is_valid_competency(section_id):
        raise ValueError("section_id must be one of the Leadership & Strategy competencies")

    question = BehavioralQuestion(section_id=section_id, prompt=prompt, source="custom")
    db.session.add(question)
    db.session.commit()
    return question


def delete_question(question_id: int) -> bool:
    """Returns False if not found. Raises ValueError if the question is
    author-seeded rather than learner-added -- seeded questions aren't
    deletable through the API.
    """
    question = db.session.get(BehavioralQuestion, question_id)
    if question is None:
        return False
    if question.source == "seed":
        raise ValueError("seeded questions cannot be deleted")

    db.session.delete(question)
    db.session.commit()
    return True
