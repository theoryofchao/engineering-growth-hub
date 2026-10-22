"""add block_completions table

Revision ID: 6f7371823939
Revises: e47746f88a8c
Create Date: 2026-10-22 19:44:59.889699

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "6f7371823939"
down_revision = "e47746f88a8c"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "block_completions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("content_block_id", sa.Integer(), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["content_block_id"], ["content_blocks.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("content_block_id"),
    )


def downgrade():
    op.drop_table("block_completions")
