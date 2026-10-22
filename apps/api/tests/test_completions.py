from app.models import Section
from app.seed import seed_all


def _ids(app) -> dict:
    with app.app_context():
        seed_all()
        section = Section.query.filter_by(slug="browser-rendering").first()
        learning_session = section.learning_sessions[0]
        return {
            "learning_session_id": learning_session.id,
            "block_ids": [block.id for block in learning_session.content_blocks],
        }


def test_get_completions_defaults_to_incomplete(app, client):
    ids = _ids(app)

    response = client.get(f"/api/v1/learning-sessions/{ids['learning_session_id']}/completions")
    assert response.status_code == 200

    body = response.get_json()
    assert {item["content_block_id"] for item in body} == set(ids["block_ids"])
    assert all(item["completed"] is False and item["updated_at"] is None for item in body)


def test_get_completions_missing_session_404s(client):
    response = client.get("/api/v1/learning-sessions/999/completions")
    assert response.status_code == 404


def test_batch_marks_and_unmarks_completion(app, client):
    ids = _ids(app)
    block_id = ids["block_ids"][0]

    mark_response = client.post(
        "/api/v1/content-blocks/completions/batch",
        json={
            "completions": [
                {
                    "content_block_id": block_id,
                    "completed": True,
                    "client_updated_at": "2026-10-22T10:00:00Z",
                }
            ]
        },
    )
    assert mark_response.status_code == 200
    marked = mark_response.get_json()[0]
    assert marked["content_block_id"] == block_id
    assert marked["completed"] is True

    unmark_response = client.post(
        "/api/v1/content-blocks/completions/batch",
        json={
            "completions": [
                {
                    "content_block_id": block_id,
                    "completed": False,
                    "client_updated_at": "2026-10-22T10:05:00Z",
                }
            ]
        },
    )
    assert unmark_response.status_code == 200
    assert unmark_response.get_json()[0]["completed"] is False


def test_batch_applies_multiple_blocks_at_once(app, client):
    ids = _ids(app)

    response = client.post(
        "/api/v1/content-blocks/completions/batch",
        json={
            "completions": [
                {
                    "content_block_id": block_id,
                    "completed": True,
                    "client_updated_at": "2026-10-22T10:00:00Z",
                }
                for block_id in ids["block_ids"]
            ]
        },
    )
    assert response.status_code == 200
    assert all(item["completed"] is True for item in response.get_json())

    get_response = client.get(f"/api/v1/learning-sessions/{ids['learning_session_id']}/completions")
    assert all(item["completed"] is True for item in get_response.get_json())


def test_batch_ignores_stale_write(app, client):
    ids = _ids(app)
    block_id = ids["block_ids"][0]

    client.post(
        "/api/v1/content-blocks/completions/batch",
        json={
            "completions": [
                {
                    "content_block_id": block_id,
                    "completed": True,
                    "client_updated_at": "2026-10-22T10:05:00Z",
                }
            ]
        },
    )

    # An older write (e.g. a delayed retry) must not clobber the newer one.
    stale_response = client.post(
        "/api/v1/content-blocks/completions/batch",
        json={
            "completions": [
                {
                    "content_block_id": block_id,
                    "completed": False,
                    "client_updated_at": "2026-10-22T10:00:00Z",
                }
            ]
        },
    )
    assert stale_response.status_code == 200
    assert stale_response.get_json()[0]["completed"] is True


def test_batch_missing_block_404s(client):
    response = client.post(
        "/api/v1/content-blocks/completions/batch",
        json={
            "completions": [
                {
                    "content_block_id": 999,
                    "completed": True,
                    "client_updated_at": "2026-10-22T10:00:00Z",
                }
            ]
        },
    )
    assert response.status_code == 404


def test_batch_rejects_malformed_body(client):
    response = client.post(
        "/api/v1/content-blocks/completions/batch",
        json={"completions": [{"content_block_id": "not-an-int", "completed": True}]},
    )
    assert response.status_code == 400
