"""create quotes table and seed motivational quotes

Revision ID: create_quotes_table
Revises: add_tasks_water_user_city
Create Date: 2026-07-01 09:00:00.000000
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'create_quotes_table'
down_revision: str | None = 'add_tasks_water_user_city'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        'quotes',
        sa.Column('text', sa.Text(), nullable=False),
        sa.Column('author', sa.String(length=100), nullable=True),
        sa.Column(
            'is_active',
            sa.Boolean(),
            server_default=sa.true(),
            nullable=False,
        ),
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
        sa.PrimaryKeyConstraint('id'),
    )

    quotes_table = sa.table(
        'quotes',
        sa.column('text', sa.Text),
        sa.column('author', sa.String),
        sa.column('is_active', sa.Boolean),
    )

    op.bulk_insert(
        quotes_table,
        [
            {'text': text, 'author': 'HerSpace', 'is_active': True}
            for text in (
                'You are exactly where you need to be.',
                "Breathe. You've got today.",
                'Small steps still move you forward.',
                'Be gentle with yourself today.',
                'Your pace is the right pace.',
                'Rest is productive too.',
                'You are allowed to take up space.',
                'Progress, not perfection.',
                'One kind thought at a time.',
                'You are stronger than you feel right now.',
                'Today is a fresh page.',
                'Let go of what you cannot carry.',
                'Your feelings are valid.',
                'You deserve the care you give others.',
                'Soft starts still count.',
                'You can begin again, anytime.',
            )
        ],
    )


def downgrade() -> None:
    op.drop_table('quotes')
