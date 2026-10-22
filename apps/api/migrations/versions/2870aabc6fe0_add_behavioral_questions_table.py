"""add behavioral_questions table

Revision ID: 2870aabc6fe0
Revises: 015ea01490d7
Create Date: 2026-10-22 22:06:39.513261

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "2870aabc6fe0"
down_revision = "015ea01490d7"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "behavioral_questions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("section_id", sa.Integer(), nullable=False),
        sa.Column("prompt", sa.Text(), nullable=False),
        sa.Column("source", sa.String(length=20), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("source in ('seed', 'custom')", name="ck_behavioral_question_source"),
        sa.ForeignKeyConstraint(["section_id"], ["sections.id"]),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade():
    op.drop_table("behavioral_questions")
