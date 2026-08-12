"""Notes business logic.

Keeps ownership enforcement and persistence orchestration out of the router so
endpoints stay thin and the domain rules stay testable.
"""

from sqlalchemy.orm import Session

from app.models.note import Note
from app.models.user import User
from app.repositories.note import NoteRepository
from app.schemas.note import NoteCreate, NoteSummary, NoteUpdate

#: Character length of the preview snippet surfaced to Explore / search.
PREVIEW_LENGTH = 140


class NoteNotFoundError(Exception):
    """Raised when a note does not exist or is not owned by the user."""


def _preview(content: str) -> str:
    collapsed = " ".join(content.split())
    if len(collapsed) <= PREVIEW_LENGTH:
        return collapsed
    return collapsed[:PREVIEW_LENGTH].rstrip() + "…"


def list_notes(
    db: Session,
    user: User,
    *,
    pinned: bool | None = None,
    tag: str | None = None,
    query: str | None = None,
    limit: int = 100,
    offset: int = 0,
) -> list[Note]:
    return NoteRepository(db).list_for_user(
        user.id, pinned=pinned, tag=tag, query=query, limit=limit, offset=offset
    )


def get_note(db: Session, user: User, note_id: int) -> Note:
    note = NoteRepository(db).get_for_user(note_id, user.id)
    if note is None:
        raise NoteNotFoundError(note_id)
    return note


def create_note(db: Session, user: User, data: NoteCreate) -> Note:
    return NoteRepository(db).create_for_user(user.id, data)


def update_note(db: Session, user: User, note_id: int, data: NoteUpdate) -> Note:
    repo = NoteRepository(db)
    note = repo.get_for_user(note_id, user.id)
    if note is None:
        raise NoteNotFoundError(note_id)
    return repo.apply_update(note, data)


def toggle_pinned(db: Session, user: User, note_id: int) -> Note:
    repo = NoteRepository(db)
    note = repo.get_for_user(note_id, user.id)
    if note is None:
        raise NoteNotFoundError(note_id)
    return repo.apply_update(note, NoteUpdate(is_pinned=not note.is_pinned))


def delete_note(db: Session, user: User, note_id: int) -> None:
    repo = NoteRepository(db)
    note = repo.get_for_user(note_id, user.id)
    if note is None:
        raise NoteNotFoundError(note_id)
    repo.delete(note)


def get_summary(db: Session, user: User) -> NoteSummary:
    """Build the compact summary that powers the Explore Notes card."""
    repo = NoteRepository(db)
    latest = repo.latest_for_user(user.id)
    return NoteSummary(
        count=repo.count_for_user(user.id),
        pinned_count=repo.count_pinned(user.id),
        last_updated=latest.updated_at if latest else None,
        latest_title=latest.title if latest else None,
        latest_preview=_preview(latest.content) if latest else None,
    )
