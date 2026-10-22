"""Idempotent loader for curriculum content files into the database.

Content lives under content/curriculum/<section-slug>/ rather than
hard-coded in application code (docs/ARCHITECTURE.md). Each section
directory holds a `section.json` (topic/module/section metadata) plus
one JSON file per learning session, so a section's content doesn't grow
into a single unbounded file as it gains sessions -- see
content/curriculum/README.md for the file layout and sizing rule.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

from app.extensions import db
from app.models import ContentBlock, Exercise, LearningSession, Module, Section, Topic

CONTENT_DIR = Path(__file__).resolve().parents[3] / "content" / "curriculum"
CURRICULUM_MAP_FILENAME = "curriculum-map.json"
SECTION_METADATA_FILENAME = "section.json"


def _slugify(text: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return re.sub(r"-{2,}", "-", slug)


def _validate_no_prerequisite_cycles(prereqs_by_module_id: dict[int, list[int]]) -> None:
    """DFS cycle check over the plain {module_id: [prerequisite_ids]}
    data straight from curriculum-map.json, before any DB writes --
    CURRICULUM.md's own backlog calls for validating this as a DAG, and
    it never has been. 80 nodes/~200 edges: a library is unwarranted.

    Note: "module_id" here is CURRICULUM.md's own numbering (1-80),
    which this schema stores as `Section.id`/`Section.slug`, not
    `Module` -- see models.py.
    """
    state: dict[int, str] = {}

    def visit(module_id: int, path: list[int]) -> None:
        if state.get(module_id) == "done":
            return
        if state.get(module_id) == "visiting":
            cycle = path[path.index(module_id) :] + [module_id]
            raise ValueError(f"Prerequisite cycle detected: {' -> '.join(map(str, cycle))}")
        if module_id not in prereqs_by_module_id:
            raise ValueError(f"Unknown prerequisite module id: {module_id}")

        state[module_id] = "visiting"
        for prereq_id in prereqs_by_module_id[module_id]:
            visit(prereq_id, path + [module_id])
        state[module_id] = "done"

    for module_id in prereqs_by_module_id:
        visit(module_id, [])


def load_curriculum_map(path: Path) -> None:
    """Import the full CURRICULUM.md breadth as section metadata (title,
    tier, description, prerequisites), with no learning sessions. This
    is what lets the homepage show the whole 80-module map with most of
    it marked WIP, while `load_section_dir` below attaches real lesson
    content to the handful of sections that have it, matched by the same
    slug.
    """
    data = json.loads(path.read_text())

    prereqs_by_module_id = {
        module_data["id"]: module_data.get("prerequisites", [])
        for topic_data in data["domains"]
        for module_data in topic_data["modules"]
    }
    _validate_no_prerequisite_cycles(prereqs_by_module_id)

    sections_by_module_id: dict[int, Section] = {}

    for topic_data in data["domains"]:
        topic = Topic.query.filter_by(name=topic_data["name"]).first()
        if topic is None:
            topic = Topic(
                name=topic_data["name"],
                slug=_slugify(topic_data["name"]),
                description=topic_data["description"],
            )
            db.session.add(topic)
            db.session.flush()

        # CURRICULUM.md's own map is flat (a topic -> a numbered list of
        # modules, no further subgrouping), so every curriculum-map-only
        # topic gets exactly one placeholder Module -- see Module's
        # docstring in models.py.
        module = Module.query.filter_by(topic_id=topic.id, title=topic_data["name"]).first()
        if module is None:
            module = Module(topic_id=topic.id, title=topic_data["name"])
            db.session.add(module)
            db.session.flush()

        for module_data in topic_data["modules"]:
            slug = f"{module_data['id']:02d}-{_slugify(module_data['title'])}"
            section = Section.query.filter_by(slug=slug).first()
            if section is None:
                section = Section(
                    module_id=module.id,
                    title=module_data["title"],
                    slug=slug,
                    description=module_data["description"],
                    proficiency_tier=module_data["tier"],
                )
                db.session.add(section)
                db.session.flush()
            sections_by_module_id[module_data["id"]] = section

    # Second pass: prerequisites are linked only once every section in the
    # map exists, since a module can depend on one that appears later in
    # iteration order (e.g. module 1 depends on module 8). Reassigning
    # the full list is naturally idempotent -- SQLAlchemy's collection
    # diffing only emits INSERT/DELETE for actual differences.
    for module_id, section in sections_by_module_id.items():
        section.prerequisites = [
            sections_by_module_id[prereq_id] for prereq_id in prereqs_by_module_id[module_id]
        ]

    db.session.commit()


_CODE_EXERCISE_REQUIRED_KEYS = (
    "function_name",
    "starter_code",
    "visible_test_cases",
    "hidden_test_cases",
)


def _validate_exercise_definition(exercise_data: dict) -> None:
    """Fail loudly at seed time rather than at first page load: a
    malformed `code` exercise would otherwise surface as a KeyError deep
    in `_exercise_summary` (app/routes/learning_sessions.py) the next
    time a learner opens that lesson.
    """
    if exercise_data["type"] != "code":
        return
    definition = exercise_data["definition"]
    missing = [key for key in _CODE_EXERCISE_REQUIRED_KEYS if key not in definition]
    if missing:
        raise ValueError(
            f"code exercise {exercise_data['prompt'][:60]!r} is missing definition keys: {missing}"
        )


def _load_session(section: Section, session_data: dict) -> None:
    """Upsert one learning session -- plus its content blocks and
    exercises -- under `section`. Shared by `load_section_dir` regardless
    of which session file a given session came from.
    """
    session_data = dict(session_data)
    exercises_data = session_data.pop("exercises", [])
    content_blocks_data = session_data.pop("content_blocks", [])

    learning_session = LearningSession.query.filter_by(
        section_id=section.id, sequence=session_data["sequence"]
    ).first()
    if learning_session is None:
        learning_session = LearningSession(section_id=section.id, **session_data)
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
                examples=block_data.get("examples", []),
                reference_links=block_data.get("reference_links", []),
            )
            db.session.add(block)
            db.session.flush()
        else:
            block.heading = block_data["heading"]
            block.body = block_data["body"]
            block.examples = block_data.get("examples", [])
            block.reference_links = block_data.get("reference_links", [])

        for exercise_index, exercise_data in enumerate(block_exercises_data, start=1):
            _validate_exercise_definition(exercise_data)
            existing = Exercise.query.filter_by(
                content_block_id=block.id, sequence=exercise_index
            ).first()
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
        _validate_exercise_definition(exercise_data)
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


def load_section_dir(dir_path: Path) -> None:
    """Load one section's content: `section.json` (topic/module/section
    metadata) plus every other `*.json` file in the directory, each
    holding exactly one learning session. Session files are read in
    sorted-filename order, but the `sequence` field inside each file is
    what actually controls display/DB order -- numbering filenames like
    `01-...json` is for human navigation only, not relied on by code.
    """
    section_data = json.loads((dir_path / SECTION_METADATA_FILENAME).read_text())

    topic = Topic.query.filter_by(name=section_data["topic"]["name"]).first()
    if topic is None:
        topic = Topic(**section_data["topic"])
        db.session.add(topic)
        db.session.flush()

    module = Module.query.filter_by(
        topic_id=topic.id, title=section_data["module"]["title"]
    ).first()
    if module is None:
        module = Module(topic_id=topic.id, **section_data["module"])
        db.session.add(module)
        db.session.flush()

    section = Section.query.filter_by(slug=section_data["section"]["slug"]).first()
    if section is None:
        section = Section(module_id=module.id, **section_data["section"])
        db.session.add(section)
        db.session.flush()

    session_paths = sorted(
        p for p in dir_path.glob("*.json") if p.name != SECTION_METADATA_FILENAME
    )
    for session_path in session_paths:
        _load_session(section, json.loads(session_path.read_text()))

    db.session.commit()


def seed_all() -> None:
    map_path = CONTENT_DIR / CURRICULUM_MAP_FILENAME
    if map_path.exists():
        load_curriculum_map(map_path)

    for path in sorted(CONTENT_DIR.iterdir()):
        if path.is_dir():
            load_section_dir(path)
