"""Task ORM model shared by the Today and Planner modules."""

from datetime import date, datetime, time

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, String, Text, Time
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.base import IntIDMixin, TimestampMixin


class Task(IntIDMixin, TimestampMixin, Base):
    """A user-owned to-do item.

    ``priority`` is stored as a small string (not a native SQL enum) so the same
    schema works on both SQLite and PostgreSQL without enum-type migrations; the
    allowed values are validated by the Pydantic schemas.

    The scheduling columns (``due_date``, ``due_time``, ``category`` and
    ``reminder_at``) are all nullable so unscheduled Today tasks remain valid;
    the Planner module uses them to build the daily timeline and filters.
    """

    __tablename__ = "tasks"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    priority: Mapped[str] = mapped_column(
        String(10), default="medium", server_default="medium", nullable=False
    )
    is_completed: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default="0", nullable=False
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    position: Mapped[int] = mapped_column(
        Integer, default=0, server_default="0", nullable=False
    )

    # Scheduling fields used by the Planner module.
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True, index=True)
    due_time: Mapped[time | None] = mapped_column(Time, nullable=True)
    category: Mapped[str | None] = mapped_column(String(50), nullable=True)
    reminder_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
