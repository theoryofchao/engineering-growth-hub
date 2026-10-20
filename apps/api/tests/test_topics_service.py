"""Unit tests for the topics service's curriculum-tree listing, exercised
directly (no Flask request/response round-trip).
"""

from app.seed import seed_all
from app.services import topics_service


def test_list_topics_returns_every_topic_with_nested_sections(app):
    with app.app_context():
        seed_all()

        topics = topics_service.list_topics()

        assert len(topics) == 17
        by_name = {t.name: t for t in topics}
        ai_topic = by_name["AI & ML Engineering"]
        all_sections = [section for module in ai_topic.modules for section in module.sections]
        assert any(s.slug == "70-ai-assisted-software-development" for s in all_sections)
