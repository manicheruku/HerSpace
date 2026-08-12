"""Expense ORM model for the Expenses module."""

from datetime import date

from sqlalchemy import Date, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.base import IntIDMixin, TimestampMixin


class Expense(IntIDMixin, TimestampMixin, Base):
    """A user-owned expense record.

    Amount is stored as integer cents to avoid floating-point drift and keep
    calculations exact across SQLite and PostgreSQL.
    """

    __tablename__ = "expenses"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    amount_cents: Mapped[int] = mapped_column(
        Integer, default=0, server_default="0", nullable=False
    )
    category: Mapped[str] = mapped_column(String(30), nullable=False, index=True)
    spent_on: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
