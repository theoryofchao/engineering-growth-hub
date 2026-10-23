from datetime import timedelta

from app.extensions import db
from app.models import ExerciseReviewState, Section, _utcnow
from app.seed import seed_all


def _seed_exercise_id(app) -> int:
    with app.app_context():
        seed_all()
        section = Section.query.filter_by(slug="browser-rendering").first()
        exercise = section.learning_sessions[0].exercises[0]
        return exercise.id


def _set_due_at(app, exercise_id: int, due_at) -> None:
    with app.app_context():
        state = ExerciseReviewState.query.filter_by(exercise_id=exercise_id).first()
        state.due_at = due_at
        db.session.commit()


def test_due_reviews_empty_when_nothing_attempted(app, client):
    _seed_exercise_id(app)

    response = client.get("/api/v1/reviews/due")

    assert response.status_code == 200
    assert response.get_json() == []


def test_due_reviews_excludes_not_yet_due_exercise(app, client):
    exercise_id = _seed_exercise_id(app)
    client.post(f"/api/v1/exercises/{exercise_id}/submissions", json={"selected_index": 1})

    response = client.get("/api/v1/reviews/due")

    assert response.get_json() == []


def test_due_reviews_includes_exercise_once_its_schedule_passes(app, client):
    exercise_id = _seed_exercise_id(app)
    client.post(f"/api/v1/exercises/{exercise_id}/submissions", json={"selected_index": 1})
    _set_due_at(app, exercise_id, _utcnow() - timedelta(minutes=1))

    response = client.get("/api/v1/reviews/due")

    assert response.status_code == 200
    body = response.get_json()
    assert len(body) == 1
    item = body[0]
    assert item["exercise"]["id"] == exercise_id
    assert item["box"] == 1
    assert item["section_slug"] == "browser-rendering"
    assert "topic" in item and "slug" in item["topic"]
    assert "learning_session_id" in item and "learning_session_title" in item
    # Client-safe exercise view -- no answer key leaked into the queue.
    assert "correct_index" not in item["exercise"]


def _code_exercise_id(app) -> int:
    with app.app_context():
        seed_all()
        section = Section.query.filter_by(slug="01-data-structures").first()
        session = section.learning_sessions[0]
        exercise = next(
            e
            for b in session.content_blocks
            for e in b.exercises
            if e.type == "code" and e.definition_json["function_name"] == "reverseInPlace"
        )
        return exercise.id


def test_due_reviews_ordered_oldest_due_first(app, client):
    quiz_exercise_id = _seed_exercise_id(app)
    code_exercise_id = _code_exercise_id(app)
    now = _utcnow()

    client.post(f"/api/v1/exercises/{quiz_exercise_id}/submissions", json={"selected_index": 1})
    _set_due_at(app, quiz_exercise_id, now - timedelta(days=1))

    with app.app_context():
        from app.models import Exercise

        definition = db.session.get(Exercise, code_exercise_id).definition_json
        total_cases = len(definition["visible_test_cases"]) + len(definition["hidden_test_cases"])

    client.post(
        f"/api/v1/exercises/{code_exercise_id}/submissions", json={"outputs": [[]] * total_cases}
    )
    _set_due_at(app, code_exercise_id, now - timedelta(days=5))

    response = client.get("/api/v1/reviews/due")
    body = response.get_json()

    assert [item["exercise"]["id"] for item in body] == [code_exercise_id, quiz_exercise_id]
