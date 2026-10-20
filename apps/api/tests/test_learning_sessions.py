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

    assert len(body["section_sessions"]) == 8
    sequences = [s["sequence"] for s in body["section_sessions"]]
    assert sequences == sorted(sequences)  # ordered, so nav renders in lesson order
    assert body["section_sessions"][0]["id"] == first_session_id


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
