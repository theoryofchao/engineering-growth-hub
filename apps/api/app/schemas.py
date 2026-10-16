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


class LearningSessionDetail(BaseModel):
    id: int
    title: str
    duration_minutes: int
    objective: str
    content_blocks: list[ContentBlockDetail]
    sequence: int
    access_tier: str
    topic: TopicSummary
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


class TopicListItem(BaseModel):
    id: int
    title: str
    slug: str
    description: str | None
    proficiency_tier: str
    has_content: bool
    first_learning_session_id: int | None = None


class DomainWithTopics(BaseModel):
    id: int
    name: str
    description: str | None
    topics: list[TopicListItem]
