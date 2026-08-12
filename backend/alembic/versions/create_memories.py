"""create memories table

Revision ID: create_memories
Revises: create_expenses
Create Date: 2026-07-02 20:00:00.000000
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "create_memories"
down_revision: str | None = "create_expenses"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "memories",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("memory_on", sa.Date(), nullable=False),
        sa.Column("mood", sa.String(length=20), nullable=True),
        sa.Column("is_favorite", sa.Boolean(), server_default="0", nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_memories_user_id"), "memories", ["user_id"], unique=False)
    op.create_index(op.f("ix_memories_memory_on"), "memories", ["memory_on"], unique=False)
    op.create_index(op.f("ix_memories_mood"), "memories", ["mood"], unique=False)
    op.create_index(op.f("ix_memories_is_favorite"), "memories", ["is_favorite"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_memories_is_favorite"), table_name="memories")
    op.drop_index(op.f("ix_memories_mood"), table_name="memories")
    op.drop_index(op.f("ix_memories_memory_on"), table_name="memories")
    op.drop_index(op.f("ix_memories_user_id"), table_name="memories")
    op.drop_table("memories")
