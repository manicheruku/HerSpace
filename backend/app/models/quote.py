"""Quote ORM model for the Daily Message card."""

from sqlalchemy import Boolean, String, Text, true
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.base import IntIDMixin, TimestampMixin


class Quote(IntIDMixin, TimestampMixin, Base):
    """A short, warm motivational quote shown on the Daily Message card.

    Quotes are global (not user-owned) and are seeded via Alembic. ``is_active``
    lets an operator retire a quote without deleting it; only active quotes are
    eligible to be served.
    """

    __tablename__ = "quotes"

    text: Mapped[str] = mapped_column(Text, nullable=False)
    author: Mapped[str | None] = mapped_column(String(100), nullable=True)
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, server_default=true(), nullable=False
    )
