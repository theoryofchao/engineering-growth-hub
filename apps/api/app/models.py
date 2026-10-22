"""Curriculum domain models: topic -> module -> section -> learning session.

Hierarchy and fields follow docs/ARCHITECTURE.md's core modeling candidates.
Naming: `Topic` is the top-level grouping (e.g. "Computer Science
Foundations", "Programming & Code Quality") and `Section` is the area of
learning under a topic that a learner actually browses into (e.g.
"AI-Assisted Software Development") -- see
docs/decisions/0027-topic-section-module-rename-and-routing.md for the
full rationale, including why this reuses names that pre-dated this ADR
for a *different* pair of entities.
"""

from __future__ import annotations

from datetime import UTC, datetime

from app.extensions import db


def _utcnow() -> datetime:
    return datetime.now(UTC)


class Topic(db.Model):
    """A top-level area of the curriculum, e.g. "Computer Science
    Foundations" or "Programming & Code Quality". Shown as a heading on
    the homepage, grouping the `Section`s a learner actually opens.
    """

    __tablename__ = "topics"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False, unique=True)
    slug = db.Column(db.String(200), nullable=False, unique=True)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=_utcnow)

    modules = db.relationship("Module", back_populates="topic", order_by="Module.id")


class Module(db.Model):
    """An internal grouping layer between `Topic` and `Section`, not
    currently surfaced by any route or API response. CURRICULUM.md's own
    80-module breadth map is flat (topic -> a numbered list, with no
    further subgrouping), so the loader creates exactly one `Module` per
    `Topic` for curriculum-map-sourced content today (see
    `seed.load_curriculum_map`); the handful of hand-authored lessons
    predating that map use it for a real, distinct grouping instead (e.g.
    "Browser Fundamentals" under the "Frontend Engineering" topic). Kept
    rather than collapsed so a future finer-grained map can populate it
    for real without another schema change.
    """

    __tablename__ = "modules"

    id = db.Column(db.Integer, primary_key=True)
    topic_id = db.Column(db.Integer, db.ForeignKey("topics.id"), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=_utcnow)

    topic = db.relationship("Topic", back_populates="modules")
    sections = db.relationship("Section", back_populates="module", order_by="Section.id")

    __table_args__ = (db.UniqueConstraint("topic_id", "title", name="uq_module_topic_title"),)


section_prerequisites = db.Table(
    "section_prerequisites",
    db.Column("section_id", db.Integer, db.ForeignKey("sections.id"), primary_key=True),
    db.Column(
        "prerequisite_section_id", db.Integer, db.ForeignKey("sections.id"), primary_key=True
    ),
    db.CheckConstraint(
        "section_id != prerequisite_section_id", name="ck_section_prerequisites_no_self_reference"
    ),
)


class Section(db.Model):
    """A unit of curriculum mastery (CURRICULUM.md's "module" granularity)
    -- the thing a learner actually opens from the homepage, e.g.
    "AI-Assisted Software Development". Confusingly shares a name with
    CURRICULUM.md's own "module" vocabulary and with this schema's
    (differently-scoped) `Module` entity; see the docstrings above and
    docs/decisions/0027-....md.

    `proficiency_tier` lives here, not on `Module`, because CURRICULUM.md
    assigns a target tier (D/W/L/G) per module/section, not per
    topic-level grouping; see docs/decisions/0004-....md.
    """

    __tablename__ = "sections"

    id = db.Column(db.Integer, primary_key=True)
    module_id = db.Column(db.Integer, db.ForeignKey("modules.id"), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(200), nullable=False, unique=True)
    description = db.Column(db.Text, nullable=True)
    proficiency_tier = db.Column(db.String(1), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=_utcnow)

    module = db.relationship("Module", back_populates="sections")
    # Sections this one requires before it's considered unlocked. The
    # `unlocks` backref (sections that become available once this one is
    # done) is unused today but comes free with the self-referential M2M.
    prerequisites = db.relationship(
        "Section",
        secondary=section_prerequisites,
        primaryjoin=id == section_prerequisites.c.section_id,
        secondaryjoin=id == section_prerequisites.c.prerequisite_section_id,
        backref="unlocks",
        order_by="Section.id",
    )
    learning_sessions = db.relationship(
        "LearningSession", back_populates="section", order_by="LearningSession.sequence"
    )
    progress = db.relationship("UserProgress", back_populates="section", uselist=False)

    __table_args__ = (
        db.CheckConstraint("proficiency_tier in ('D', 'W', 'L', 'G')", name="ck_section_tier"),
    )


