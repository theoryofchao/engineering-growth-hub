from app.seed import seed_all


def test_list_topics_includes_full_curriculum_breadth(app, client):
    with app.app_context():
        seed_all()

    response = client.get("/api/v1/topics")

    assert response.status_code == 200
    domains = response.get_json()
    assert len(domains) == 17  # 16 from the map + legacy "Frontend Engineering"

    all_topics = [topic for domain in domains for topic in domain["topics"]]
    assert len(all_topics) == 81

    by_slug = {t["slug"]: t for t in all_topics}
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

    # The one entry-point module has no prerequisites, so it's never locked.
    entry_point = by_slug["08-programming-fundamentals"]
    assert entry_point["is_locked"] is False
    assert entry_point["unmet_prerequisites"] == []


def test_list_topics_unlocks_once_prerequisites_are_practiced(app, client):
    from app.extensions import db
    from app.models import Topic, UserProgress

    with app.app_context():
        seed_all()

        for slug in (
            "01-data-structures",
            "06-mathematics-for-computing",
            "08-programming-fundamentals",
        ):
            topic = Topic.query.filter_by(slug=slug).first()
            UserProgress.get_or_create(topic.id).advance_to("practiced")
        db.session.commit()

    response = client.get("/api/v1/topics")
    all_topics = [topic for domain in response.get_json() for topic in domain["topics"]]
    by_slug = {t["slug"]: t for t in all_topics}

    assert by_slug["02-algorithms-problem-solving"]["is_locked"] is False
    assert by_slug["02-algorithms-problem-solving"]["unmet_prerequisites"] == []


def test_get_topic_detail_returns_sessions_and_prerequisites(app, client):
    from app.models import Topic

    with app.app_context():
        seed_all()
        topic_id = Topic.query.filter_by(slug="02-algorithms-problem-solving").first().id

    response = client.get(f"/api/v1/topics/{topic_id}")

    assert response.status_code == 200
    body = response.get_json()
    assert body["slug"] == "02-algorithms-problem-solving"
    assert body["is_locked"] is True
    assert body["learning_sessions"] == []
    assert len(body["prerequisites"]) == 3
    assert len(body["unmet_prerequisites"]) == 3


def test_get_topic_detail_404_for_missing_topic(app, client):
    with app.app_context():
        seed_all()

    response = client.get("/api/v1/topics/999999")

    assert response.status_code == 404


def test_dev_bypass_unlocks_everything_when_enabled(app, client):
    from app.models import Topic

    with app.app_context():
        seed_all()
        topic_id = Topic.query.filter_by(slug="02-algorithms-problem-solving").first().id

    app.config["DEV_UNLOCK_ALL_TOPICS"] = True
    try:
        list_response = client.get("/api/v1/topics")
        all_topics = [t for d in list_response.get_json() for t in d["topics"]]
        locked_item = next(t for t in all_topics if t["slug"] == "02-algorithms-problem-solving")

        assert locked_item["is_locked"] is False
        assert locked_item["dev_prerequisites_bypassed"] is True
        # Unmet prerequisites are still reported -- the bypass only stops
        # them from blocking access, it doesn't pretend they're done.
        assert len(locked_item["unmet_prerequisites"]) == 3

        detail_response = client.get(f"/api/v1/topics/{topic_id}")
        detail = detail_response.get_json()
        assert detail["is_locked"] is False
        assert detail["dev_prerequisites_bypassed"] is True
        assert len(detail["unmet_prerequisites"]) == 3
    finally:
        app.config["DEV_UNLOCK_ALL_TOPICS"] = False


def test_dev_bypass_flag_is_false_by_default(app, client):
    with app.app_context():
        seed_all()

    response = client.get("/api/v1/topics")
    all_topics = [t for d in response.get_json() for t in d["topics"]]

    assert all(t["dev_prerequisites_bypassed"] is False for t in all_topics)
    # And the already-locked module from the other tests stays locked.
    locked_item = next(t for t in all_topics if t["slug"] == "02-algorithms-problem-solving")
    assert locked_item["is_locked"] is True


def test_list_topics_query_count_is_bounded_not_linear_in_topic_count(app, client, count_queries):
    """Regression test for the N+1 fix: 81 topics with 204 prerequisite
    edges across 17 domains must not take anywhere near that many
    queries. A generous fixed bound (well under one query per topic)
    catches a regression back to per-row lazy loading without being
    brittle to exact eager-load query-plan counts.
    """
    with app.app_context():
        seed_all()

    with count_queries() as counter:
        response = client.get("/api/v1/topics")

    assert response.status_code == 200
    assert counter["n"] < 15


def test_get_topic_detail_query_count_is_small(app, client, count_queries):
    from app.models import Topic

    with app.app_context():
        seed_all()
        topic_id = Topic.query.filter_by(slug="02-algorithms-problem-solving").first().id

    with count_queries() as counter:
        response = client.get(f"/api/v1/topics/{topic_id}")

    assert response.status_code == 200
    assert counter["n"] < 10
