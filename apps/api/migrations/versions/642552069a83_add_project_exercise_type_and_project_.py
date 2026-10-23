"""add project exercise type and project_progress table

Revision ID: 642552069a83
Revises: 3336d3a3700e
Create Date: 2026-10-23 05:41:04.195959

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "642552069a83"
down_revision = "3336d3a3700e"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "project_progress",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("exercise_id", sa.Integer(), nullable=False),
        sa.Column("checked_criteria", sa.JSON(), nullable=False, server_default=sa.text("'{}'")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["exercise_id"], ["exercises.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("exercise_id"),
    )

    with op.batch_alter_table("exercises", schema=None) as batch_op:
        batch_op.drop_constraint("ck_exercise_type", type_="check")
        batch_op.create_check_constraint(
            "ck_exercise_type", "type in ('multiple_choice', 'code', 'project')"
        )


def downgrade():
    with op.batch_alter_table("exercises", schema=None) as batch_op:
        batch_op.drop_constraint("ck_exercise_type", type_="check")
        batch_op.create_check_constraint("ck_exercise_type", "type in ('multiple_choice', 'code')")

    op.drop_table("project_progress")
