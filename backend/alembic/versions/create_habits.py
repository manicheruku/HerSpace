"""create habits and habit_checkins tables

Revision ID: create_habits
Revises: create_notes
Create Date: 2026-07-02 14:00:00.000000
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'create_habits'
down_revision: str | None = 'create_notes'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        'habits',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=120), nullable=False),
        sa.Column('emoji', sa.String(length=20), nullable=True),
        sa.Column('color', sa.String(length=20), nullable=True),
        sa.Column(
            'is_archived',
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
    op.create_index(op.f('ix_habits_user_id'), 'habits', ['user_id'], unique=False)
    op.create_index(
        op.f('ix_habits_is_archived'), 'habits', ['is_archived'], unique=False
    )

    op.create_table(
        'habit_checkins',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('habit_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('checkin_date', sa.Date(), nullable=False),
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
        sa.ForeignKeyConstraint(['habit_id'], ['habits.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint(
            'habit_id', 'checkin_date', name='uq_habit_checkin_date'
        ),
    )
    op.create_index(
        op.f('ix_habit_checkins_habit_id'),
        'habit_checkins',
        ['habit_id'],
        unique=False,
    )
    op.create_index(
        op.f('ix_habit_checkins_user_id'),
        'habit_checkins',
        ['user_id'],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        op.f('ix_habit_checkins_user_id'), table_name='habit_checkins'
    )
    op.drop_index(
        op.f('ix_habit_checkins_habit_id'), table_name='habit_checkins'
    )
    op.drop_table('habit_checkins')
    op.drop_index(op.f('ix_habits_is_archived'), table_name='habits')
    op.drop_index(op.f('ix_habits_user_id'), table_name='habits')
    op.drop_table('habits')
