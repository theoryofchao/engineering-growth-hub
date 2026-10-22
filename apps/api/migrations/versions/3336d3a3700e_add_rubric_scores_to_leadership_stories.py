"""add rubric_scores to leadership_stories

Revision ID: 3336d3a3700e
Revises: 2870aabc6fe0
Create Date: 2026-10-22 23:17:26.175048

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "3336d3a3700e"
down_revision = "2870aabc6fe0"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("leadership_stories", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column("rubric_scores", sa.JSON(), nullable=False, server_default=sa.text("'{}'"))
        )


def downgrade():
    with op.batch_alter_table("leadership_stories", schema=None) as batch_op:
        batch_op.drop_column("rubric_scores")
