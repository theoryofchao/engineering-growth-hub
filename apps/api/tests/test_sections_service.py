"""Unit tests for the sections service's lock/status computation, exercised
directly (no Flask request/response round-trip) now that it's a plain
function over ORM data rather than logic embedded in a route handler.
"""

from app.models import Section, UserProgress
from app.seed import seed_all
from app.services import sections_service


def test_compute_section_status_locked_when_prerequisites_unmet(app):
    with app.app_context():
        seed_all()
        section = Section.query.filter_by(slug="02-algorithms-problem-solving").first()

        status = sections_service.compute_section_status(section, dev_bypass=False)

        assert status.is_locked is True
        assert status.dev_bypassed is False
        assert status.status == "not_started"
        assert {p.section.slug for p in status.unmet_prerequisites} == {
            "01-data-structures",
            "06-mathematics-for-computing",
            "08-programming-fundamentals",
        }


def test_compute_section_status_unlocked_once_prerequisites_practiced(app):
    with app.app_context():
        seed_all()
        section = Section.query.filter_by(slug="02-algorithms-problem-solving").first()

        for slug in (
            "01-data-structures",
            "06-mathematics-for-computing",
            "08-programming-fundamentals",
        ):
            prereq = Section.query.filter_by(slug=slug).first()
            UserProgress.get_or_create(prereq.id).advance_to("practiced")

        status = sections_service.compute_section_status(section, dev_bypass=False)

        assert status.is_locked is False
        assert status.unmet_prerequisites == []


def test_compute_section_status_dev_bypass_unlocks_without_hiding_unmet_prerequisites(app):
    with app.app_context():
        seed_all()
        section = Section.query.filter_by(slug="02-algorithms-problem-solving").first()

        status = sections_service.compute_section_status(section, dev_bypass=True)

        assert status.is_locked is False
        assert status.dev_bypassed is True
        assert len(status.unmet_prerequisites) == 3


def test_compute_section_status_entry_point_section_is_never_locked(app):
    with app.app_context():
        seed_all()
        section = Section.query.filter_by(slug="08-programming-fundamentals").first()

        status = sections_service.compute_section_status(section, dev_bypass=False)

        assert status.is_locked is False
        assert status.prerequisites == []


def test_get_section_detail_returns_none_for_missing_slug(app):
    with app.app_context():
        seed_all()
        assert sections_service.get_section_detail("not-a-real-section", dev_bypass=False) is None
