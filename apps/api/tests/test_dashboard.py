from app.models import Section
from app.seed import seed_all


def _browser_rendering_ids(app) -> dict:
    with app.app_context():
        seed_all()
        section = Section.query.filter_by(slug="browser-rendering").first()
        learning_session = section.learning_sessions[0]
        return {
            "section_id": section.id,
            "learning_session_id": learning_session.id,
            "exercise_id": learning_session.exercises[0].id,
        }


def test_dashboard_lists_only_sections_with_content(app, client):
    _browser_rendering_ids(app)

    response = client.get("/api/v1/dashboard/summary")

    assert response.status_code == 200
    body = response.get_json()
    slugs = {s["slug"] for s in body["sections"]}
    assert "browser-rendering" in slugs
    assert "01-data-structures" in slugs  # now has real lesson content
    assert "03-computer-architecture" in slugs  # now has real lesson content too
    assert "04-operating-systems" in slugs  # now has real lesson content too
    assert "05-computer-networking" not in slugs  # still WIP, no learning sessions


def test_dashboard_reflects_study_time_and_progress(app, client):
    ids = _browser_rendering_ids(app)

    client.post(
        "/api/v1/study-sessions",
        json={"learning_session_id": ids["learning_session_id"], "mode_minutes": 25},
    )
    client.post(f"/api/v1/exercises/{ids['exercise_id']}/submissions", json={"selected_index": 1})

    response = client.get("/api/v1/dashboard/summary")
    body = response.get_json()

    section_row = next(s for s in body["sections"] if s["slug"] == "browser-rendering")
    assert section_row["status"] == "practiced"
    assert section_row["exercises_attempted"] == 1
    assert section_row["exercises_correct"] == 1
    assert body["total_study_seconds"] >= 0


def test_dashboard_summary_query_count_is_bounded_not_linear_in_section_count(
    app, client, count_queries
):
    """Regression test for the N+1 fix: the old per-section UserProgress
    lookup plus lazy learning_sessions/exercises/submissions fan-out
    scaled with the number of sections-with-content; this must not.
    """
    _browser_rendering_ids(app)

    with count_queries() as counter:
        response = client.get("/api/v1/dashboard/summary")

    assert response.status_code == 200
    assert counter["n"] < 10
