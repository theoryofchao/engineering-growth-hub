"""rename topic hierarchy for clearer routing

Renames the curriculum hierarchy so the names match how learners
actually talk about it and so routes built from them read clearly:

    old Domain -> Topic   (e.g. "Computer Science Foundations")
    old Topic  -> Section (e.g. "AI-Assisted Software Development")
    Module stays Module (an internal, currently-unexposed grouping
    layer between Topic and Section -- see models.py and
    docs/decisions/0027-topic-section-module-rename-and-routing.md)

This is a rename, not a restructure: every FK edge keeps pointing at
the same rows, only table/column names and the new `topics.slug`
column change. All existing data (notes, study sessions, progress,
leadership stories) is preserved.

Revision ID: 568f571b1e73
Revises: 2e5647ba1806
Create Date: 2026-10-20 10:00:00.000000

"""

import re

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "568f571b1e73"
down_revision = "2e5647ba1806"
branch_labels = None
depends_on = None


def _slugify(text: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return re.sub(r"-{2,}", "-", slug)


def upgrade():
    # Old "topics" must move out of the way before "domains" can take
    # that name -- a straight A->B, B->C chain, not a cycle, so no
    # temporary name is needed as long as this runs in this order.
    op.rename_table("topics", "sections")
    op.rename_table("domains", "topics")
    op.rename_table("topic_prerequisites", "section_prerequisites")

    op.add_column("topics", sa.Column("slug", sa.String(length=200), nullable=True))
    connection = op.get_bind()
    for topic_id, name in connection.execute(sa.text("SELECT id, name FROM topics")):
        connection.execute(
            sa.text("UPDATE topics SET slug = :slug WHERE id = :id"),
            {"slug": _slugify(name), "id": topic_id},
        )
    with op.batch_alter_table("topics", schema=None) as batch_op:
        batch_op.alter_column("slug", nullable=False)
        batch_op.create_unique_constraint("uq_topics_slug", ["slug"])

    op.alter_column("modules", "domain_id", new_column_name="topic_id")
    # sections.module_id is unchanged -- Module kept its name, so this FK
    # column already has the right name after the table rename above.
    op.alter_column("section_prerequisites", "topic_id", new_column_name="section_id")
    op.alter_column(
        "section_prerequisites",
        "prerequisite_topic_id",
        new_column_name="prerequisite_section_id",
    )
    op.alter_column("learning_sessions", "topic_id", new_column_name="section_id")
    op.alter_column("user_progress", "topic_id", new_column_name="section_id")
    op.alter_column("leadership_stories", "topic_id", new_column_name="section_id")

    op.execute("ALTER TABLE modules RENAME CONSTRAINT uq_module_domain_title TO uq_module_topic_title")
    op.execute("ALTER TABLE sections RENAME CONSTRAINT ck_topic_tier TO ck_section_tier")
    op.execute(
        "ALTER TABLE section_prerequisites RENAME CONSTRAINT "
        "ck_topic_prerequisites_no_self_reference TO ck_section_prerequisites_no_self_reference"
    )


def downgrade():
    op.execute(
        "ALTER TABLE section_prerequisites RENAME CONSTRAINT "
        "ck_section_prerequisites_no_self_reference TO ck_topic_prerequisites_no_self_reference"
    )
    op.execute("ALTER TABLE sections RENAME CONSTRAINT ck_section_tier TO ck_topic_tier")
    op.execute("ALTER TABLE modules RENAME CONSTRAINT uq_module_topic_title TO uq_module_domain_title")

    op.alter_column("leadership_stories", "section_id", new_column_name="topic_id")
    op.alter_column("user_progress", "section_id", new_column_name="topic_id")
    op.alter_column("learning_sessions", "section_id", new_column_name="topic_id")
    op.alter_column(
        "section_prerequisites",
        "prerequisite_section_id",
        new_column_name="prerequisite_topic_id",
    )
    op.alter_column("section_prerequisites", "section_id", new_column_name="topic_id")
    op.alter_column("modules", "topic_id", new_column_name="domain_id")

    with op.batch_alter_table("topics", schema=None) as batch_op:
        batch_op.drop_constraint("uq_topics_slug", type_="unique")
        batch_op.drop_column("slug")

    op.rename_table("section_prerequisites", "topic_prerequisites")
    op.rename_table("topics", "domains")
    op.rename_table("sections", "topics")
