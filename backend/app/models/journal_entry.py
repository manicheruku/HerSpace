"""Journal entry ORM model for the Journal module."""

from sqlalchemy import Boolean, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import JSON

from app.core.database import Base
from app.models.base import IntIDMixin, TimestampMixin


class JournalEntry(IntIDMixin, TimestampMixin, Base):
    """A user-owned journal entry.

    ``mood`` reuses the small string vocabulary shared with the Today mood
    tracker (validated by the Pydantic schemas, not a SQL enum, so the schema is
    portable across SQLite and PostgreSQL). ``tags`` is a JSON array, which works
    identically on both backends and is ready for a native ``ARRAY``/``JSONB``
    upgrade on PostgreSQL without an API change. Attachments are intentionally
    not modelled yet; a future ``journal_attachments`` table will relate here.

    ``created_at`` / ``updated_at`` (from :class:`TimestampMixin`) serve as the
    entry's created and last-edited timestamps.
    """

    __tablename__ = "journal_entries"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    mood: Mapped[str | None] = mapped_column(String(20), nullable=True)
    tags: Mapped[list[str]] = mapped_column(
        JSON, default=list, server_default="[]", nullable=False
    )
    is_favorite: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default="0", nullable=False, index=True
    )
