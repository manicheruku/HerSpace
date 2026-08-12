"""Goal ORM model for the Goals module."""

from datetime import date

from sqlalchemy import Boolean, Date, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.base import IntIDMixin, TimestampMixin


class Goal(IntIDMixin, TimestampMixin, Base):
    """A user-owned measurable goal.

    Goals track progress as ``current_value / target_value``. ``is_completed`` is
    explicit so users can mark completion even for non-numeric goals, while
    numeric progress still powers Explore stats and list visuals.
    """

    __tablename__ = "goals"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    unit: Mapped[str | None] = mapped_column(String(40), nullable=True)
    target_value: Mapped[int] = mapped_column(
        Integer, default=1, server_default="1", nullable=False
    )
    current_value: Mapped[int] = mapped_column(
        Integer, default=0, server_default="0", nullable=False
    )
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    is_completed: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default="0", nullable=False, index=True
    )
    is_archived: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default="0", nullable=False, index=True
    )