class LearningSession(db.Model):
    __tablename__ = "learning_sessions"

    id = db.Column(db.Integer, primary_key=True)
    section_id = db.Column(db.Integer, db.ForeignKey("sections.id"), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    duration_minutes = db.Column(db.Integer, nullable=False)
    objective = db.Column(db.Text, nullable=False)
    sequence = db.Column(db.Integer, nullable=False, default=1)
    access_tier = db.Column(db.String(50), nullable=False, default="free")
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=_utcnow)

    section = db.relationship("Section", back_populates="learning_sessions")
    study_sessions = db.relationship("StudySession", back_populates="learning_session")
    exercises = db.relationship(
        "Exercise", back_populates="learning_session", order_by="Exercise.sequence"
    )
    content_blocks = db.relationship(
        "ContentBlock", back_populates="learning_session", order_by="ContentBlock.sequence"
    )

    __table_args__ = (
        db.CheckConstraint("duration_minutes in (25, 50)", name="ck_learning_session_duration"),
    )


class ContentBlock(db.Model):
    """One authored slide/section of a lesson's content.

    Content is explicitly broken into blocks by whoever authors the seed
    JSON (not auto-split from a text blob), so each block has a stable
    identity to attach a note to and to use as a slide in slide view.
    """

    __tablename__ = "content_blocks"

    id = db.Column(db.Integer, primary_key=True)
    learning_session_id = db.Column(
        db.Integer, db.ForeignKey("learning_sessions.id"), nullable=False
    )
    sequence = db.Column(db.Integer, nullable=False)
    heading = db.Column(db.String(200), nullable=False)
    body = db.Column(db.Text, nullable=False)
    # Worked examples shown in a collapsed accordion under the body,
    # e.g. a longer code/config sample that would otherwise bloat the
    # prose. Each item is `{"label": str, "content": str}`.
    examples = db.Column(db.JSON, nullable=False, default=list)
    # External citations/further-reading links, authored alongside the
    # block's content (not learner-generated, unlike Note). Each item is
    # `{"label": str, "url": str}`.
    reference_links = db.Column(db.JSON, nullable=False, default=list)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=_utcnow)

    learning_session = db.relationship("LearningSession", back_populates="content_blocks")
    note = db.relationship("Note", back_populates="content_block", uselist=False)
    completion = db.relationship("BlockCompletion", back_populates="content_block", uselist=False)
    exercises = db.relationship(
        "Exercise", back_populates="content_block", order_by="Exercise.sequence"
    )

    __table_args__ = (
        db.UniqueConstraint(
            "learning_session_id", "sequence", name="uq_content_block_session_sequence"
        ),
    )


class Note(db.Model):
    """A learner's free-form note on one content block. One note per
    block, edited in place (not a log of separate timestamped entries).
    No `user_id` yet — single-user MVP, same as the rest of this schema.
    """

    __tablename__ = "notes"

    id = db.Column(db.Integer, primary_key=True)
    content_block_id = db.Column(
        db.Integer, db.ForeignKey("content_blocks.id"), nullable=False, unique=True
    )
    body = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=_utcnow)
    updated_at = db.Column(db.DateTime(timezone=True), nullable=False, default=_utcnow)

    content_block = db.relationship("ContentBlock", back_populates="note")

    @staticmethod
    def upsert(content_block_id: int, body: str) -> Note:
        note = Note.query.filter_by(content_block_id=content_block_id).first()
        if note is None:
            note = Note(content_block_id=content_block_id, body=body)
            db.session.add(note)
        else:
            note.body = body
            note.updated_at = _utcnow()
        return note


class BlockCompletion(db.Model):
    """Whether a learner has checked a content block off as read/done.

    `completed_at` is nullable rather than a boolean so a reversible
    uncheck is just clearing it back to None. `updated_at` is stamped
    from the client's own clock reading at toggle time (not server
    receipt time) so a batch flush from apps/web's local-first queue
    can resolve last-write-wins across out-of-order or stale retries.
    No `user_id` yet -- single-user MVP, same as the rest of this schema.
    """

    __tablename__ = "block_completions"

    id = db.Column(db.Integer, primary_key=True)
    content_block_id = db.Column(
        db.Integer, db.ForeignKey("content_blocks.id"), nullable=False, unique=True
    )
    completed_at = db.Column(db.DateTime(timezone=True), nullable=True)
    updated_at = db.Column(db.DateTime(timezone=True), nullable=False, default=_utcnow)

    content_block = db.relationship("ContentBlock", back_populates="completion")


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
                last_resumed_at = last_resumed_at.replace(tzinfo=UTC)
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
    """A quiz/exercise attached to a learning session, optionally pinned
    to one content block/slide (`content_block_id`) so it renders right
    after that slide instead of in a lesson-level wrap-up section. Kept
    nullable and additive rather than replacing `learning_session_id`,
    so existing lesson-level exercises don't need to move.

    `definition_json` holds the answer key (e.g. `correct_index`,
    `explanation` for multiple_choice; `hidden_test_cases[].expected_output`
    for code) and must never be sent to the client until after a
    submission is scored — see app/routes/exercises.py. "Never sent"
    means never sent *ungraded*: a code exercise's hidden expected
    outputs are revealed in the submission response after scoring,
    symmetric to `correct_index` being revealed today.
    """

    __tablename__ = "exercises"

    id = db.Column(db.Integer, primary_key=True)
    learning_session_id = db.Column(
        db.Integer, db.ForeignKey("learning_sessions.id"), nullable=False
    )
    content_block_id = db.Column(db.Integer, db.ForeignKey("content_blocks.id"), nullable=True)
    type = db.Column(db.String(50), nullable=False, default="multiple_choice")
    prompt = db.Column(db.Text, nullable=False)
    definition_json = db.Column(db.JSON, nullable=False)
    sequence = db.Column(db.Integer, nullable=False, default=1)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=_utcnow)

    learning_session = db.relationship("LearningSession", back_populates="exercises")
    content_block = db.relationship("ContentBlock", back_populates="exercises")
    submissions = db.relationship(
        "ExerciseSubmission", back_populates="exercise", order_by="ExerciseSubmission.submitted_at"
    )

    __table_args__ = (
        db.CheckConstraint("type in ('multiple_choice', 'code')", name="ck_exercise_type"),
    )


