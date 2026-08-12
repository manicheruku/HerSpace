"""create expenses table

Revision ID: create_expenses
Revises: create_goals
Create Date: 2026-07-02 16:00:00.000000
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'create_expenses'
down_revision: str | None = 'create_goals'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        'expenses',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('amount_cents', sa.Integer(), server_default='0', nullable=False),
        sa.Column('category', sa.String(length=30), nullable=False),
        sa.Column('spent_on', sa.Date(), nullable=False),
        sa.Column('note', sa.Text(), nullable=True),
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
    op.create_index(op.f('ix_expenses_user_id'), 'expenses', ['user_id'], unique=False)
    op.create_index(op.f('ix_expenses_category'), 'expenses', ['category'], unique=False)
    op.create_index(op.f('ix_expenses_spent_on'), 'expenses', ['spent_on'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_expenses_spent_on'), table_name='expenses')
    op.drop_index(op.f('ix_expenses_category'), table_name='expenses')
    op.drop_index(op.f('ix_expenses_user_id'), table_name='expenses')
    op.drop_table('expenses')
