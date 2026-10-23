import pytest

from app.extensions import db
from app.models import BehavioralQuestion, ContentBlock, Exercise, LearningSession, Section, Topic
from app.seed import _validate_exercise_definition, _validate_no_prerequisite_cycles, seed_all


def test_seed_all_creates_frontend_engineering_content(app):
    with app.app_context():
        seed_all()

        topic = Topic.query.filter_by(name="Frontend Engineering").first()
        assert topic is not None

        section = Section.query.filter_by(slug="browser-rendering").first()
        assert section is not None
        assert section.module.topic_id == topic.id
        assert section.proficiency_tier == "D"

        session = LearningSession.query.filter_by(section_id=section.id, sequence=1).first()
        assert session is not None
        assert session.title == "Critical Rendering Path"
        assert session.duration_minutes == 25

        blocks = (
            ContentBlock.query.filter_by(learning_session_id=session.id)
            .order_by(ContentBlock.sequence)
            .all()
        )
        assert len(blocks) == 3
        assert blocks[0].heading == "Overview"

        exercise = Exercise.query.filter_by(learning_session_id=session.id).first()
        assert exercise is not None
        assert exercise.definition_json["correct_index"] == 1


def test_seed_all_imports_full_curriculum_map(app):
    with app.app_context():
        seed_all()

        # 16 from the map, plus "Frontend Engineering" which is extra/legacy
        # (predates the map; CURRICULUM.md's equivalent topic is "Web & Frontend").
        assert Topic.query.count() == 17
        assert Section.query.count() == 81

        wip_section = Section.query.filter_by(slug="03-computer-architecture").first()
        assert wip_section is not None
        assert wip_section.proficiency_tier == "W"
        assert wip_section.learning_sessions == []  # no lesson authored yet -> WIP

        ai_section = Section.query.filter_by(slug="70-ai-assisted-software-development").first()
        assert ai_section is not None
        assert len(ai_section.learning_sessions) == 12

        # Sessions 3/4 pin their exercises to specific slides, not the session.
        setups_session = next(s for s in ai_section.learning_sessions if s.sequence == 3)
        block_exercises = [e for b in setups_session.content_blocks for e in b.exercises]
        assert len(block_exercises) == 7
        assert all(e.content_block_id is not None for e in block_exercises)


def test_seed_all_updates_existing_rows_not_just_inserts_missing_ones(app):
    """Regression test: a prior version of this loader only ever inserted
    rows that didn't exist yet, so editing content in the source JSON and
    re-running `flask seed` silently did nothing once a row already
    existed. Simulate "stale" DB content diverging from the source file,
    then confirm a reseed overwrites it back to match the file.
    """
    with app.app_context():
        seed_all()

        section = Section.query.filter_by(slug="browser-rendering").first()
        session = section.learning_sessions[0]
        block = session.content_blocks[0]
        exercise = block.exercises[0] if block.exercises else session.exercises[0]

        block.heading = "STALE HEADING"
        block.body = "STALE BODY"
        session.title = "STALE TITLE"
        exercise.prompt = "STALE PROMPT"
        db.session.commit()

        seed_all()

        db.session.refresh(block)
        db.session.refresh(session)
        db.session.refresh(exercise)
        assert block.heading != "STALE HEADING"
        assert block.body != "STALE BODY"
        assert session.title != "STALE TITLE"
        assert exercise.prompt != "STALE PROMPT"


def test_seed_all_is_idempotent(app):
    with app.app_context():
        seed_all()
        counts_after_first_run = (
            Topic.query.count(),
            Section.query.count(),
            LearningSession.query.count(),
            ContentBlock.query.count(),
            Exercise.query.count(),
        )

        seed_all()
        counts_after_second_run = (
            Topic.query.count(),
            Section.query.count(),
            LearningSession.query.count(),
            ContentBlock.query.count(),
            Exercise.query.count(),
        )

        assert counts_after_first_run == counts_after_second_run


def _prerequisite_edge_count() -> int:
    from app.models import section_prerequisites

    return db.session.execute(
        db.select(db.func.count()).select_from(section_prerequisites)
    ).scalar()


def test_seed_all_links_prerequisites_from_curriculum_map(app):
    with app.app_context():
        seed_all()

        # Module 2 ("Algorithms & Problem Solving") depends on module 1
        # ("Data Structures") per curriculum-map.json. CURRICULUM.md's own
        # documented graph also lists modules 6 and 8 as prerequisites,
        # but those have zero seeded content and can never reach
        # "practiced" -- those two edges are temporarily dropped here so
        # the two sections with real lesson content (modules 1/2) are
        # reachable; see docs/decisions/0028-....md.
        section = Section.query.filter_by(slug="02-algorithms-problem-solving").first()
        assert section is not None
        prereq_slugs = {p.slug for p in section.prerequisites}
        assert prereq_slugs == {"01-data-structures"}

        # Module 1 is now an entry point with no prerequisites (same
        # temporary reason as above).
        entry_point = Section.query.filter_by(slug="01-data-structures").first()
        assert entry_point.prerequisites == []

        # The legacy pre-map section isn't in curriculum-map.json at all,
        # so it must simply have no prerequisites, not an error.
        legacy_section = Section.query.filter_by(slug="browser-rendering").first()
        assert legacy_section is not None
        assert legacy_section.prerequisites == []


