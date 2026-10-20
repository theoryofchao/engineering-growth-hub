"""add examples to content blocks

Revision ID: 2e5647ba1806
Revises: 4b1ad78809eb
Create Date: 2026-10-20 01:31:58.220780

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "2e5647ba1806"
down_revision = "4b1ad78809eb"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("content_blocks", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column(
                "examples", sa.JSON(), nullable=False, server_default=sa.text("'[]'")
            )
        )


def downgrade():
    with op.batch_alter_table("content_blocks", schema=None) as batch_op:
        batch_op.drop_column("examples")
