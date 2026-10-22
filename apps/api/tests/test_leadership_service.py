import pytest

from app.models import BehavioralQuestion, Section
from app.seed import seed_all
from app.services import leadership_service


def test_list_competencies_returns_leadership_sections_in_id_order(app):
    with app.app_context():
        seed_all()

        competencies = leadership_service.list_competencies()

        assert [c.id for c in competencies] == [76, 77, 78, 79, 80]


def test_create_story_raises_value_error_for_blank_required_field(app):
    with app.app_context():
        seed_all()
        section_id = Section.query.filter_by(slug="76-technical-leadership").first().id

        with pytest.raises(ValueError, match="task"):
            leadership_service.create_story(
                section_id=section_id,
                title="t",
                situation="s",
                task="   ",
                action="a",
                result="r",
            )


def test_create_story_raises_value_error_for_invalid_competency(app):
    with app.app_context():
        seed_all()
        non_leadership_section = Section.query.filter_by(slug="browser-rendering").first()

        with pytest.raises(ValueError, match="competencies"):
            leadership_service.create_story(
                section_id=non_leadership_section.id,
                title="t",
                situation="s",
                task="t",
                action="a",
                result="r",
            )


def test_update_story_returns_none_for_missing_id(app):
    with app.app_context():
        seed_all()
        assert leadership_service.update_story(999999, title="x") is None


def test_delete_story_returns_false_for_missing_id(app):
    with app.app_context():
        seed_all()
        assert leadership_service.delete_story(999999) is False


def test_create_question_raises_value_error_for_blank_prompt(app):
    with app.app_context():
        seed_all()
        section_id = Section.query.filter_by(slug="76-technical-leadership").first().id

        with pytest.raises(ValueError, match="prompt"):
            leadership_service.create_question(section_id=section_id, prompt="   ")


def test_create_question_raises_value_error_for_invalid_competency(app):
    with app.app_context():
        seed_all()
        non_leadership_section = Section.query.filter_by(slug="browser-rendering").first()

        with pytest.raises(ValueError, match="competencies"):
            leadership_service.create_question(
                section_id=non_leadership_section.id, prompt="A question"
            )


def test_delete_question_returns_false_for_missing_id(app):
    with app.app_context():
        seed_all()
        assert leadership_service.delete_question(999999) is False


def test_delete_question_raises_value_error_for_seeded_question(app):
    with app.app_context():
        seed_all()
        seeded = BehavioralQuestion.query.filter_by(source="seed").first()

        with pytest.raises(ValueError, match="seeded"):
            leadership_service.delete_question(seeded.id)


def test_compute_overall_score_none_when_not_all_dimensions_scored():
    assert leadership_service.compute_overall_score({}) is None
    assert leadership_service.compute_overall_score({"clarity": 5}) is None


def test_compute_overall_score_averages_once_fully_scored():
    full_scores = {
        "clarity": 4,
        "specificity": 2,
        "quantified_result": 5,
        "relevance": 3,
        "reflection_growth": 1,
    }
    assert leadership_service.compute_overall_score(full_scores) == 3.0


def test_create_story_raises_value_error_for_unknown_rubric_dimension(app):
    with app.app_context():
        seed_all()
        section_id = Section.query.filter_by(slug="76-technical-leadership").first().id

        with pytest.raises(ValueError, match="unknown rubric dimension"):
            leadership_service.create_story(
                section_id=section_id,
                title="t",
                situation="s",
                task="t",
                action="a",
                result="r",
                rubric_scores={"not_real": 3},
            )
