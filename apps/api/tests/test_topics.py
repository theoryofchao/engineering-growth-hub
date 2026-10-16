from app.seed import seed_all


def test_list_topics_includes_full_curriculum_breadth(app, client):
    with app.app_context():
        seed_all()

    response = client.get("/api/v1/topics")

    assert response.status_code == 200
    domains = response.get_json()
    assert len(domains) == 17  # 16 from the map + legacy "Frontend Engineering"

    all_topics = [topic for domain in domains for topic in domain["topics"]]
    assert len(all_topics) == 81

    by_slug = {t["slug"]: t for t in all_topics}
    assert by_slug["01-data-structures"]["has_content"] is False
    assert by_slug["01-data-structures"]["first_learning_session_id"] is None

    assert by_slug["browser-rendering"]["has_content"] is True
    assert by_slug["browser-rendering"]["first_learning_session_id"] is not None

    assert by_slug["70-ai-assisted-software-development"]["has_content"] is True
