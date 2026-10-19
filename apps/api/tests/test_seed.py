import pytest

from app.extensions import db
from app.models import ContentBlock, Domain, Exercise, LearningSession, Topic
from app.seed import _validate_no_prerequisite_cycles, seed_all


def test_seed_all_creates_frontend_engineering_content(app):
    with app.app_context():
        seed_all()

        domain = Domain.query.filter_by(name="Frontend Engineering").first()
        assert domain is not None

        topic = Topic.query.filter_by(slug="browser-rendering").first()
        assert topic is not None
        assert topic.module.domain_id == domain.id
        assert topic.proficiency_tier == "D"

        session = LearningSession.query.filter_by(topic_id=topic.id, sequence=1).first()
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
        # (predates the map; CURRICULUM.md's equivalent domain is "Web & Frontend").
        assert Domain.query.count() == 17
        assert Topic.query.count() == 81

        wip_topic = Topic.query.filter_by(slug="01-data-structures").first()
        assert wip_topic is not None
        assert wip_topic.proficiency_tier == "D"
        assert wip_topic.learning_sessions == []  # no lesson authored yet -> WIP

        ai_topic = Topic.query.filter_by(slug="70-ai-assisted-software-development").first()
        assert ai_topic is not None
        assert len(ai_topic.learning_sessions) == 8

        # Sessions 3/4 pin their exercises to specific slides, not the session.
        setups_session = next(s for s in ai_topic.learning_sessions if s.sequence == 3)
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

        topic = Topic.query.filter_by(slug="browser-rendering").first()
        session = topic.learning_sessions[0]
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
            Domain.query.count(),
            Topic.query.count(),
            LearningSession.query.count(),
            ContentBlock.query.count(),
            Exercise.query.count(),
        )

        seed_all()
        counts_after_second_run = (
            Domain.query.count(),
            Topic.query.count(),
            LearningSession.query.count(),
            ContentBlock.query.count(),
            Exercise.query.count(),
        )

        assert counts_after_first_run == counts_after_second_run


def _prerequisite_edge_count() -> int:
    from app.models import topic_prerequisites

    return db.session.execute(db.select(db.func.count()).select_from(topic_prerequisites)).scalar()


def test_seed_all_links_prerequisites_from_curriculum_map(app):
    with app.app_context():
        seed_all()

        # Module 2 ("Algorithms & Problem Solving") depends on modules
        # 1, 6, 8 per CURRICULUM.md -- confirm the M2M resolved correctly.
        topic = Topic.query.filter_by(slug="02-algorithms-problem-solving").first()
        assert topic is not None
        prereq_slugs = {p.slug for p in topic.prerequisites}
        assert prereq_slugs == {
            "01-data-structures",
            "06-mathematics-for-computing",
            "08-programming-fundamentals",
        }

        # Module 8 is the one entry point with no prerequisites.
        entry_point = Topic.query.filter_by(slug="08-programming-fundamentals").first()
        assert entry_point.prerequisites == []

        # The legacy pre-map topic isn't in curriculum-map.json at all,
        # so it must simply have no prerequisites, not an error.
        legacy_topic = Topic.query.filter_by(slug="browser-rendering").first()
        assert legacy_topic is not None
        assert legacy_topic.prerequisites == []


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

        topic = Topic.query.filter_by(slug="23-backend-architecture").first()
        assert topic is not None
        assert topic.proficiency_tier == "D"
        # Attaches to the pre-existing WIP topic from curriculum-map.json
        # rather than creating a duplicate -- same module id, same slug.
        assert Topic.query.filter_by(slug="23-backend-architecture").count() == 1

        sessions = sorted(topic.learning_sessions, key=lambda s: s.sequence)
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
