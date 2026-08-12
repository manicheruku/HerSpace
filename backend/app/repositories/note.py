"""Persistence layer for :class:`~app.models.note.Note`."""

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.note import Note
from app.repositories.base import BaseRepository
from app.schemas.note import NoteCreate, NoteUpdate


class NoteRepository(BaseRepository[Note]):
    """Note-specific queries on top of the generic CRUD repository."""

    def __init__(self, db: Session) -> None:
        super().__init__(Note, db)

    def list_for_user(
        self,
        user_id: int,
        *,
        pinned: bool | None = None,
        tag: str | None = None,
        query: str | None = None,
        limit: int = 100,
        offset: int = 0,
    ) -> list[Note]:
        """Return a user's notes, pinned first then newest, with optional filters."""
        stmt = select(Note).where(Note.user_id == user_id)

        if pinned is not None:
            stmt = stmt.where(Note.is_pinned.is_(pinned))

        if query:
            pattern = f"%{query.replace('%', r'\%').replace('_', r'\_')}%"
            stmt = stmt.where(
                Note.title.ilike(pattern) | Note.content.ilike(pattern)
            )

        # Pinned notes float to the top, then most-recently updated.
        stmt = stmt.order_by(
            Note.is_pinned.desc(), Note.updated_at.desc(), Note.id.desc()
        )
        stmt = stmt.offset(offset).limit(limit)

        notes = list(self.db.scalars(stmt).all())

        # Tags live in a JSON column; filter in Python to stay portable across
        # SQLite and PostgreSQL (a JSONB containment query can replace this later).
        if tag:
            notes = [n for n in notes if tag in (n.tags or [])]
        return notes

    def get_for_user(self, note_id: int, user_id: int) -> Note | None:
        stmt = select(Note).where(Note.id == note_id, Note.user_id == user_id)
        return self.db.scalars(stmt).first()

    def create_for_user(self, user_id: int, data: NoteCreate) -> Note:
        note = Note(user_id=user_id, **data.model_dump())
        return self.create(note)

    def apply_update(self, note: Note, data: NoteUpdate) -> Note:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(note, field, value)
        return self.update(note)

    def count_for_user(self, user_id: int) -> int:
        stmt = select(func.count(Note.id)).where(Note.user_id == user_id)
        return int(self.db.scalar(stmt) or 0)

    def count_pinned(self, user_id: int) -> int:
        stmt = select(func.count(Note.id)).where(
            Note.user_id == user_id, Note.is_pinned.is_(True)
        )
        return int(self.db.scalar(stmt) or 0)

    def latest_for_user(self, user_id: int) -> Note | None:
        stmt = (
            select(Note)
            .where(Note.user_id == user_id)
            .order_by(Note.updated_at.desc(), Note.id.desc())
            .limit(1)
        )
        return self.db.scalars(stmt).first()
