"""Global Search contributor for Journal entries."""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.journal_entry import JournalEntry
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


class JournalSearchContributor:
    """Searches a user's journal entries by title and content."""

    module_id = "journal"
    title = "Journal"
    icon = "📔"

    def search(
        self, db: Session, user: User, query: str, limit: int
    ) -> list[SearchHit]:
        fields = [
            SearchField(JournalEntry.title, weight=3),
            SearchField(JournalEntry.content, weight=1),
        ]
        stmt = build_search_query(
            JournalEntry,
            default_engine,
            query,
            fields,
            user_id_column=JournalEntry.user_id,
            user_id=user.id,
            limit=limit,
        )
        entries = db.scalars(stmt).all()

        lowered = query.lower()
        hits: list[SearchHit] = []
        for entry in entries:
            matched_field = (
                "content"
                if lowered in entry.content.lower()
                and lowered not in entry.title.lower()
                else "title"
            )
            hits.append(
                SearchHit(
                    id=entry.id,
                    title=entry.title,
                    preview=_preview(entry.content),
                    route=f"/journal/{entry.id}",
                    matched_field=matched_field,
                    updated_at=entry.updated_at,
                )
            )
        return hits


registry.register(JournalSearchContributor())
