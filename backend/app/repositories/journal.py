"""Persistence layer for :class:`~app.models.journal_entry.JournalEntry`."""

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.journal_entry import JournalEntry
from app.repositories.base import BaseRepository
from app.schemas.journal import JournalCreate, JournalUpdate


class JournalRepository(BaseRepository[JournalEntry]):
    """Journal-specific queries on top of the generic CRUD repository."""

    def __init__(self, db: Session) -> None:
        super().__init__(JournalEntry, db)

    def list_for_user(
        self,
        user_id: int,
        *,
        favorite: bool | None = None,
        tag: str | None = None,
        query: str | None = None,
        limit: int = 100,
        offset: int = 0,
    ) -> list[JournalEntry]:
        """Return a user's entries, newest first, with optional filters."""
        stmt = select(JournalEntry).where(JournalEntry.user_id == user_id)

        if favorite is not None:
            stmt = stmt.where(JournalEntry.is_favorite.is_(favorite))

        if query:
            pattern = f"%{query.replace('%', r'\%').replace('_', r'\_')}%"
            stmt = stmt.where(
                JournalEntry.title.ilike(pattern) | JournalEntry.content.ilike(pattern)
            )

        stmt = stmt.order_by(JournalEntry.updated_at.desc(), JournalEntry.id.desc())
        stmt = stmt.offset(offset).limit(limit)

        entries = list(self.db.scalars(stmt).all())

        # Tags live in a JSON column; filter in Python to stay portable across
        # SQLite and PostgreSQL (a JSONB containment query can replace this later).
        if tag:
            entries = [e for e in entries if tag in (e.tags or [])]
        return entries

    def get_for_user(self, entry_id: int, user_id: int) -> JournalEntry | None:
        stmt = select(JournalEntry).where(
            JournalEntry.id == entry_id, JournalEntry.user_id == user_id
        )
        return self.db.scalars(stmt).first()

    def create_for_user(self, user_id: int, data: JournalCreate) -> JournalEntry:
        entry = JournalEntry(user_id=user_id, **data.model_dump())
        return self.create(entry)

    def apply_update(self, entry: JournalEntry, data: JournalUpdate) -> JournalEntry:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(entry, field, value)
        return self.update(entry)

    def count_for_user(self, user_id: int) -> int:
        stmt = select(func.count(JournalEntry.id)).where(
            JournalEntry.user_id == user_id
        )
        return int(self.db.scalar(stmt) or 0)

    def count_favorites(self, user_id: int) -> int:
        stmt = select(func.count(JournalEntry.id)).where(
            JournalEntry.user_id == user_id, JournalEntry.is_favorite.is_(True)
        )
        return int(self.db.scalar(stmt) or 0)

    def latest_for_user(self, user_id: int) -> JournalEntry | None:
        stmt = (
            select(JournalEntry)
            .where(JournalEntry.user_id == user_id)
            .order_by(JournalEntry.updated_at.desc(), JournalEntry.id.desc())
            .limit(1)
        )
        return self.db.scalars(stmt).first()
