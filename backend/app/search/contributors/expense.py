"""Global Search contributor for Expenses."""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.expense import Expense
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


class ExpenseSearchContributor:
    """Searches a user's expenses by title and note."""

    module_id = "expenses"
    title = "Expenses"
    icon = "💰"

    def search(
        self, db: Session, user: User, query: str, limit: int
    ) -> list[SearchHit]:
        fields = [
            SearchField(Expense.title, weight=3),
            SearchField(Expense.note, weight=1),
        ]
        stmt = build_search_query(
            Expense,
            default_engine,
            query,
            fields,
            user_id_column=Expense.user_id,
            user_id=user.id,
            limit=limit,
        )
        expenses = db.scalars(stmt).all()

        lowered = query.lower()
        hits: list[SearchHit] = []
        for expense in expenses:
            matched_field = (
                "note"
                if expense.note
                and lowered in expense.note.lower()
                and lowered not in expense.title.lower()
                else "title"
            )
            hits.append(
                SearchHit(
                    id=expense.id,
                    title=expense.title,
                    preview=_preview(expense.note),
                    route=f"/expenses/{expense.id}",
                    matched_field=matched_field,
                    updated_at=expense.updated_at,
                )
            )
        return hits


registry.register(ExpenseSearchContributor())
