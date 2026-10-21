"""add 'code' to exercises.type check constraint

Revision ID: e47746f88a8c
Revises: 568f571b1e73
Create Date: 2026-10-20 12:00:00.000000

"""

from alembic import op

# revision identifiers, used by Alembic.
revision = "e47746f88a8c"
down_revision = "568f571b1e73"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("exercises", schema=None) as batch_op:
        batch_op.drop_constraint("ck_exercise_type", type_="check")
        batch_op.create_check_constraint("ck_exercise_type", "type in ('multiple_choice', 'code')")


def downgrade():
    with op.batch_alter_table("exercises", schema=None) as batch_op:
        batch_op.drop_constraint("ck_exercise_type", type_="check")
        batch_op.create_check_constraint("ck_exercise_type", "type in ('multiple_choice')")
