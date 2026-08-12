"""Journal business logic.

Keeps ownership enforcement and persistence orchestration out of the router so
endpoints stay thin and the domain rules stay testable.
"""

from sqlalchemy.orm import Session

from app.models.journal_entry import JournalEntry
from app.models.user import User
from app.repositories.journal import JournalRepository
from app.schemas.journal import (
    JournalCreate,
    JournalSummary,
    JournalUpdate,
)

#: Character length of the preview snippet surfaced to Explore / search.
PREVIEW_LENGTH = 140


class JournalEntryNotFoundError(Exception):
    """Raised when an entry does not exist or is not owned by the user."""


def _preview(content: str) -> str:
    collapsed = " ".join(content.split())
    if len(collapsed) <= PREVIEW_LENGTH:
        return collapsed
    return collapsed[:PREVIEW_LENGTH].rstrip() + "…"


def list_entries(
    db: Session,
    user: User,
    *,
    favorite: bool | None = None,
    tag: str | None = None,
    query: str | None = None,
    limit: int = 100,
    offset: int = 0,
) -> list[JournalEntry]:
    return JournalRepository(db).list_for_user(
        user.id, favorite=favorite, tag=tag, query=query, limit=limit, offset=offset
    )


def get_entry(db: Session, user: User, entry_id: int) -> JournalEntry:
    entry = JournalRepository(db).get_for_user(entry_id, user.id)
    if entry is None:
        raise JournalEntryNotFoundError(entry_id)
    return entry


def create_entry(db: Session, user: User, data: JournalCreate) -> JournalEntry:
    return JournalRepository(db).create_for_user(user.id, data)


def update_entry(
    db: Session, user: User, entry_id: int, data: JournalUpdate
) -> JournalEntry:
    repo = JournalRepository(db)
    entry = repo.get_for_user(entry_id, user.id)
    if entry is None:
        raise JournalEntryNotFoundError(entry_id)
    return repo.apply_update(entry, data)


def toggle_favorite(db: Session, user: User, entry_id: int) -> JournalEntry:
    repo = JournalRepository(db)
    entry = repo.get_for_user(entry_id, user.id)
    if entry is None:
        raise JournalEntryNotFoundError(entry_id)
    return repo.apply_update(entry, JournalUpdate(is_favorite=not entry.is_favorite))


def delete_entry(db: Session, user: User, entry_id: int) -> None:
    repo = JournalRepository(db)
    entry = repo.get_for_user(entry_id, user.id)
    if entry is None:
        raise JournalEntryNotFoundError(entry_id)
    repo.delete(entry)


def get_summary(db: Session, user: User) -> JournalSummary:
    """Build the compact summary that powers the Explore Journal card."""
    repo = JournalRepository(db)
    latest = repo.latest_for_user(user.id)
    return JournalSummary(
        count=repo.count_for_user(user.id),
        favorite_count=repo.count_favorites(user.id),
        last_updated=latest.updated_at if latest else None,
        latest_title=latest.title if latest else None,
        latest_preview=_preview(latest.content) if latest else None,
    )
