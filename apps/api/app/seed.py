"""Idempotent loader for curriculum content files into the database.

Content lives under content/curriculum/*.json rather than hard-coded in
application code (docs/ARCHITECTURE.md, Milestone 2 will add more files and
a richer pipeline; this is the minimal Milestone 1 version).
"""
from __future__ import annotations

import json
import re
from pathlib import Path

from app.extensions import db
from app.models import ContentBlock, Domain, Exercise, LearningSession, Module, Topic

CONTENT_DIR = Path(__file__).resolve().parents[3] / "content" / "curriculum"
CURRICULUM_MAP_FILENAME = "curriculum-map.json"


def _slugify(text: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return re.sub(r"-{2,}", "-", slug)


def load_curriculum_map(path: Path) -> None:
    """Import the full CURRICULUM.md breadth as topic metadata (title,
    tier, description), with no learning sessions. This is what lets the
    homepage show the whole 80-module map with most of it marked WIP,
    while `load_file` below attaches real lesson content to the handful
    of topics that have it, matched by the same slug.
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


def load_file(path: Path) -> None:
    data = json.loads(path.read_text())

    domain = Domain.query.filter_by(name=data["domain"]["name"]).first()
    if domain is None:
        domain = Domain(**data["domain"])
        db.session.add(domain)
        db.session.flush()

    module = Module.query.filter_by(domain_id=domain.id, title=data["module"]["title"]).first()
    if module is None:
        module = Module(domain_id=domain.id, **data["module"])
        db.session.add(module)
        db.session.flush()

    topic = Topic.query.filter_by(slug=data["topic"]["slug"]).first()
    if topic is None:
        topic = Topic(module_id=module.id, **data["topic"])
        db.session.add(topic)
        db.session.flush()

    for session_data in data["learning_sessions"]:
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

        for block_index, block_data in enumerate(content_blocks_data, start=1):
            existing_block = ContentBlock.query.filter_by(
                learning_session_id=learning_session.id, sequence=block_index
            ).first()
            if existing_block is None:
                db.session.add(
                    ContentBlock(
                        learning_session_id=learning_session.id,
                        sequence=block_index,
                        heading=block_data["heading"],
                        body=block_data["body"],
                    )
                )

        for exercise_data in exercises_data:
            existing = Exercise.query.filter_by(
                learning_session_id=learning_session.id, sequence=exercise_data["sequence"]
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

    db.session.commit()


def seed_all() -> None:
    map_path = CONTENT_DIR / CURRICULUM_MAP_FILENAME
    if map_path.exists():
        load_curriculum_map(map_path)

    for path in sorted(CONTENT_DIR.glob("*.json")):
        if path.name == CURRICULUM_MAP_FILENAME:
            continue
        load_file(path)
