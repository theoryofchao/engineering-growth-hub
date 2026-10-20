from app.seed import seed_all


def test_list_topics_includes_full_curriculum_breadth(app, client):
    with app.app_context():
        seed_all()

    response = client.get("/api/v1/topics")

    assert response.status_code == 200
    topics = response.get_json()
    assert len(topics) == 17  # 16 from the map + legacy "Frontend Engineering"

    all_sections = [section for topic in topics for section in topic["sections"]]
    assert len(all_sections) == 81

    by_slug = {s["slug"]: s for s in all_sections}
    assert by_slug["01-data-structures"]["has_content"] is False
    assert by_slug["01-data-structures"]["first_learning_session_id"] is None

    assert by_slug["browser-rendering"]["has_content"] is True
    assert by_slug["browser-rendering"]["first_learning_session_id"] is not None

    assert by_slug["70-ai-assisted-software-development"]["has_content"] is True

    # Module 2 depends on modules 1/6/8, none of which have been
    # practiced yet, so it should be reported locked.
    locked = by_slug["02-algorithms-problem-solving"]
    assert locked["status"] == "not_started"
    assert locked["is_locked"] is True
    assert {p["slug"] for p in locked["unmet_prerequisites"]} == {
        "01-data-structures",
        "06-mathematics-for-computing",
        "08-programming-fundamentals",
    }
    # Each prerequisite carries its own parent topic, for cross-topic links --
    # "08-programming-fundamentals" lives under a different topic than the
    # other two, which is exactly the case this field exists to handle.
    assert {p["topic"]["slug"] for p in locked["unmet_prerequisites"]} == {
        "computer-science-foundations",
        "programming-code-quality",
    }

    # The one entry-point module has no prerequisites, so it's never locked.
    entry_point = by_slug["08-programming-fundamentals"]
    assert entry_point["is_locked"] is False
    assert entry_point["unmet_prerequisites"] == []


def test_list_topics_unlocks_once_prerequisites_are_practiced(app, client):
    from app.extensions import db
    from app.models import Section, UserProgress

    with app.app_context():
        seed_all()

        for slug in (
            "01-data-structures",
            "06-mathematics-for-computing",
            "08-programming-fundamentals",
        ):
            section = Section.query.filter_by(slug=slug).first()
            UserProgress.get_or_create(section.id).advance_to("practiced")
        db.session.commit()

    response = client.get("/api/v1/topics")
    all_sections = [section for topic in response.get_json() for section in topic["sections"]]
    by_slug = {s["slug"]: s for s in all_sections}

    assert by_slug["02-algorithms-problem-solving"]["is_locked"] is False
    assert by_slug["02-algorithms-problem-solving"]["unmet_prerequisites"] == []


def test_dev_bypass_unlocks_list_when_enabled(app, client):
    with app.app_context():
        seed_all()

    app.config["DEV_UNLOCK_ALL_SECTIONS"] = True
    try:
        list_response = client.get("/api/v1/topics")
        all_sections = [s for t in list_response.get_json() for s in t["sections"]]
        locked_item = next(s for s in all_sections if s["slug"] == "02-algorithms-problem-solving")

        assert locked_item["is_locked"] is False
        assert locked_item["dev_prerequisites_bypassed"] is True
        # Unmet prerequisites are still reported -- the bypass only stops
        # them from blocking access, it doesn't pretend they're done.
        assert len(locked_item["unmet_prerequisites"]) == 3
    finally:
        app.config["DEV_UNLOCK_ALL_SECTIONS"] = False


def test_dev_bypass_flag_is_false_by_default(app, client):
    with app.app_context():
        seed_all()

    response = client.get("/api/v1/topics")
    all_sections = [s for t in response.get_json() for s in t["sections"]]

    assert all(s["dev_prerequisites_bypassed"] is False for s in all_sections)
    # And the already-locked module from the other tests stays locked.
    locked_item = next(s for s in all_sections if s["slug"] == "02-algorithms-problem-solving")
    assert locked_item["is_locked"] is True


def test_list_topics_query_count_is_bounded_not_linear_in_section_count(app, client, count_queries):
    """Regression test for the N+1 fix: 81 sections with 204 prerequisite
    edges across 17 topics must not take anywhere near that many
    queries. A generous fixed bound (well under one query per section)
    catches a regression back to per-row lazy loading without being
    brittle to exact eager-load query-plan counts.
    """
    with app.app_context():
        seed_all()

    with count_queries() as counter:
        response = client.get("/api/v1/topics")

    assert response.status_code == 200
    assert counter["n"] < 15
