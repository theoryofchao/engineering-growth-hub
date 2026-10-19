import os
from contextlib import contextmanager

import pytest
from sqlalchemy import event

os.environ.setdefault("APP_ENV", "testing")

from app import create_app  # noqa: E402
from app.extensions import db  # noqa: E402


@pytest.fixture()
def app():
    app = create_app("testing")
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def count_queries(app):
    """Counts SQL statements executed on the app's engine while the
    returned context manager is active, regardless of which app/request
    context (if any) triggers them -- used to regression-test N+1 fixes:
    a query count should stay flat as seeded data grows, not scale with it.
    """
    with app.app_context():
        engine = db.engine

    @contextmanager
    def _count_queries():
        counter = {"n": 0}

        def _on_execute(*args, **kwargs):
            counter["n"] += 1

        event.listen(engine, "before_cursor_execute", _on_execute)
        try:
            yield counter
        finally:
            event.remove(engine, "before_cursor_execute", _on_execute)

    return _count_queries
