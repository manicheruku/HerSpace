"""Habit and check-in ORM models for the Habits module."""

from datetime import date

from sqlalchemy import Boolean, Date, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import IntIDMixin, TimestampMixin


class Habit(IntIDMixin, TimestampMixin, Base):
    """A daily habit a user wants to build.

    Habits are intentionally simple: each is a daily target. Progress is tracked
    by :class:`HabitCheckin` rows (one per day completed), so streaks and history
    are derived rather than stored — no denormalised counters to keep in sync.

    ``color`` is validated by the Pydantic schema (not a SQL enum) so the table
    stays portable across SQLite and PostgreSQL.
    """

    __tablename__ = "habits"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    emoji: Mapped[str | None] = mapped_column(String(20), nullable=True)
    color: Mapped[str | None] = mapped_column(String(20), nullable=True)
    is_archived: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default="0", nullable=False, index=True
    )

    checkins: Mapped[list["HabitCheckin"]] = relationship(
        back_populates="habit",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class HabitCheckin(IntIDMixin, TimestampMixin, Base):
    """A single day on which a habit was completed.

    At most one row exists per habit per day (enforced by a unique constraint),
    so toggling a day is idempotent and history is never overwritten.
    """

    __tablename__ = "habit_checkins"

    __table_args__ = (
        UniqueConstraint("habit_id", "checkin_date", name="uq_habit_checkin_date"),
    )

    habit_id: Mapped[int] = mapped_column(
        ForeignKey("habits.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    checkin_date: Mapped[date] = mapped_column(Date, nullable=False)

    habit: Mapped["Habit"] = relationship(back_populates="checkins")