class ExerciseSubmission(db.Model):
    __tablename__ = "exercise_submissions"

    id = db.Column(db.Integer, primary_key=True)
    exercise_id = db.Column(db.Integer, db.ForeignKey("exercises.id"), nullable=False)
    result_json = db.Column(db.JSON, nullable=False)
    score = db.Column(db.Float, nullable=False)
    submitted_at = db.Column(db.DateTime(timezone=True), nullable=False, default=_utcnow)

    exercise = db.relationship("Exercise", back_populates="submissions")


PROGRESS_STATUS_RANK = {"not_started": 0, "learning": 1, "practiced": 2, "mastered": 3}


class UserProgress(db.Model):
    """Per-section mastery status. No `user_id` yet (single-user MVP, no auth)."""

    __tablename__ = "user_progress"

    id = db.Column(db.Integer, primary_key=True)
    section_id = db.Column(db.Integer, db.ForeignKey("sections.id"), nullable=False, unique=True)
    status = db.Column(db.String(20), nullable=False, default="not_started")
    updated_at = db.Column(db.DateTime(timezone=True), nullable=False, default=_utcnow)

    section = db.relationship("Section", back_populates="progress")

    __table_args__ = (
        db.CheckConstraint(
            "status in ('not_started', 'learning', 'practiced', 'mastered')",
            name="ck_user_progress_status",
        ),
    )

    def advance_to(self, status: str) -> None:
        """Move status forward only; never downgrades an already-earned status."""
        if PROGRESS_STATUS_RANK[status] > PROGRESS_STATUS_RANK[self.status]:
            self.status = status
            self.updated_at = _utcnow()

    @staticmethod
    def get_or_create(section_id: int) -> UserProgress:
        progress = UserProgress.query.filter_by(section_id=section_id).first()
        if progress is None:
            progress = UserProgress(section_id=section_id, status="not_started")
            db.session.add(progress)
        return progress


class LeadershipStory(db.Model):
    """A STAR-method behavioral-interview story, tagged to a competency.

    The competency is a `Section` under the "Leadership & Strategy" topic
    (modules 76-80) rather than a separate table -- that topic already
    models exactly this concept as first-class curriculum sections, so
    reusing it avoids a parallel taxonomy. No `user_id` yet (single-user
    MVP, no auth), matching `UserProgress`.
    """

    __tablename__ = "leadership_stories"

    id = db.Column(db.Integer, primary_key=True)
    section_id = db.Column(db.Integer, db.ForeignKey("sections.id"), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    situation = db.Column(db.Text, nullable=False)
    task = db.Column(db.Text, nullable=False)
    action = db.Column(db.Text, nullable=False)
    result = db.Column(db.Text, nullable=False)
    reflection = db.Column(db.Text, nullable=True)
    quantified_outcome = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=_utcnow)
    updated_at = db.Column(
        db.DateTime(timezone=True), nullable=False, default=_utcnow, onupdate=_utcnow
    )

    section = db.relationship("Section", backref="leadership_stories")


class BehavioralQuestion(db.Model):
    """A behavioral-interview question tagged to a competency, used by
    the question -> competency -> story "decision tree" view (ADR 0033).

    `source` distinguishes author-seeded questions (visible to everyone,
    not deletable through the API) from learner-added ones. No `user_id`
    yet (single-user MVP, matching LeadershipStory) -- a learner-added
    question is "private" only in the sense that nothing else reads it
    yet, not via any real access control.
    """

    __tablename__ = "behavioral_questions"

    id = db.Column(db.Integer, primary_key=True)
    section_id = db.Column(db.Integer, db.ForeignKey("sections.id"), nullable=False)
    prompt = db.Column(db.Text, nullable=False)
    source = db.Column(db.String(20), nullable=False, default="custom")
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=_utcnow)

    section = db.relationship("Section", backref="behavioral_questions")

    __table_args__ = (
        db.CheckConstraint("source in ('seed', 'custom')", name="ck_behavioral_question_source"),
    )
