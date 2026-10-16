"""Curriculum domain models: domain -> module -> topic -> learning session.

Hierarchy and fields follow docs/ARCHITECTURE.md's core modeling candidates.
"""
from __future__ import annotations

from datetime import datetime, timezone

from app.extensions import db


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Domain(db.Model):
    __tablename__ = "domains"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False, unique=True)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=_utcnow)

    modules = db.relationship("Module", back_populates="domain", order_by="Module.id")


class Module(db.Model):
    __tablename__ = "modules"

    id = db.Column(db.Integer, primary_key=True)
    domain_id = db.Column(db.Integer, db.ForeignKey("domains.id"), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=_utcnow)

    domain = db.relationship("Domain", back_populates="modules")
    topics = db.relationship("Topic", back_populates="module", order_by="Topic.id")

    __table_args__ = (db.UniqueConstraint("domain_id", "title", name="uq_module_domain_title"),)


class Topic(db.Model):
    """A unit of curriculum mastery (CURRICULUM.md's "module" granularity).

    `proficiency_tier` lives here, not on `Module`, because CURRICULUM.md
    assigns a target tier (D/W/L/G) per module/topic, not per domain-level
    grouping; see docs/decisions/0004-....md.
    """

    __tablename__ = "topics"

    id = db.Column(db.Integer, primary_key=True)
    module_id = db.Column(db.Integer, db.ForeignKey("modules.id"), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(200), nullable=False, unique=True)
    description = db.Column(db.Text, nullable=True)
    proficiency_tier = db.Column(db.String(1), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=_utcnow)

    module = db.relationship("Module", back_populates="topics")
    learning_sessions = db.relationship(
        "LearningSession", back_populates="topic", order_by="LearningSession.sequence"
    )
    progress = db.relationship("UserProgress", back_populates="topic", uselist=False)

    __table_args__ = (
        db.CheckConstraint("proficiency_tier in ('D', 'W', 'L', 'G')", name="ck_topic_tier"),
    )


class LearningSession(db.Model):
    __tablename__ = "learning_sessions"

    id = db.Column(db.Integer, primary_key=True)
    topic_id = db.Column(db.Integer, db.ForeignKey("topics.id"), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    duration_minutes = db.Column(db.Integer, nullable=False)
    objective = db.Column(db.Text, nullable=False)
    content = db.Column(db.Text, nullable=False)
    sequence = db.Column(db.Integer, nullable=False, default=1)
    access_tier = db.Column(db.String(50), nullable=False, default="free")
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=_utcnow)

    topic = db.relationship("Topic", back_populates="learning_sessions")
    study_sessions = db.relationship("StudySession", back_populates="learning_session")
    exercises = db.relationship(
        "Exercise", back_populates="learning_session", order_by="Exercise.sequence"
    )

    __table_args__ = (
        db.CheckConstraint("duration_minutes in (25, 50)", name="ck_learning_session_duration"),
    )


class StudySession(db.Model):
    """A single Pomodoro timer run against a learning session.

    Elapsed time is tracked server-side so a page reload never loses
    progress: `elapsed_seconds` accumulates only while paused/completed,
    and `last_resumed_at` marks the start of the current active run, so
    live elapsed = elapsed_seconds + (now - last_resumed_at) while active.
    """

    __tablename__ = "study_sessions"

    id = db.Column(db.Integer, primary_key=True)
    learning_session_id = db.Column(
        db.Integer, db.ForeignKey("learning_sessions.id"), nullable=False
    )
    mode_minutes = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), nullable=False, default="active")
    elapsed_seconds = db.Column(db.Integer, nullable=False, default=0)
    started_at = db.Column(db.DateTime(timezone=True), nullable=False, default=_utcnow)
    last_resumed_at = db.Column(db.DateTime(timezone=True), nullable=True, default=_utcnow)
    completed_at = db.Column(db.DateTime(timezone=True), nullable=True)

    learning_session = db.relationship("LearningSession", back_populates="study_sessions")

    __table_args__ = (
        db.CheckConstraint("mode_minutes in (25, 50)", name="ck_study_session_mode"),
        db.CheckConstraint(
            "status in ('active', 'paused', 'completed')", name="ck_study_session_status"
        ),
    )

    def live_elapsed_seconds(self) -> int:
        if self.status == "active" and self.last_resumed_at is not None:
            last_resumed_at = self.last_resumed_at
            if last_resumed_at.tzinfo is None:
                # SQLite (used in tests) drops tzinfo on read-back even for
                # DateTime(timezone=True) columns; Postgres does not.
                last_resumed_at = last_resumed_at.replace(tzinfo=timezone.utc)
            running = (_utcnow() - last_resumed_at).total_seconds()
            return self.elapsed_seconds + max(0, int(running))
        return self.elapsed_seconds

    def pause(self) -> None:
        if self.status != "active":
            return
        self.elapsed_seconds = self.live_elapsed_seconds()
        self.last_resumed_at = None
        self.status = "paused"

    def resume(self) -> None:
        if self.status != "paused":
            return
        self.last_resumed_at = _utcnow()
        self.status = "active"

    def complete(self) -> None:
        if self.status == "completed":
            return
        self.elapsed_seconds = self.live_elapsed_seconds()
        self.last_resumed_at = None
        self.status = "completed"
        self.completed_at = _utcnow()


