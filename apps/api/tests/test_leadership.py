from app.models import BehavioralQuestion, Section
from app.seed import seed_all


def _technical_leadership_id(app) -> int:
    with app.app_context():
        seed_all()
        section = Section.query.filter_by(slug="76-technical-leadership").first()
        return section.id


def test_list_competencies_returns_the_five_leadership_sections(app, client):
    with app.app_context():
        seed_all()

    response = client.get("/api/v1/leadership/competencies")

    assert response.status_code == 200
    competencies = response.get_json()
    assert len(competencies) == 5
    slugs = {c["slug"] for c in competencies}
    assert slugs == {
        "76-technical-leadership",
        "77-mentorship-team-development",
        "78-engineering-management-fundamentals",
        "79-engineering-economics",
        "80-engineering-strategy",
    }


def test_create_story_success(app, client):
    section_id = _technical_leadership_id(app)

    response = client.post(
        "/api/v1/leadership/stories",
        json={
            "section_id": section_id,
            "title": "Led the checkout latency incident response",
            "situation": "Checkout p99 latency spiked 5x during a flash sale.",
            "task": "I was the on-call lead and needed to restore service fast.",
            "action": "Coordinated a war room, rolled back a bad deploy, added a cache.",
            "result": "Latency returned to baseline within 20 minutes.",
        },
    )

    assert response.status_code == 201
    body = response.get_json()
    assert body["title"] == "Led the checkout latency incident response"
    assert body["competency"]["id"] == section_id
    assert body["reflection"] is None


def test_create_story_requires_star_fields(app, client):
    section_id = _technical_leadership_id(app)

    response = client.post(
        "/api/v1/leadership/stories",
        json={
            "section_id": section_id,
            "title": "Missing fields",
            "situation": "",
            "task": "t",
            "action": "a",
            "result": "r",
        },
    )

    assert response.status_code == 400
    assert "situation" in response.get_json()["error"]


def test_create_story_rejects_non_leadership_section(app, client):
    with app.app_context():
        seed_all()
        non_leadership_section = Section.query.filter_by(slug="browser-rendering").first()
        section_id = non_leadership_section.id

    response = client.post(
        "/api/v1/leadership/stories",
        json={
            "section_id": section_id,
            "title": "Wrong competency",
            "situation": "s",
            "task": "t",
            "action": "a",
            "result": "r",
        },
    )

    assert response.status_code == 400
    assert "competencies" in response.get_json()["error"]


def test_get_update_delete_story_roundtrip(app, client):
    section_id = _technical_leadership_id(app)

    create_response = client.post(
        "/api/v1/leadership/stories",
        json={
            "section_id": section_id,
            "title": "Original title",
            "situation": "s",
            "task": "t",
            "action": "a",
            "result": "r",
        },
    )
    story_id = create_response.get_json()["id"]

    get_response = client.get(f"/api/v1/leadership/stories/{story_id}")
    assert get_response.status_code == 200
    assert get_response.get_json()["title"] == "Original title"

    update_response = client.patch(
        f"/api/v1/leadership/stories/{story_id}",
        json={"title": "Updated title", "reflection": "Would automate the rollback next time."},
    )
    assert update_response.status_code == 200
    assert update_response.get_json()["title"] == "Updated title"
    assert update_response.get_json()["reflection"] == "Would automate the rollback next time."

    delete_response = client.delete(f"/api/v1/leadership/stories/{story_id}")
    assert delete_response.status_code == 204

    missing_response = client.get(f"/api/v1/leadership/stories/{story_id}")
    assert missing_response.status_code == 404


