"""create notes table

Revision ID: create_notes
Revises: create_journal_entries
Create Date: 2026-07-02 12:00:00.000000
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'create_notes'
down_revision: str | None = 'create_journal_entries'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        'notes',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('color', sa.String(length=20), nullable=True),
        sa.Column('tags', sa.JSON(), server_default='[]', nullable=False),
        sa.Column(
            'is_pinned',
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
        op.f('ix_notes_user_id'), 'notes', ['user_id'], unique=False
    )
    op.create_index(
        op.f('ix_notes_is_pinned'), 'notes', ['is_pinned'], unique=False
    )


def downgrade() -> None:
    op.drop_index(op.f('ix_notes_is_pinned'), table_name='notes')
    op.drop_index(op.f('ix_notes_user_id'), table_name='notes')
    op.drop_table('notes')
