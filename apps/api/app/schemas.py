"""Pydantic response contracts for the API."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class TopicRef(BaseModel):
    """Minimal parent-topic reference, just enough to build a `/learn/<topic
    slug>/<section slug>` link to a section that isn't necessarily the one
    the current page is already on (e.g. a prerequisite in another topic).
    """

    model_config = ConfigDict(from_attributes=True)

    name: str
    slug: str


class SectionSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    slug: str


class ExerciseSummary(BaseModel):
    """Client-safe exercise view. Never include the answer key here."""

    id: int
    type: str
    prompt: str
    options: list[str]


class NoteDetail(BaseModel):
    body: str
    updated_at: datetime


class ContentExample(BaseModel):
    label: str
    content: str


class ContentBlockDetail(BaseModel):
    id: int
    sequence: int
    heading: str
    body: str
    note: NoteDetail | None = None
    exercises: list[ExerciseSummary] = []
    examples: list[ContentExample] = []


class LearningSessionSummary(BaseModel):
    """One entry in a topic's lesson list, for in-topic navigation."""

    id: int
    title: str
    sequence: int
    duration_minutes: int


class LearningSessionDetail(BaseModel):
    id: int
    title: str
    duration_minutes: int
    objective: str
    content_blocks: list[ContentBlockDetail]
    sequence: int
    access_tier: str
    section: SectionSummary
    # Every learning session in this section (including this one), ordered
    # by sequence — lets the frontend render "other lessons in this
    # section" navigation instead of a dead end after lesson 1.
    section_sessions: list[LearningSessionSummary]
    # Lesson-level exercises not pinned to any specific slide (shown in a
    # wrap-up section). Most exercises should be block-scoped instead —
    # see ContentBlockDetail.exercises.
    exercises: list[ExerciseSummary]


class StudySessionDetail(BaseModel):
    id: int
    learning_session_id: int
    mode_minutes: int
    break_minutes: int
    status: str
    elapsed_seconds: int
    completed_at: datetime | None = None


class ExerciseSubmissionResult(BaseModel):
    exercise_id: int
    is_correct: bool
    score: float
    correct_index: int
    explanation: str


class SectionProgressSummary(BaseModel):
    section_id: int
    title: str
    slug: str
    status: str
    exercises_attempted: int
    exercises_correct: int


class DashboardSummary(BaseModel):
    total_study_seconds: int
    sections: list[SectionProgressSummary]


class PrerequisiteSummary(BaseModel):
    """A prerequisite section's own id/title/slug/status plus its parent
    topic, so the UI can explain and link to what's blocking a locked
    section -- a prerequisite can live under a different topic than the
    section it's blocking, so the link needs that topic's slug too.
    """

    id: int
    title: str
    slug: str
    topic: TopicRef
    status: str


class SectionListItem(BaseModel):
    id: int
    title: str
    slug: str
    description: str | None
    proficiency_tier: str
    has_content: bool
    first_learning_session_id: int | None = None
    status: str
    is_locked: bool
    unmet_prerequisites: list[PrerequisiteSummary] = []
    # True only when a local dev backdoor (DEV_UNLOCK_ALL_SECTIONS) is forcing
    # is_locked=False despite unmet prerequisites. See routes/sections.py.
    dev_prerequisites_bypassed: bool = False


class SectionDetail(BaseModel):
    id: int
    title: str
    slug: str
    topic: TopicRef
    description: str | None
    proficiency_tier: str
    status: str
    is_locked: bool
    learning_sessions: list[LearningSessionSummary]
    prerequisites: list[PrerequisiteSummary]
    unmet_prerequisites: list[PrerequisiteSummary]
    dev_prerequisites_bypassed: bool = False


class TopicWithSections(BaseModel):
    id: int
    name: str
    slug: str
    description: str | None
    sections: list[SectionListItem]


class CompetencySummary(BaseModel):
    id: int
    title: str
    slug: str
    description: str | None


class LeadershipStorySummary(BaseModel):
    """One entry in a story list -- `result` gives a one-line preview
    without shipping the full STAR text for every row.
    """

    id: int
    title: str
    competency: CompetencySummary
    result: str
    created_at: datetime
    updated_at: datetime


class LeadershipStoryDetail(BaseModel):
    id: int
    title: str
    competency: CompetencySummary
    situation: str
    task: str
    action: str
    result: str
    reflection: str | None
    quantified_outcome: str | None
    created_at: datetime
    updated_at: datetime
