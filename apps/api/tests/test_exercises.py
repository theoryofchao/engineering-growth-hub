from app.extensions import db
from app.models import Exercise, Topic, UserProgress
from app.seed import seed_all


def _seed_exercise_id(app) -> int:
    with app.app_context():
        seed_all()
        topic = Topic.query.filter_by(slug="browser-rendering").first()
        exercise = topic.learning_sessions[0].exercises[0]
        return exercise.id


def test_submit_correct_answer(app, client):
    exercise_id = _seed_exercise_id(app)

    response = client.post(
        f"/api/v1/exercises/{exercise_id}/submissions", json={"selected_index": 1}
    )

    assert response.status_code == 201
    body = response.get_json()
    assert body["is_correct"] is True
    assert body["score"] == 1.0
    assert body["correct_index"] == 1
    assert "explanation" in body


def test_submit_incorrect_answer(app, client):
    exercise_id = _seed_exercise_id(app)

    response = client.post(
        f"/api/v1/exercises/{exercise_id}/submissions", json={"selected_index": 0}
    )

    body = response.get_json()
    assert body["is_correct"] is False
    assert body["score"] == 0.0


def test_correct_submission_advances_progress_to_practiced(app, client):
    exercise_id = _seed_exercise_id(app)

    client.post(f"/api/v1/exercises/{exercise_id}/submissions", json={"selected_index": 1})

    with app.app_context():
        exercise = db.session.get(Exercise, exercise_id)
        topic_id = exercise.learning_session.topic_id
        progress = UserProgress.query.filter_by(topic_id=topic_id).first()
        assert progress is not None
        assert progress.status == "practiced"


def test_incorrect_submission_does_not_advance_progress(app, client):
    exercise_id = _seed_exercise_id(app)

    client.post(f"/api/v1/exercises/{exercise_id}/submissions", json={"selected_index": 0})

    with app.app_context():
        exercise = db.session.get(Exercise, exercise_id)
        topic_id = exercise.learning_session.topic_id
        progress = UserProgress.query.filter_by(topic_id=topic_id).first()
        assert progress is None  # never started a study session either


def test_submit_rejects_out_of_range_index(app, client):
    exercise_id = _seed_exercise_id(app)

    response = client.post(
        f"/api/v1/exercises/{exercise_id}/submissions", json={"selected_index": 99}
    )

    assert response.status_code == 400


def test_submit_missing_exercise_404s(client):
    response = client.post("/api/v1/exercises/999/submissions", json={"selected_index": 0})

    assert response.status_code == 404
