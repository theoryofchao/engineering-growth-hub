"""Read access to a learning session's full content, eager-loaded."""

from __future__ import annotations

from sqlalchemy.orm import joinedload, selectinload

from app.extensions import db
from app.models import ContentBlock, LearningSession, Topic


def get_detail(session_id: int) -> LearningSession | None:
    return db.session.get(
        LearningSession,
        session_id,
        options=[
            selectinload(LearningSession.content_blocks).options(
                selectinload(ContentBlock.exercises),
                joinedload(ContentBlock.note),
            ),
            selectinload(LearningSession.exercises),
            joinedload(LearningSession.topic).selectinload(Topic.learning_sessions),
        ],
    )