def test_seed_all_prerequisite_links_are_idempotent(app):
    with app.app_context():
        seed_all()
        edges_after_first_run = _prerequisite_edge_count()
        assert edges_after_first_run > 0

        seed_all()
        assert _prerequisite_edge_count() == edges_after_first_run


def test_validate_no_prerequisite_cycles_accepts_a_valid_dag():
    _validate_no_prerequisite_cycles({1: [2], 2: [3], 3: []})


def test_validate_no_prerequisite_cycles_rejects_a_cycle():
    with pytest.raises(ValueError, match="cycle"):
        _validate_no_prerequisite_cycles({1: [2], 2: [3], 3: [1]})


def test_validate_no_prerequisite_cycles_rejects_unknown_id():
    with pytest.raises(ValueError, match="Unknown prerequisite"):
        _validate_no_prerequisite_cycles({1: [99]})


def test_seed_all_imports_backend_architecture_content(app):
    with app.app_context():
        seed_all()

        section = Section.query.filter_by(slug="23-backend-architecture").first()
        assert section is not None
        assert section.proficiency_tier == "D"
        # Attaches to the pre-existing WIP section from curriculum-map.json
        # rather than creating a duplicate -- same module id, same slug.
        assert Section.query.filter_by(slug="23-backend-architecture").count() == 1

        sessions = sorted(section.learning_sessions, key=lambda s: s.sequence)
        assert len(sessions) == 3
        assert [s.title for s in sessions] == [
            "Boundaries and the Domain They Protect",
            "Wiring Dependencies and Drawing Transaction Lines",
            "Splitting Services and Changing Behavior Safely",
        ]
        for session in sessions:
            assert len(session.content_blocks) == 6

        block_exercises = [e for s in sessions for b in s.content_blocks for e in b.exercises]
        assert len(block_exercises) == 12
        assert all(e.content_block_id is not None for e in block_exercises)


def test_seed_all_imports_block_examples(app):
    """The "Repository Context Files" slide carries a worked CLAUDE.md
    example in its `examples` accordion, not inlined into the body text.
    """
    with app.app_context():
        seed_all()

        section = Section.query.filter_by(slug="70-ai-assisted-software-development").first()
        session = next(s for s in section.learning_sessions if s.sequence == 1)
        block = next(b for b in session.content_blocks if "Repository Context" in b.heading)

        assert [example["label"] for example in block.examples] == [
            "Minimal CLAUDE.md",
            "A fuller CLAUDE.md, from a similarly-shaped project",
        ]
        assert "legacy/" in block.examples[0]["content"]
        assert "## 1. Project Overview" in block.examples[1]["content"]

        # Blocks that don't author any examples default to an empty list,
        # not a missing key -- the API contract is "always a list".
        other_block = session.content_blocks[0]
        assert other_block.examples == []


def test_seed_all_imports_project_exercise_with_checkpoints(app):
    with app.app_context():
        seed_all()

        section = Section.query.filter_by(slug="23-backend-architecture").first()
        session = next(s for s in section.learning_sessions if s.sequence == 3)
        project_exercises = [e for e in session.exercises if e.type == "project"]

        assert len(project_exercises) == 1
        checkpoints = project_exercises[0].definition_json["checkpoints"]
        assert len(checkpoints) == 3
        assert all(c["title"] and c["acceptance_criteria"] for c in checkpoints)


def test_validate_exercise_definition_rejects_project_without_checkpoints():
    with pytest.raises(ValueError, match="at least one checkpoint"):
        _validate_exercise_definition(
            {"type": "project", "prompt": "A broken project", "definition": {"checkpoints": []}}
        )


def test_validate_exercise_definition_rejects_checkpoint_without_criteria():
    with pytest.raises(ValueError, match="title and at least one acceptance criterion"):
        _validate_exercise_definition(
            {
                "type": "project",
                "prompt": "A broken project",
                "definition": {"checkpoints": [{"title": "Step 1", "acceptance_criteria": []}]},
            }
        )


def test_seed_all_imports_behavioral_question_bank(app):
    with app.app_context():
        seed_all()

        questions = BehavioralQuestion.query.filter_by(source="seed").all()
        assert len(questions) == 15
        assert all(q.section is not None for q in questions)

        technical = Section.query.filter_by(slug="76-technical-leadership").first()
        technical_questions = [q for q in questions if q.section_id == technical.id]
        assert len(technical_questions) == 3


def test_seed_all_is_idempotent_for_behavioral_questions(app):
    with app.app_context():
        seed_all()
        seed_all()

        assert BehavioralQuestion.query.filter_by(source="seed").count() == 15


def test_seed_all_defaults_reference_links_to_empty_list(app):
    """No currently-authored content uses `reference_links` yet (ADR
    0032), so every seeded block must still default to an empty list --
    same "always a list, never a missing key" contract as `examples`.
    """
    with app.app_context():
        seed_all()

        section = Section.query.filter_by(slug="browser-rendering").first()
        block = section.learning_sessions[0].content_blocks[0]
        assert block.reference_links == []
