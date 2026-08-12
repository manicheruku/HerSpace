"""Water tracker ORM model for the Today module."""

from datetime import date

from sqlalchemy import Date, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.base import IntIDMixin, TimestampMixin


class WaterLog(IntIDMixin, TimestampMixin, Base):
    """A single day's water intake for a user.

    Exactly one row exists per user per day (enforced by a unique constraint),
    so history is preserved automatically: "resetting for a new day" simply means
    a new dated row is created; past days are never deleted or overwritten.
    """

    __tablename__ = "water_logs"

    __table_args__ = (
        UniqueConstraint("user_id", "log_date", name="uq_water_user_date"),
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    log_date: Mapped[date] = mapped_column(Date, nullable=False)
    glasses: Mapped[int] = mapped_column(
        Integer, default=0, server_default="0", nullable=False
    )
    goal: Mapped[int] = mapped_column(
        Integer, default=8, server_default="8", nullable=False
    )
