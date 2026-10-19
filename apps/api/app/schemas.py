"""Pydantic response contracts for the API."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class TopicSummary(BaseModel):
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


class ContentBlockDetail(BaseModel):
    id: int
    sequence: int
    heading: str
    body: str
    note: NoteDetail | None = None
    exercises: list[ExerciseSummary] = []


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
    topic: TopicSummary
    # Every learning session in this topic (including this one), ordered
    # by sequence — lets the frontend render "other lessons in this
    # topic" navigation instead of a dead end after lesson 1.
    topic_sessions: list[LearningSessionSummary]
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


class TopicProgressSummary(BaseModel):
    topic_id: int
    title: str
    slug: str
    status: str
    exercises_attempted: int
    exercises_correct: int


class DashboardSummary(BaseModel):
    total_study_seconds: int
    topics: list[TopicProgressSummary]


class PrerequisiteSummary(BaseModel):
    """A prerequisite topic's own id/title/slug/status, so the UI can
    explain and link to what's blocking a locked topic.
    """

    id: int
    title: str
    slug: str
    status: str


class TopicListItem(BaseModel):
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
    # True only when a local dev backdoor (DEV_UNLOCK_ALL_TOPICS) is forcing
    # is_locked=False despite unmet prerequisites. See routes/topics.py.
    dev_prerequisites_bypassed: bool = False


class TopicDetail(BaseModel):
    id: int
    title: str
    slug: str
    description: str | None
    proficiency_tier: str
    status: str
    is_locked: bool
    learning_sessions: list[LearningSessionSummary]
    prerequisites: list[PrerequisiteSummary]
    unmet_prerequisites: list[PrerequisiteSummary]
    dev_prerequisites_bypassed: bool = False


class DomainWithTopics(BaseModel):
    id: int
    name: str
    description: str | None
    topics: list[TopicListItem]
