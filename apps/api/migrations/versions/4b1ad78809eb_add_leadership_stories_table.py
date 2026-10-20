"""add leadership_stories table

Revision ID: 4b1ad78809eb
Revises: 02874d94e932
Create Date: 2026-10-19 05:28:54.868140

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "4b1ad78809eb"
down_revision = "02874d94e932"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "leadership_stories",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("topic_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("situation", sa.Text(), nullable=False),
        sa.Column("task", sa.Text(), nullable=False),
        sa.Column("action", sa.Text(), nullable=False),
        sa.Column("result", sa.Text(), nullable=False),
        sa.Column("reflection", sa.Text(), nullable=True),
        sa.Column("quantified_outcome", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["topic_id"], ["topics.id"], name="fk_leadership_stories_topic_id"),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade():
    op.drop_table("leadership_stories")
