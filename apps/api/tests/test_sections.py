from app.seed import seed_all


def test_get_section_detail_returns_sessions_and_prerequisites(app, client):
    with app.app_context():
        seed_all()

    response = client.get("/api/v1/sections/02-algorithms-problem-solving")

    assert response.status_code == 200
    body = response.get_json()
    assert body["slug"] == "02-algorithms-problem-solving"
    assert body["topic"]["slug"] == "computer-science-foundations"
    assert body["is_locked"] is True
    assert body["learning_sessions"] == []
    assert len(body["prerequisites"]) == 3
    assert len(body["unmet_prerequisites"]) == 3


def test_get_section_detail_404_for_missing_slug(app, client):
    with app.app_context():
        seed_all()

    response = client.get("/api/v1/sections/not-a-real-section")

    assert response.status_code == 404


def test_dev_bypass_unlocks_detail_when_enabled(app, client):
    with app.app_context():
        seed_all()

    app.config["DEV_UNLOCK_ALL_SECTIONS"] = True
    try:
        detail_response = client.get("/api/v1/sections/02-algorithms-problem-solving")
        detail = detail_response.get_json()
        assert detail["is_locked"] is False
        assert detail["dev_prerequisites_bypassed"] is True
        assert len(detail["unmet_prerequisites"]) == 3
    finally:
        app.config["DEV_UNLOCK_ALL_SECTIONS"] = False


def test_get_section_detail_query_count_is_small(app, client, count_queries):
    with app.app_context():
        seed_all()

    with count_queries() as counter:
        response = client.get("/api/v1/sections/02-algorithms-problem-solving")

    assert response.status_code == 200
    assert counter["n"] < 10
