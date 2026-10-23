from app.extensions import db
from app.models import Exercise, Section
from app.seed import seed_all


def test_get_learning_session_returns_content(app, client):
    with app.app_context():
        seed_all()
        section = Section.query.filter_by(slug="browser-rendering").first()
        session_id = section.learning_sessions[0].id

    response = client.get(f"/api/v1/learning-sessions/{session_id}")

    assert response.status_code == 200
    body = response.get_json()
    assert body["title"] == "Critical Rendering Path"
    assert body["duration_minutes"] == 25
    assert body["section"]["slug"] == "browser-rendering"
    assert len(body["exercises"]) == 1
    assert "options" in body["exercises"][0]
    assert "correct_index" not in body["exercises"][0]

    assert len(body["content_blocks"]) == 3
    assert body["content_blocks"][0]["sequence"] == 1
    assert body["content_blocks"][0]["heading"] == "Overview"
    assert body["content_blocks"][0]["note"] is None
    assert body["content_blocks"][0]["exercises"] == []
    assert body["content_blocks"][0]["examples"] == []


def test_section_sessions_lists_every_lesson_in_the_section_for_navigation(app, client):
    with app.app_context():
        seed_all()
        section = Section.query.filter_by(slug="70-ai-assisted-software-development").first()
        first_session_id = section.learning_sessions[0].id

    response = client.get(f"/api/v1/learning-sessions/{first_session_id}")
    body = response.get_json()

    assert len(body["section_sessions"]) == 12
    sequences = [s["sequence"] for s in body["section_sessions"]]
    assert sequences == sorted(sequences)  # ordered, so nav renders in lesson order
    assert body["section_sessions"][0]["id"] == first_session_id
    assert all(s["is_complete"] is False for s in body["section_sessions"])


def test_section_sessions_marks_a_lesson_complete_once_every_block_is_done(app, client):
    with app.app_context():
        seed_all()
        section = Section.query.filter_by(slug="browser-rendering").first()
        session_id = section.learning_sessions[0].id
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

    response = client.get(f"/api/v1/learning-sessions/{session_id}")
    body = response.get_json()

    matching = next(s for s in body["section_sessions"] if s["id"] == session_id)
    assert matching["is_complete"] is True


def test_content_block_reference_links_are_serialized(app, client):
    with app.app_context():
        seed_all()
        section = Section.query.filter_by(slug="browser-rendering").first()
        learning_session = section.learning_sessions[0]
        block = learning_session.content_blocks[0]
        block.reference_links = [
            {"label": "MDN: Critical rendering path", "url": "https://example.com/mdn-crp"}
        ]
        db.session.commit()
        session_id = learning_session.id
        block_id = block.id

    response = client.get(f"/api/v1/learning-sessions/{session_id}")
    body = response.get_json()

    matching = next(b for b in body["content_blocks"] if b["id"] == block_id)
    assert matching["reference_links"] == [
        {"label": "MDN: Critical rendering path", "url": "https://example.com/mdn-crp"}
    ]

    other_block = next(b for b in body["content_blocks"] if b["id"] != block_id)
    assert other_block["reference_links"] == []


def test_get_learning_session_404_for_missing_id(client):
    response = client.get("/api/v1/learning-sessions/999")

    assert response.status_code == 404
    assert response.get_json()["error"] == "Learning session not found"


def test_block_scoped_exercise_nests_under_its_block_not_the_session(app, client):
    with app.app_context():
        seed_all()
        section = Section.query.filter_by(slug="browser-rendering").first()
        learning_session = section.learning_sessions[0]
        session_id = learning_session.id
        second_block = learning_session.content_blocks[1]

        db.session.add(
            Exercise(
                learning_session_id=learning_session.id,
                content_block_id=second_block.id,
                type="multiple_choice",
                sequence=1,
                prompt="Pinned to a slide?",
                definition_json={
                    "options": ["Yes", "No"],
                    "correct_index": 0,
                    "explanation": "Yes.",
                },
            )
        )
        db.session.commit()
        second_block_id = second_block.id

    response = client.get(f"/api/v1/learning-sessions/{session_id}")
    body = response.get_json()

    block_with_exercise = next(b for b in body["content_blocks"] if b["id"] == second_block_id)
    assert len(block_with_exercise["exercises"]) == 1
    assert block_with_exercise["exercises"][0]["prompt"] == "Pinned to a slide?"

    other_blocks = [b for b in body["content_blocks"] if b["id"] != second_block_id]
    assert all(b["exercises"] == [] for b in other_blocks)

    # The original session-level exercise is unaffected and still shows
    # up in the lesson-level wrap-up list, not duplicated into a block.
    assert len(body["exercises"]) == 1


def test_code_exercise_summary_never_leaks_hidden_expected_output(app, client):
    with app.app_context():
        seed_all()
        section = Section.query.filter_by(slug="01-data-structures").first()
        session_id = section.learning_sessions[0].id

    response = client.get(f"/api/v1/learning-sessions/{session_id}")
    body = response.get_json()

    block_exercises = [e for b in body["content_blocks"] for e in b["exercises"]]
    code_exercises = [e for e in block_exercises if e["type"] == "code"]
    assert len(code_exercises) == 2

    for exercise in code_exercises:
        assert "starter_code" in exercise
        assert "function_name" in exercise
        for case in exercise["visible_test_cases"]:
            assert "expected_output" in case
        for case in exercise["hidden_test_cases"]:
            assert "expected_output" not in case
            assert "input" in case


def test_get_learning_session_query_count_is_bounded(app, client, count_queries):
    """Regression test for the N+1 fix: content_blocks -> (note,
    exercises) fan-out must not scale with the number of content blocks.
    """
    with app.app_context():
        seed_all()
        section = Section.query.filter_by(slug="70-ai-assisted-software-development").first()
        session_id = section.learning_sessions[0].id

    with count_queries() as counter:
        response = client.get(f"/api/v1/learning-sessions/{session_id}")

    assert response.status_code == 200
    assert counter["n"] < 10
