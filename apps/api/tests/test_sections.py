from app.models import Section
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
    assert len(body["learning_sessions"]) == 1
    assert len(body["prerequisites"]) == 1
    assert len(body["unmet_prerequisites"]) == 1


def test_learning_session_is_complete_false_when_untouched(app, client):
    with app.app_context():
        seed_all()

    response = client.get("/api/v1/sections/browser-rendering")

    assert response.status_code == 200
    body = response.get_json()
    assert body["learning_sessions"][0]["is_complete"] is False
    assert body["is_fully_complete"] is False


def test_section_is_fully_complete_once_every_block_in_every_lesson_is_done(app, client):
    with app.app_context():
        seed_all()
        section = Section.query.filter_by(slug="browser-rendering").first()
        block_ids = [b.id for b in section.learning_sessions[0].content_blocks]

    client.post(
        "/api/v1/content-blocks/completions/batch",
        json={
            "completions": [
                {
                    "content_block_id": block_id,
                    "completed": True,
                    "client_updated_at": "2026-10-23T00:00:00Z",
                }
                for block_id in block_ids
            ]
        },
    )

    response = client.get("/api/v1/sections/browser-rendering")

    assert response.status_code == 200
    body = response.get_json()
    assert body["learning_sessions"][0]["is_complete"] is True
    assert body["is_fully_complete"] is True


def test_section_not_fully_complete_if_only_some_blocks_done(app, client):
    with app.app_context():
        seed_all()
        section = Section.query.filter_by(slug="browser-rendering").first()
        first_block_id = section.learning_sessions[0].content_blocks[0].id

    client.post(
        "/api/v1/content-blocks/completions/batch",
        json={
            "completions": [
                {
                    "content_block_id": first_block_id,
                    "completed": True,
                    "client_updated_at": "2026-10-23T00:00:00Z",
                }
            ]
        },
    )

    response = client.get("/api/v1/sections/browser-rendering")

    assert response.status_code == 200
    body = response.get_json()
    assert body["learning_sessions"][0]["is_complete"] is False
    assert body["is_fully_complete"] is False


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
        assert len(detail["unmet_prerequisites"]) == 1
    finally:
        app.config["DEV_UNLOCK_ALL_SECTIONS"] = False


def test_get_section_detail_query_count_is_small(app, client, count_queries):
    with app.app_context():
        seed_all()

    with count_queries() as counter:
        response = client.get("/api/v1/sections/02-algorithms-problem-solving")

    assert response.status_code == 200
    # 10, not <10: ADR 0030 added one fixed-cost aggregate query for
    # per-lesson/section completion counts (not per-row, so this ceiling
    # still catches a genuine N+1 regression).
    assert counter["n"] < 11
