"""Persistence layer for :class:`~app.models.memory.Memory`."""

from datetime import date

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.memory import Memory
from app.repositories.base import BaseRepository
from app.schemas.memory import MemoryCreate, MemoryUpdate


class MemoryRepository(BaseRepository[Memory]):
    """Memory-specific queries on top of the generic CRUD repository."""

    def __init__(self, db: Session) -> None:
        super().__init__(Memory, db)

    def list_for_user(
        self,
        user_id: int,
        *,
        favorite: bool | None = None,
        mood: str | None = None,
        query: str | None = None,
        from_date: date | None = None,
        to_date: date | None = None,
        limit: int = 100,
        offset: int = 0,
    ) -> list[Memory]:
        """Return a user's memories, favorites first then newest, with filters."""
        stmt = select(Memory).where(Memory.user_id == user_id)

        if favorite is not None:
            stmt = stmt.where(Memory.is_favorite.is_(favorite))
        if mood:
            stmt = stmt.where(Memory.mood == mood)
        if from_date:
            stmt = stmt.where(Memory.memory_on >= from_date)
        if to_date:
            stmt = stmt.where(Memory.memory_on <= to_date)
        if query:
            pattern = f"%{query.replace('%', r'\\%').replace('_', r'\\_')}%"
            stmt = stmt.where(Memory.title.ilike(pattern) | Memory.content.ilike(pattern))

        stmt = stmt.order_by(
            Memory.is_favorite.desc(), Memory.memory_on.desc(), Memory.updated_at.desc(), Memory.id.desc()
        )
        stmt = stmt.offset(offset).limit(limit)
        return list(self.db.scalars(stmt).all())

    def get_for_user(self, memory_id: int, user_id: int) -> Memory | None:
        stmt = select(Memory).where(Memory.id == memory_id, Memory.user_id == user_id)
        return self.db.scalars(stmt).first()

    def create_for_user(self, user_id: int, data: MemoryCreate) -> Memory:
        memory = Memory(user_id=user_id, **data.model_dump())
        return self.create(memory)

    def apply_update(self, memory: Memory, data: MemoryUpdate) -> Memory:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(memory, field, value)
        return self.update(memory)

    def count_for_user(self, user_id: int) -> int:
        stmt = select(func.count(Memory.id)).where(Memory.user_id == user_id)
        return int(self.db.scalar(stmt) or 0)

    def count_favorites(self, user_id: int) -> int:
        stmt = select(func.count(Memory.id)).where(
            Memory.user_id == user_id, Memory.is_favorite.is_(True)
        )
        return int(self.db.scalar(stmt) or 0)

    def latest_for_user(self, user_id: int) -> Memory | None:
        stmt = (
            select(Memory)
            .where(Memory.user_id == user_id)
            .order_by(Memory.updated_at.desc(), Memory.id.desc())
            .limit(1)
        )
        return self.db.scalars(stmt).first()
