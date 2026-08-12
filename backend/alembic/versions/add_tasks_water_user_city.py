"""add tasks, water_logs and users.city

Revision ID: add_tasks_water_user_city
Revises: 9e84a1658940
Create Date: 2026-06-30 23:10:00.000000
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_tasks_water_user_city'
down_revision: str | None = '9e84a1658940'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        'tasks',
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column(
            'priority',
            sa.String(length=10),
            server_default='medium',
            nullable=False,
        ),
        sa.Column(
            'is_completed',
            sa.Boolean(),
            server_default=sa.false(),
            nullable=False,
        ),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('position', sa.Integer(), server_default='0', nullable=False),
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column(
            'created_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('(CURRENT_TIMESTAMP)'),
            nullable=False,
        ),
        sa.Column(
            'updated_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('(CURRENT_TIMESTAMP)'),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ['user_id'], ['users.id'], ondelete='CASCADE'
        ),
        sa.PrimaryKeyConstraint('id'),
    )
    with op.batch_alter_table('tasks', schema=None) as batch_op:
        batch_op.create_index(
            batch_op.f('ix_tasks_user_id'), ['user_id'], unique=False
        )

    op.create_table(
        'water_logs',
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('log_date', sa.Date(), nullable=False),
        sa.Column('glasses', sa.Integer(), server_default='0', nullable=False),
        sa.Column('goal', sa.Integer(), server_default='8', nullable=False),
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column(
            'created_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('(CURRENT_TIMESTAMP)'),
            nullable=False,
        ),
        sa.Column(
            'updated_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('(CURRENT_TIMESTAMP)'),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ['user_id'], ['users.id'], ondelete='CASCADE'
        ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'log_date', name='uq_water_user_date'),
    )
    with op.batch_alter_table('water_logs', schema=None) as batch_op:
        batch_op.create_index(
            batch_op.f('ix_water_logs_user_id'), ['user_id'], unique=False
        )

    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(
            sa.Column(
                'city',
                sa.String(length=80),
                server_default='Pune',
                nullable=False,
            )
        )


def downgrade() -> None:
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('city')

    with op.batch_alter_table('water_logs', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_water_logs_user_id'))
    op.drop_table('water_logs')

    with op.batch_alter_table('tasks', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_tasks_user_id'))
    op.drop_table('tasks')
