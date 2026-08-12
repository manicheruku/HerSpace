"""Global Search contributor for Notes."""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.note import Note
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


class NoteSearchContributor:
    """Searches a user's notes by title and content."""

    module_id = "notes"
    title = "Notes"
    icon = "📝"

    def search(
        self, db: Session, user: User, query: str, limit: int
    ) -> list[SearchHit]:
        fields = [
            SearchField(Note.title, weight=3),
            SearchField(Note.content, weight=1),
        ]
        stmt = build_search_query(
            Note,
            default_engine,
            query,
            fields,
            user_id_column=Note.user_id,
            user_id=user.id,
            limit=limit,
        )
        notes = db.scalars(stmt).all()

        lowered = query.lower()
        hits: list[SearchHit] = []
        for note in notes:
            matched_field = (
                "content"
                if lowered in note.content.lower()
                and lowered not in note.title.lower()
                else "title"
            )
            hits.append(
                SearchHit(
                    id=note.id,
                    title=note.title,
                    preview=_preview(note.content),
                    route=f"/notes/{note.id}",
                    matched_field=matched_field,
                    updated_at=note.updated_at,
                )
            )
        return hits


registry.register(NoteSearchContributor())
