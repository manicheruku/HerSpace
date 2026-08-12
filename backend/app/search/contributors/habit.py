"""Global Search contributor for Habits."""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.habit import Habit
from app.models.user import User
from app.schemas.search import SearchHit
from app.search.engine import SearchField, build_search_query, default_engine
from app.search.registry import registry


class HabitSearchContributor:
    """Searches a user's active habits by name."""

    module_id = "habits"
    title = "Habits"
    icon = "🌱"

    def search(
        self, db: Session, user: User, query: str, limit: int
    ) -> list[SearchHit]:
        fields = [SearchField(Habit.name, weight=3)]
        stmt = build_search_query(
            Habit,
            default_engine,
            query,
            fields,
            user_id_column=Habit.user_id,
            user_id=user.id,
            limit=limit,
        )
        # Only surface active habits in search.
        stmt = stmt.where(Habit.is_archived.is_(False))
        habits = db.scalars(stmt).all()

        return [
            SearchHit(
                id=habit.id,
                title=habit.name,
                preview=None,
                route=f"/habits/{habit.id}",
                matched_field="name",
                updated_at=habit.updated_at,
            )
            for habit in habits
        ]


registry.register(HabitSearchContributor())
