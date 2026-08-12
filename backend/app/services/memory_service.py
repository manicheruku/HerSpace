"""Memories business logic."""

from datetime import date

from sqlalchemy.orm import Session

from app.models.memory import Memory
from app.models.user import User
from app.repositories.memory import MemoryRepository
from app.schemas.memory import MemoryCreate, MemorySummary, MemoryUpdate

PREVIEW_LENGTH = 140


class MemoryNotFoundError(Exception):
    """Raised when a memory does not exist or is not owned by the user."""


def _preview(content: str) -> str:
    collapsed = " ".join(content.split())
    if len(collapsed) <= PREVIEW_LENGTH:
        return collapsed
    return collapsed[:PREVIEW_LENGTH].rstrip() + "…"


def list_memories(
    db: Session,
    user: User,
    *,
    favorite: bool | None = None,
    mood: str | None = None,
    query: str | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
    limit: int = 100,
    offset: int = 0,
) -> list[Memory]:
    return MemoryRepository(db).list_for_user(
        user.id,
        favorite=favorite,
        mood=mood,
        query=query,
        from_date=from_date,
        to_date=to_date,
        limit=limit,
        offset=offset,
    )


def get_memory(db: Session, user: User, memory_id: int) -> Memory:
    memory = MemoryRepository(db).get_for_user(memory_id, user.id)
    if memory is None:
        raise MemoryNotFoundError(memory_id)
    return memory


def create_memory(db: Session, user: User, data: MemoryCreate) -> Memory:
    return MemoryRepository(db).create_for_user(user.id, data)


def update_memory(db: Session, user: User, memory_id: int, data: MemoryUpdate) -> Memory:
    repo = MemoryRepository(db)
    memory = repo.get_for_user(memory_id, user.id)
    if memory is None:
        raise MemoryNotFoundError(memory_id)
    return repo.apply_update(memory, data)


def toggle_favorite(db: Session, user: User, memory_id: int) -> Memory:
    repo = MemoryRepository(db)
    memory = repo.get_for_user(memory_id, user.id)
    if memory is None:
        raise MemoryNotFoundError(memory_id)
    return repo.apply_update(memory, MemoryUpdate(is_favorite=not memory.is_favorite))


def delete_memory(db: Session, user: User, memory_id: int) -> None:
    repo = MemoryRepository(db)
    memory = repo.get_for_user(memory_id, user.id)
    if memory is None:
        raise MemoryNotFoundError(memory_id)
    repo.delete(memory)


def get_summary(db: Session, user: User) -> MemorySummary:
    """Build the compact summary that powers the Explore Memories card."""
    repo = MemoryRepository(db)
    latest = repo.latest_for_user(user.id)
    return MemorySummary(
        count=repo.count_for_user(user.id),
        favorite_count=repo.count_favorites(user.id),
        last_updated=latest.updated_at if latest else None,
        latest_title=latest.title if latest else None,
        latest_preview=_preview(latest.content) if latest else None,
    )
