"""Global Search contributor for Memories."""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.memory import Memory
from app.models.user import User
from app.schemas.search import SearchHit
from app.search.engine import SearchField, build_search_query, default_engine
from app.search.registry import registry

_PREVIEW_LENGTH = 120


def _preview(content: str) -> str:
    collapsed = " ".join(content.split())
    if len(collapsed) <= _PREVIEW_LENGTH:
        return collapsed
    return collapsed[:_PREVIEW_LENGTH].rstrip() + "…"


class MemorySearchContributor:
    """Searches a user's memories by title and content."""

    module_id = "memories"
    title = "Memories"
    icon = "📸"

    def search(
        self, db: Session, user: User, query: str, limit: int
    ) -> list[SearchHit]:
        fields = [
            SearchField(Memory.title, weight=3),
            SearchField(Memory.content, weight=1),
        ]
        stmt = build_search_query(
            Memory,
            default_engine,
            query,
            fields,
            user_id_column=Memory.user_id,
            user_id=user.id,
            limit=limit,
        )
        memories = db.scalars(stmt).all()

        lowered = query.lower()
        hits: list[SearchHit] = []
        for memory in memories:
            matched_field = (
                "content"
                if lowered in memory.content.lower()
                and lowered not in memory.title.lower()
                else "title"
            )
            hits.append(
                SearchHit(
                    id=memory.id,
                    title=memory.title,
                    preview=_preview(memory.content),
                    route=f"/memories/{memory.id}",
                    matched_field=matched_field,
                    updated_at=memory.updated_at,
                )
            )
        return hits


registry.register(MemorySearchContributor())
