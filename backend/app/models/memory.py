"""Memory ORM model for the Memories module."""

from sqlalchemy import Boolean, Date, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.base import IntIDMixin, TimestampMixin


class Memory(IntIDMixin, TimestampMixin, Base):
    """A user-owned memory entry with optional mood and favorite marker."""

    __tablename__ = "memories"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    memory_on: Mapped[Date] = mapped_column(Date, index=True, nullable=False)
    mood: Mapped[str | None] = mapped_column(String(20), index=True, nullable=True)
    is_favorite: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default="0", nullable=False, index=True
    )
