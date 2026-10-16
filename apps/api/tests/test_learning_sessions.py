from app.models import Topic
from app.seed import seed_all


def test_get_learning_session_returns_content(app, client):
    with app.app_context():
        seed_all()
        topic = Topic.query.filter_by(slug="browser-rendering").first()
        session_id = topic.learning_sessions[0].id

    response = client.get(f"/api/v1/learning-sessions/{session_id}")

    assert response.status_code == 200
    body = response.get_json()
    assert body["title"] == "Critical Rendering Path"
    assert body["duration_minutes"] == 25
    assert body["topic"]["slug"] == "browser-rendering"
    assert len(body["exercises"]) == 1
    assert "options" in body["exercises"][0]
    assert "correct_index" not in body["exercises"][0]

    assert len(body["content_blocks"]) == 3
    assert body["content_blocks"][0]["sequence"] == 1
    assert body["content_blocks"][0]["heading"] == "Overview"
    assert body["content_blocks"][0]["note"] is None


def test_get_learning_session_404_for_missing_id(client):
    response = client.get("/api/v1/learning-sessions/999")

    assert response.status_code == 404
    assert response.get_json()["error"] == "Learning session not found"
