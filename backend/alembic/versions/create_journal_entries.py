"""create journal_entries table

Revision ID: create_journal_entries
Revises: add_planner_task_fields
Create Date: 2026-07-02 10:00:00.000000
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'create_journal_entries'
down_revision: str | None = 'add_planner_task_fields'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        'journal_entries',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('mood', sa.String(length=20), nullable=True),
        sa.Column(
            'tags', sa.JSON(), server_default='[]', nullable=False
        ),
        sa.Column(
            'is_favorite',
            sa.Boolean(),
            server_default='0',
            nullable=False,
        ),
        sa.Column(
            'created_at',
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            'updated_at',
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(
        op.f('ix_journal_entries_user_id'), 'journal_entries', ['user_id'], unique=False
    )
    op.create_index(
        op.f('ix_journal_entries_is_favorite'),
        'journal_entries',
        ['is_favorite'],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f('ix_journal_entries_is_favorite'), table_name='journal_entries')
    op.drop_index(op.f('ix_journal_entries_user_id'), table_name='journal_entries')
    op.drop_table('journal_entries')
