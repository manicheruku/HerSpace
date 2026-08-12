"""Global Search contributor for Goals."""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.goal import Goal
from app.models.user import User
from app.schemas.search import SearchHit
from app.search.engine import SearchField, build_search_query, default_engine
from app.search.registry import registry

_PREVIEW_LENGTH = 120


def _preview(text: str | None) -> str | None:
    if not text:
        return None
    collapsed = " ".join(text.split())
    if len(collapsed) <= _PREVIEW_LENGTH:
        return collapsed
    return collapsed[:_PREVIEW_LENGTH].rstrip() + "…"


class GoalSearchContributor:
    """Searches a user's goals by title and description."""

    module_id = "goals"
    title = "Goals"
    icon = "🎯"

    def search(
        self, db: Session, user: User, query: str, limit: int
    ) -> list[SearchHit]:
        fields = [
            SearchField(Goal.title, weight=3),
            SearchField(Goal.description, weight=1),
        ]
        stmt = build_search_query(
            Goal,
            default_engine,
            query,
            fields,
            user_id_column=Goal.user_id,
            user_id=user.id,
            limit=limit,
        )
        goals = db.scalars(stmt).all()

        lowered = query.lower()
        hits: list[SearchHit] = []
        for goal in goals:
            matched_field = (
                "description"
                if goal.description
                and lowered in goal.description.lower()
                and lowered not in goal.title.lower()
                else "title"
            )
            hits.append(
                SearchHit(
                    id=goal.id,
                    title=goal.title,
                    preview=_preview(goal.description),
                    route=f"/goals/{goal.id}",
                    matched_field=matched_field,
                    updated_at=goal.updated_at,
                )
            )
        return hits


registry.register(GoalSearchContributor())
