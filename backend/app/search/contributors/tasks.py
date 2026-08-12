"""Global Search contributor for Tasks (Today + Planner)."""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.task import Task
from app.models.user import User
from app.schemas.search import SearchHit
from app.search.engine import SearchField, build_search_query, default_engine
from app.search.registry import registry


class TaskSearchContributor:
    """Searches a user's tasks by title and notes."""

    module_id = "tasks"
    title = "Tasks"
    icon = "✅"

    def search(
        self, db: Session, user: User, query: str, limit: int
    ) -> list[SearchHit]:
        fields = [
            SearchField(Task.title, weight=3),
            SearchField(Task.notes, weight=1),
        ]
        stmt = build_search_query(
            Task,
            default_engine,
            query,
            fields,
            user_id_column=Task.user_id,
            user_id=user.id,
            limit=limit,
        )
        tasks = db.scalars(stmt).all()

        lowered = query.lower()
        hits: list[SearchHit] = []
        for task in tasks:
            matched_field = (
                "notes"
                if task.notes and lowered in task.notes.lower()
                and lowered not in task.title.lower()
                else "title"
            )
            hits.append(
                SearchHit(
                    id=task.id,
                    title=task.title,
                    preview=task.notes,
                    route=f"/planner?task={task.id}",
                    matched_field=matched_field,
                    updated_at=task.updated_at,
                )
            )
        return hits


registry.register(TaskSearchContributor())
