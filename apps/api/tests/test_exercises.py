from app.extensions import db
from app.models import Exercise, Section, UserProgress
from app.seed import seed_all


def _seed_exercise_id(app) -> int:
    with app.app_context():
        seed_all()
        section = Section.query.filter_by(slug="browser-rendering").first()
        exercise = section.learning_sessions[0].exercises[0]
        return exercise.id


def _project_exercise_id(app) -> int:
    with app.app_context():
        seed_all()
        section = Section.query.filter_by(slug="23-backend-architecture").first()
        session = next(s for s in section.learning_sessions if s.sequence == 3)
        exercise = next(e for e in session.exercises if e.type == "project")
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


def test_toggle_project_checkpoint_criterion(app, client):
    exercise_id = _project_exercise_id(app)

    response = client.put(
        f"/api/v1/exercises/{exercise_id}/project-progress",
        json={"checkpoint_index": 0, "criterion_index": 1, "checked": True},
    )

    assert response.status_code == 200
    assert response.get_json()["checked_criteria"] == {"0:1": True}

    uncheck_response = client.put(
        f"/api/v1/exercises/{exercise_id}/project-progress",
        json={"checkpoint_index": 0, "criterion_index": 1, "checked": False},
    )
    assert uncheck_response.get_json()["checked_criteria"] == {}


def test_checking_every_criterion_advances_progress_to_practiced(app, client):
    exercise_id = _project_exercise_id(app)
    with app.app_context():
        exercise = db.session.get(Exercise, exercise_id)
        checkpoints = exercise.definition_json["checkpoints"]
        section_id = exercise.learning_session.section_id

    for checkpoint_index, checkpoint in enumerate(checkpoints):
        for criterion_index in range(len(checkpoint["acceptance_criteria"])):
            client.put(
                f"/api/v1/exercises/{exercise_id}/project-progress",
                json={
                    "checkpoint_index": checkpoint_index,
                    "criterion_index": criterion_index,
                    "checked": True,
                },
            )

    with app.app_context():
        progress = UserProgress.query.filter_by(section_id=section_id).first()
        assert progress is not None
        assert progress.status == "practiced"


def test_project_progress_rejects_out_of_range_checkpoint(app, client):
    exercise_id = _project_exercise_id(app)

    response = client.put(
        f"/api/v1/exercises/{exercise_id}/project-progress",
        json={"checkpoint_index": 99, "criterion_index": 0, "checked": True},
    )

    assert response.status_code == 400


def test_project_progress_rejects_non_project_exercise(app, client):
    exercise_id = _seed_exercise_id(app)

    response = client.put(
        f"/api/v1/exercises/{exercise_id}/project-progress",
        json={"checkpoint_index": 0, "criterion_index": 0, "checked": True},
    )

    assert response.status_code == 400
    assert "not a project" in response.get_json()["error"]


def test_project_progress_404_for_missing_exercise(client):
    response = client.put(
        "/api/v1/exercises/999999/project-progress",
        json={"checkpoint_index": 0, "criterion_index": 0, "checked": True},
    )

    assert response.status_code == 404


def test_project_progress_rejects_malformed_body(app, client):
    exercise_id = _project_exercise_id(app)

    response = client.put(
        f"/api/v1/exercises/{exercise_id}/project-progress",
        json={"checkpoint_index": "not-an-int", "criterion_index": 0, "checked": True},
    )

    assert response.status_code == 400


def test_project_exercise_is_serialized_in_learning_session_detail(app, client):
    exercise_id = _project_exercise_id(app)
    with app.app_context():
        exercise = db.session.get(Exercise, exercise_id)
        session_id = exercise.learning_session_id

    client.put(
        f"/api/v1/exercises/{exercise_id}/project-progress",
        json={"checkpoint_index": 0, "criterion_index": 0, "checked": True},
    )

    response = client.get(f"/api/v1/learning-sessions/{session_id}")
    project_exercise = next(e for e in response.get_json()["exercises"] if e["type"] == "project")
    assert project_exercise["checked_criteria"] == {"0:0": True}
    assert len(project_exercise["checkpoints"]) == 3
