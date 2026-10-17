from app.extensions import db
from app.models import ContentBlock, Domain, Exercise, LearningSession, Topic
from app.seed import seed_all


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

        blocks = ContentBlock.query.filter_by(learning_session_id=session.id).order_by(
            ContentBlock.sequence
        ).all()
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
        assert len(ai_topic.learning_sessions) == 5

        # Sessions 3/4 pin their exercises to specific slides, not the session.
        setups_session = next(
            s for s in ai_topic.learning_sessions if s.sequence == 3
        )
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
