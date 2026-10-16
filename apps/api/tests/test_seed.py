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
        assert len(ai_topic.learning_sessions) == 2


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
