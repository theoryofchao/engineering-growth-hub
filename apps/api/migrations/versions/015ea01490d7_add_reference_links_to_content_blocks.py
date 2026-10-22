"""add reference_links to content blocks

Revision ID: 015ea01490d7
Revises: 6f7371823939
Create Date: 2026-10-22 21:32:53.389982

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "015ea01490d7"
down_revision = "6f7371823939"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("content_blocks", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column("reference_links", sa.JSON(), nullable=False, server_default=sa.text("'[]'"))
        )


def downgrade():
    with op.batch_alter_table("content_blocks", schema=None) as batch_op:
        batch_op.drop_column("reference_links")
