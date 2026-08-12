"""create goals table

Revision ID: create_goals
Revises: create_habits
Create Date: 2026-07-02 15:00:00.000000
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'create_goals'
down_revision: str | None = 'create_habits'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        'goals',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('unit', sa.String(length=40), nullable=True),
        sa.Column('target_value', sa.Integer(), server_default='1', nullable=False),
        sa.Column('current_value', sa.Integer(), server_default='0', nullable=False),
        sa.Column('due_date', sa.Date(), nullable=True),
        sa.Column('is_completed', sa.Boolean(), server_default='0', nullable=False),
        sa.Column('is_archived', sa.Boolean(), server_default='0', nullable=False),
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
    op.create_index(op.f('ix_goals_user_id'), 'goals', ['user_id'], unique=False)
    op.create_index(op.f('ix_goals_is_archived'), 'goals', ['is_archived'], unique=False)
    op.create_index(op.f('ix_goals_is_completed'), 'goals', ['is_completed'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_goals_is_completed'), table_name='goals')
    op.drop_index(op.f('ix_goals_is_archived'), table_name='goals')
    op.drop_index(op.f('ix_goals_user_id'), table_name='goals')
    op.drop_table('goals')
