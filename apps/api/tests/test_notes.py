from app.models import Topic
from app.seed import seed_all


def _first_content_block_id(app) -> int:
    with app.app_context():
        seed_all()
        topic = Topic.query.filter_by(slug="browser-rendering").first()
        return topic.learning_sessions[0].content_blocks[0].id


def _ids(app) -> dict:
    with app.app_context():
        seed_all()
        topic = Topic.query.filter_by(slug="browser-rendering").first()
        learning_session = topic.learning_sessions[0]
        return {
            "learning_session_id": learning_session.id,
            "block_id": learning_session.content_blocks[0].id,
        }


def test_upsert_note_creates_then_updates(app, client):
    ids = _ids(app)
    block_id = ids["block_id"]

    create_response = client.put(
        f"/api/v1/content-blocks/{block_id}/note", json={"body": "First draft"}
    )
    assert create_response.status_code == 200
    assert create_response.get_json()["body"] == "First draft"

    update_response = client.put(
        f"/api/v1/content-blocks/{block_id}/note", json={"body": "Revised note"}
    )
    assert update_response.status_code == 200
    body = update_response.get_json()
    assert body["body"] == "Revised note"

    # Still exactly one note for this block, not two.
    get_response = client.get(f"/api/v1/learning-sessions/{ids['learning_session_id']}")
    blocks = get_response.get_json()["content_blocks"]
    matching = [b for b in blocks if b["id"] == block_id]
    assert len(matching) == 1
    assert matching[0]["note"]["body"] == "Revised note"


def test_upsert_note_rejects_empty_body(app, client):
    block_id = _first_content_block_id(app)

    response = client.put(f"/api/v1/content-blocks/{block_id}/note", json={"body": "   "})
    assert response.status_code == 400


def test_upsert_note_missing_block_404s(client):
    response = client.put("/api/v1/content-blocks/999/note", json={"body": "hi"})
    assert response.status_code == 404


def test_delete_note(app, client):
    block_id = _first_content_block_id(app)
    client.put(f"/api/v1/content-blocks/{block_id}/note", json={"body": "Temp note"})

    delete_response = client.delete(f"/api/v1/content-blocks/{block_id}/note")
    assert delete_response.status_code == 204

    second_delete = client.delete(f"/api/v1/content-blocks/{block_id}/note")
    assert second_delete.status_code == 404
