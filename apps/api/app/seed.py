"""Idempotent loader for curriculum content files into the database.

Content lives under content/curriculum/<topic-slug>/ rather than
hard-coded in application code (docs/ARCHITECTURE.md). Each topic
directory holds a `topic.json` (domain/module/topic metadata) plus one
JSON file per learning session, so a topic's content doesn't grow into
a single unbounded file as it gains sessions -- see
content/curriculum/README.md for the file layout and sizing rule.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

from app.extensions import db
from app.models import ContentBlock, Domain, Exercise, LearningSession, Module, Topic

CONTENT_DIR = Path(__file__).resolve().parents[3] / "content" / "curriculum"
CURRICULUM_MAP_FILENAME = "curriculum-map.json"
TOPIC_METADATA_FILENAME = "topic.json"


def _slugify(text: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return re.sub(r"-{2,}", "-", slug)


def load_curriculum_map(path: Path) -> None:
    """Import the full CURRICULUM.md breadth as topic metadata (title,
    tier, description), with no learning sessions. This is what lets the
    homepage show the whole 80-module map with most of it marked WIP,
    while `load_topic_dir` below attaches real lesson content to the
    handful of topics that have it, matched by the same slug.
    """
    data = json.loads(path.read_text())

    for domain_data in data["domains"]:
        domain = Domain.query.filter_by(name=domain_data["name"]).first()
        if domain is None:
            domain = Domain(name=domain_data["name"], description=domain_data["description"])
            db.session.add(domain)
            db.session.flush()

        module = Module.query.filter_by(domain_id=domain.id, title=domain_data["name"]).first()
        if module is None:
            module = Module(domain_id=domain.id, title=domain_data["name"])
            db.session.add(module)
            db.session.flush()

        for module_data in domain_data["modules"]:
            slug = f"{module_data['id']:02d}-{_slugify(module_data['title'])}"
            topic = Topic.query.filter_by(slug=slug).first()
            if topic is None:
                db.session.add(
                    Topic(
                        module_id=module.id,
                        title=module_data["title"],
                        slug=slug,
                        description=module_data["description"],
                        proficiency_tier=module_data["tier"],
                    )
                )

    db.session.commit()


def _load_session(topic: Topic, session_data: dict) -> None:
    """Upsert one learning session -- plus its content blocks and
    exercises -- under `topic`. Shared by `load_topic_dir` regardless of
    which session file a given session came from.
    """
    session_data = dict(session_data)
    exercises_data = session_data.pop("exercises", [])
    content_blocks_data = session_data.pop("content_blocks", [])

    learning_session = LearningSession.query.filter_by(
        topic_id=topic.id, sequence=session_data["sequence"]
    ).first()
    if learning_session is None:
        learning_session = LearningSession(topic_id=topic.id, **session_data)
        db.session.add(learning_session)
        db.session.flush()
    else:
        # Upsert, not insert-only: a content edit in the source file
        # must actually reach the database on reseed, or editing
        # this JSON silently does nothing once a row already exists.
        for key, value in session_data.items():
            setattr(learning_session, key, value)

    for block_index, block_data in enumerate(content_blocks_data, start=1):
        block_data = dict(block_data)
        block_exercises_data = block_data.pop("exercises", [])

        block = ContentBlock.query.filter_by(
            learning_session_id=learning_session.id, sequence=block_index
        ).first()
        if block is None:
            block = ContentBlock(
                learning_session_id=learning_session.id,
                sequence=block_index,
                heading=block_data["heading"],
                body=block_data["body"],
            )
            db.session.add(block)
            db.session.flush()
        else:
            block.heading = block_data["heading"]
            block.body = block_data["body"]

        for exercise_index, exercise_data in enumerate(block_exercises_data, start=1):
            existing = Exercise.query.filter_by(content_block_id=block.id, sequence=exercise_index).first()
            if existing is None:
                db.session.add(
                    Exercise(
                        learning_session_id=learning_session.id,
                        content_block_id=block.id,
                        type=exercise_data["type"],
                        sequence=exercise_index,
                        prompt=exercise_data["prompt"],
                        definition_json=exercise_data["definition"],
                    )
                )
            else:
                existing.type = exercise_data["type"]
                existing.prompt = exercise_data["prompt"]
                existing.definition_json = exercise_data["definition"]

    # Lesson-level (not pinned to a slide) exercises — kept for the
    # 2 pre-existing lessons seeded before per-block exercises existed.
    for exercise_data in exercises_data:
        existing = Exercise.query.filter_by(
            learning_session_id=learning_session.id,
            content_block_id=None,
            sequence=exercise_data["sequence"],
        ).first()
        if existing is None:
            db.session.add(
                Exercise(
                    learning_session_id=learning_session.id,
                    type=exercise_data["type"],
                    sequence=exercise_data["sequence"],
                    prompt=exercise_data["prompt"],
                    definition_json=exercise_data["definition"],
                )
            )
        else:
            existing.type = exercise_data["type"]
            existing.prompt = exercise_data["prompt"]
            existing.definition_json = exercise_data["definition"]


def load_topic_dir(dir_path: Path) -> None:
    """Load one topic's content: `topic.json` (domain/module/topic
    metadata) plus every other `*.json` file in the directory, each
    holding exactly one learning session. Session files are read in
    sorted-filename order, but the `sequence` field inside each file is
    what actually controls display/DB order -- numbering filenames like
    `01-...json` is for human navigation only, not relied on by code.
    """
    topic_data = json.loads((dir_path / TOPIC_METADATA_FILENAME).read_text())

    domain = Domain.query.filter_by(name=topic_data["domain"]["name"]).first()
    if domain is None:
        domain = Domain(**topic_data["domain"])
        db.session.add(domain)
        db.session.flush()

    module = Module.query.filter_by(domain_id=domain.id, title=topic_data["module"]["title"]).first()
    if module is None:
        module = Module(domain_id=domain.id, **topic_data["module"])
        db.session.add(module)
        db.session.flush()

    topic = Topic.query.filter_by(slug=topic_data["topic"]["slug"]).first()
    if topic is None:
        topic = Topic(module_id=module.id, **topic_data["topic"])
        db.session.add(topic)
        db.session.flush()

    session_paths = sorted(p for p in dir_path.glob("*.json") if p.name != TOPIC_METADATA_FILENAME)
    for session_path in session_paths:
        _load_session(topic, json.loads(session_path.read_text()))

    db.session.commit()


def seed_all() -> None:
    map_path = CONTENT_DIR / CURRICULUM_MAP_FILENAME
    if map_path.exists():
        load_curriculum_map(map_path)

    for path in sorted(CONTENT_DIR.iterdir()):
        if path.is_dir():
            load_topic_dir(path)
