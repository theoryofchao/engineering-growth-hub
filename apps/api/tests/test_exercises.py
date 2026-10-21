from app.extensions import db
from app.models import Exercise, Section, UserProgress
from app.seed import seed_all


def _seed_exercise_id(app) -> int:
    with app.app_context():
        seed_all()
        section = Section.query.filter_by(slug="browser-rendering").first()
        exercise = section.learning_sessions[0].exercises[0]
        return exercise.id


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
        section_id = exercise.learning_session.section_id
        progress = UserProgress.query.filter_by(section_id=section_id).first()
        assert progress is not None
        assert progress.status == "practiced"


def test_incorrect_submission_does_not_advance_progress(app, client):
    exercise_id = _seed_exercise_id(app)

    client.post(f"/api/v1/exercises/{exercise_id}/submissions", json={"selected_index": 0})

    with app.app_context():
        exercise = db.session.get(Exercise, exercise_id)
        section_id = exercise.learning_session.section_id
        progress = UserProgress.query.filter_by(section_id=section_id).first()
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


def _correct_outputs(app, exercise_id: int) -> list:
    with app.app_context():
        exercise = db.session.get(Exercise, exercise_id)
        definition = exercise.definition_json
        cases = definition["visible_test_cases"] + definition["hidden_test_cases"]
        return [list(reversed(c["input"][0])) for c in cases]


def test_submit_code_correct_solution(app, client):
    exercise_id = _code_exercise_id(app)
    outputs = _correct_outputs(app, exercise_id)

    response = client.post(
        f"/api/v1/exercises/{exercise_id}/submissions", json={"outputs": outputs}
    )

    assert response.status_code == 201
    body = response.get_json()
    assert body["is_correct"] is True
    assert body["score"] == 1.0
    assert len(body["cases"]) == len(outputs)
    # Hidden cases are revealed post-grading, unlike pre-submission.
    assert any(c["hidden"] for c in body["cases"])
    assert all("expected_output" in c for c in body["cases"])


def test_submit_code_wrong_solution_does_not_advance_progress(app, client):
    exercise_id = _code_exercise_id(app)
    with app.app_context():
        exercise = db.session.get(Exercise, exercise_id)
        definition = exercise.definition_json
        total = len(definition["visible_test_cases"]) + len(definition["hidden_test_cases"])

    response = client.post(
        f"/api/v1/exercises/{exercise_id}/submissions",
        json={"outputs": [[]] * total},
    )

    assert response.status_code == 201
    assert response.get_json()["is_correct"] is False

    with app.app_context():
        exercise = db.session.get(Exercise, exercise_id)
        section_id = exercise.learning_session.section_id
        progress = UserProgress.query.filter_by(section_id=section_id).first()
        assert progress is None


def test_submit_code_rejects_wrong_length_outputs(app, client):
    exercise_id = _code_exercise_id(app)

    response = client.post(f"/api/v1/exercises/{exercise_id}/submissions", json={"outputs": []})

    assert response.status_code == 400
