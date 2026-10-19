"""add topic_prerequisites table

Revision ID: 02874d94e932
Revises: e79b2151626b
Create Date: 2026-10-18 18:39:03.040987

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "02874d94e932"
down_revision = "e79b2151626b"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "topic_prerequisites",
        sa.Column("topic_id", sa.Integer(), nullable=False),
        sa.Column("prerequisite_topic_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["topic_id"], ["topics.id"], name="fk_topic_prerequisites_topic_id"
        ),
        sa.ForeignKeyConstraint(
            ["prerequisite_topic_id"],
            ["topics.id"],
            name="fk_topic_prerequisites_prerequisite_topic_id",
        ),
        sa.PrimaryKeyConstraint("topic_id", "prerequisite_topic_id"),
        sa.CheckConstraint(
            "topic_id != prerequisite_topic_id", name="ck_topic_prerequisites_no_self_reference"
        ),
    )


def downgrade():
    op.drop_table("topic_prerequisites")
