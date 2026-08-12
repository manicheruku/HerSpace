"""Note ORM model for the Notes module."""

from sqlalchemy import Boolean, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import JSON

from app.core.database import Base
from app.models.base import IntIDMixin, TimestampMixin


class Note(IntIDMixin, TimestampMixin, Base):
    """A user-owned note.

    Notes are lighter-weight than journal entries: they support pinning (to keep
    important notes at the top) and an optional ``color`` label for visual
    grouping. ``color`` and ``tags`` are validated by the Pydantic schemas rather
    than SQL enums so the schema stays portable across SQLite and PostgreSQL.

    ``created_at`` / ``updated_at`` (from :class:`TimestampMixin`) serve as the
    note's created and last-edited timestamps.
    """

    __tablename__ = "notes"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    color: Mapped[str | None] = mapped_column(String(20), nullable=True)
    tags: Mapped[list[str]] = mapped_column(
        JSON, default=list, server_default="[]", nullable=False
    )
    is_pinned: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default="0", nullable=False, index=True
    )