class Exercise(db.Model):
    """A quiz/exercise attached to a learning session.

    `definition_json` holds the answer key (e.g. `correct_index`,
    `explanation` for multiple_choice) and must never be sent to the
    client until after a submission is scored — see
    app/routes/exercises.py.
    """

    __tablename__ = "exercises"

    id = db.Column(db.Integer, primary_key=True)
    learning_session_id = db.Column(
        db.Integer, db.ForeignKey("learning_sessions.id"), nullable=False
    )
    type = db.Column(db.String(50), nullable=False, default="multiple_choice")
    prompt = db.Column(db.Text, nullable=False)
    definition_json = db.Column(db.JSON, nullable=False)
    sequence = db.Column(db.Integer, nullable=False, default=1)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=_utcnow)

    learning_session = db.relationship("LearningSession", back_populates="exercises")
    submissions = db.relationship(
        "ExerciseSubmission", back_populates="exercise", order_by="ExerciseSubmission.submitted_at"
    )

    __table_args__ = (
        db.CheckConstraint("type in ('multiple_choice')", name="ck_exercise_type"),
    )


class ExerciseSubmission(db.Model):
    __tablename__ = "exercise_submissions"

    id = db.Column(db.Integer, primary_key=True)
    exercise_id = db.Column(db.Integer, db.ForeignKey("exercises.id"), nullable=False)
    result_json = db.Column(db.JSON, nullable=False)
    score = db.Column(db.Float, nullable=False)
    submitted_at = db.Column(db.DateTime(timezone=True), nullable=False, default=_utcnow)

    exercise = db.relationship("Exercise", back_populates="submissions")


_PROGRESS_STATUS_RANK = {"not_started": 0, "learning": 1, "practiced": 2, "mastered": 3}


class UserProgress(db.Model):
    """Per-topic mastery status. No `user_id` yet (single-user MVP, no auth)."""

    __tablename__ = "user_progress"

    id = db.Column(db.Integer, primary_key=True)
    topic_id = db.Column(db.Integer, db.ForeignKey("topics.id"), nullable=False, unique=True)
    status = db.Column(db.String(20), nullable=False, default="not_started")
    updated_at = db.Column(db.DateTime(timezone=True), nullable=False, default=_utcnow)

    topic = db.relationship("Topic", back_populates="progress")

    __table_args__ = (
        db.CheckConstraint(
            "status in ('not_started', 'learning', 'practiced', 'mastered')",
            name="ck_user_progress_status",
        ),
    )

    def advance_to(self, status: str) -> None:
        """Move status forward only; never downgrades an already-earned status."""
        if _PROGRESS_STATUS_RANK[status] > _PROGRESS_STATUS_RANK[self.status]:
            self.status = status
            self.updated_at = _utcnow()

    @staticmethod
    def get_or_create(topic_id: int) -> "UserProgress":
        progress = UserProgress.query.filter_by(topic_id=topic_id).first()
        if progress is None:
            progress = UserProgress(topic_id=topic_id, status="not_started")
            db.session.add(progress)
        return progress
