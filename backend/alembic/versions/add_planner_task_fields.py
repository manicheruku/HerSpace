"""add planner scheduling columns to tasks

Revision ID: add_planner_task_fields
Revises: create_quotes_table
Create Date: 2026-07-02 09:00:00.000000
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_planner_task_fields'
down_revision: str | None = 'create_quotes_table'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    with op.batch_alter_table('tasks', schema=None) as batch_op:
        batch_op.add_column(sa.Column('due_date', sa.Date(), nullable=True))
        batch_op.add_column(sa.Column('due_time', sa.Time(), nullable=True))
        batch_op.add_column(sa.Column('category', sa.String(length=50), nullable=True))
        batch_op.add_column(
            sa.Column('reminder_at', sa.DateTime(timezone=True), nullable=True)
        )
        batch_op.create_index(
            batch_op.f('ix_tasks_due_date'), ['due_date'], unique=False
        )


def downgrade() -> None:
    with op.batch_alter_table('tasks', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_tasks_due_date'))
        batch_op.drop_column('reminder_at')
        batch_op.drop_column('category')
        batch_op.drop_column('due_time')
        batch_op.drop_column('due_date')
