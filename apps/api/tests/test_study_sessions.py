from datetime import timedelta

from app.extensions import db
from app.models import Section, StudySession
from app.seed import seed_all


def _seed_learning_session_id(app) -> int:
    with app.app_context():
        seed_all()
        section = Section.query.filter_by(slug="browser-rendering").first()
        return section.learning_sessions[0].id


def test_create_study_session_starts_active(app, client):
    learning_session_id = _seed_learning_session_id(app)

    response = client.post(
        "/api/v1/study-sessions",
        json={"learning_session_id": learning_session_id, "mode_minutes": 25},
    )

    assert response.status_code == 201
    body = response.get_json()
    assert body["status"] == "active"
    assert body["mode_minutes"] == 25
    assert body["break_minutes"] == 5
    assert body["elapsed_seconds"] == 0


def test_create_study_session_rejects_bad_mode(app, client):
    learning_session_id = _seed_learning_session_id(app)

    response = client.post(
        "/api/v1/study-sessions",
        json={"learning_session_id": learning_session_id, "mode_minutes": 30},
    )

    assert response.status_code == 400


def test_create_study_session_rejects_unknown_learning_session(app, client):
    response = client.post(
        "/api/v1/study-sessions",
        json={"learning_session_id": 999, "mode_minutes": 25},
    )

    assert response.status_code == 400


def test_pause_freezes_elapsed_time(app, client):
    learning_session_id = _seed_learning_session_id(app)

    create_response = client.post(
        "/api/v1/study-sessions",
        json={"learning_session_id": learning_session_id, "mode_minutes": 25},
    )
    session_id = create_response.get_json()["id"]

    with app.app_context():
        session = db.session.get(StudySession, session_id)
        session.started_at -= timedelta(seconds=90)
        session.last_resumed_at -= timedelta(seconds=90)
        db.session.commit()

    pause_response = client.patch(f"/api/v1/study-sessions/{session_id}", json={"action": "pause"})
    assert pause_response.status_code == 200
    paused_body = pause_response.get_json()
    assert paused_body["status"] == "paused"
    assert paused_body["elapsed_seconds"] >= 90

    get_response = client.get(f"/api/v1/study-sessions/{session_id}")
    assert get_response.get_json()["elapsed_seconds"] == paused_body["elapsed_seconds"]


def test_resume_then_complete(app, client):
    learning_session_id = _seed_learning_session_id(app)

    create_response = client.post(
        "/api/v1/study-sessions",
        json={"learning_session_id": learning_session_id, "mode_minutes": 50},
    )
    session_id = create_response.get_json()["id"]

    client.patch(f"/api/v1/study-sessions/{session_id}", json={"action": "pause"})
    resume_response = client.patch(
        f"/api/v1/study-sessions/{session_id}", json={"action": "resume"}
    )
    assert resume_response.get_json()["status"] == "active"

    complete_response = client.patch(
        f"/api/v1/study-sessions/{session_id}", json={"action": "complete"}
    )
    body = complete_response.get_json()
    assert body["status"] == "completed"

    with app.app_context():
        session = db.session.get(StudySession, session_id)
        assert session.completed_at is not None
        assert session.last_resumed_at is None


def test_update_rejects_unknown_action(app, client):
    learning_session_id = _seed_learning_session_id(app)
    create_response = client.post(
        "/api/v1/study-sessions",
        json={"learning_session_id": learning_session_id, "mode_minutes": 25},
    )
    session_id = create_response.get_json()["id"]

    response = client.patch(f"/api/v1/study-sessions/{session_id}", json={"action": "bogus"})
    assert response.status_code == 400


def test_get_missing_study_session_404s(client):
    response = client.get("/api/v1/study-sessions/999")
    assert response.status_code == 404