def test_list_stories_filters_by_competency_id(app, client):
    with app.app_context():
        seed_all()
        technical = Section.query.filter_by(slug="76-technical-leadership").first().id
        mentorship = Section.query.filter_by(slug="77-mentorship-team-development").first().id

    client.post(
        "/api/v1/leadership/stories",
        json={
            "section_id": technical,
            "title": "Technical story",
            "situation": "s",
            "task": "t",
            "action": "a",
            "result": "r",
        },
    )
    client.post(
        "/api/v1/leadership/stories",
        json={
            "section_id": mentorship,
            "title": "Mentorship story",
            "situation": "s",
            "task": "t",
            "action": "a",
            "result": "r",
        },
    )

    response = client.get(f"/api/v1/leadership/stories?competency_id={technical}")
    titles = [s["title"] for s in response.get_json()]
    assert titles == ["Technical story"]


def test_update_story_404_for_missing_id(client):
    response = client.patch("/api/v1/leadership/stories/999999", json={"title": "x"})
    assert response.status_code == 404


def test_delete_story_404_for_missing_id(client):
    response = client.delete("/api/v1/leadership/stories/999999")
    assert response.status_code == 404


def test_create_question_success(app, client):
    section_id = _technical_leadership_id(app)

    response = client.post(
        "/api/v1/leadership/questions",
        json={"section_id": section_id, "prompt": "Tell me about a tough technical call."},
    )

    assert response.status_code == 201
    body = response.get_json()
    assert body["prompt"] == "Tell me about a tough technical call."
    assert body["source"] == "custom"
    assert body["competency"]["id"] == section_id


def test_create_question_rejects_blank_prompt(app, client):
    section_id = _technical_leadership_id(app)

    response = client.post(
        "/api/v1/leadership/questions", json={"section_id": section_id, "prompt": "   "}
    )

    assert response.status_code == 400
    assert "prompt" in response.get_json()["error"]


def test_create_question_rejects_non_leadership_section(app, client):
    with app.app_context():
        seed_all()
        non_leadership_section = Section.query.filter_by(slug="browser-rendering").first()
        section_id = non_leadership_section.id

    response = client.post(
        "/api/v1/leadership/questions",
        json={"section_id": section_id, "prompt": "Wrong competency"},
    )

    assert response.status_code == 400
    assert "competencies" in response.get_json()["error"]


def test_list_questions_filters_by_competency_id(app, client):
    with app.app_context():
        seed_all()
        technical = Section.query.filter_by(slug="76-technical-leadership").first().id
        mentorship = Section.query.filter_by(slug="77-mentorship-team-development").first().id

    client.post(
        "/api/v1/leadership/questions",
        json={"section_id": technical, "prompt": "Technical question"},
    )
    client.post(
        "/api/v1/leadership/questions",
        json={"section_id": mentorship, "prompt": "Mentorship question"},
    )

    response = client.get(f"/api/v1/leadership/questions?competency_id={technical}")
    prompts = [q["prompt"] for q in response.get_json()]
    assert "Technical question" in prompts
    assert "Mentorship question" not in prompts


def test_get_and_delete_custom_question_roundtrip(app, client):
    section_id = _technical_leadership_id(app)

    create_response = client.post(
        "/api/v1/leadership/questions",
        json={"section_id": section_id, "prompt": "A custom question"},
    )
    question_id = create_response.get_json()["id"]

    get_response = client.get(f"/api/v1/leadership/questions/{question_id}")
    assert get_response.status_code == 200
    assert get_response.get_json()["prompt"] == "A custom question"

    delete_response = client.delete(f"/api/v1/leadership/questions/{question_id}")
    assert delete_response.status_code == 204

    missing_response = client.get(f"/api/v1/leadership/questions/{question_id}")
    assert missing_response.status_code == 404


def test_cannot_delete_a_seeded_question(app, client):
    with app.app_context():
        seed_all()
        seeded_question_id = BehavioralQuestion.query.filter_by(source="seed").first().id

    response = client.delete(f"/api/v1/leadership/questions/{seeded_question_id}")

    assert response.status_code == 400
    assert "seeded" in response.get_json()["error"]


def test_get_question_404_for_missing_id(client):
    response = client.get("/api/v1/leadership/questions/999999")
    assert response.status_code == 404


def test_delete_question_404_for_missing_id(client):
    response = client.delete("/api/v1/leadership/questions/999999")
    assert response.status_code == 404
