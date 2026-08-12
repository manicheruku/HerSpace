"""Persistence layer for :class:`~app.models.expense.Expense`."""

from datetime import date

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.expense import Expense
from app.repositories.base import BaseRepository
from app.schemas.expense import ExpenseCreate, ExpenseUpdate


class ExpenseRepository(BaseRepository[Expense]):
    """Expense-specific queries on top of the generic CRUD repository."""

    def __init__(self, db: Session) -> None:
        super().__init__(Expense, db)

    def list_for_user(
        self,
        user_id: int,
        *,
        category: str | None = None,
        query: str | None = None,
        from_date: date | None = None,
        to_date: date | None = None,
        limit: int = 100,
        offset: int = 0,
    ) -> list[Expense]:
        stmt = select(Expense).where(Expense.user_id == user_id)

        if category:
            stmt = stmt.where(Expense.category == category)

        if query:
            pattern = f"%{query.replace('%', r'\\%').replace('_', r'\\_')}%"
            stmt = stmt.where(
                Expense.title.ilike(pattern) | Expense.note.ilike(pattern)
            )

        if from_date:
            stmt = stmt.where(Expense.spent_on >= from_date)

        if to_date:
            stmt = stmt.where(Expense.spent_on <= to_date)

        stmt = stmt.order_by(Expense.spent_on.desc(), Expense.updated_at.desc(), Expense.id.desc())
        stmt = stmt.offset(offset).limit(limit)
        return list(self.db.scalars(stmt).all())

    def get_for_user(self, expense_id: int, user_id: int) -> Expense | None:
        stmt = select(Expense).where(Expense.id == expense_id, Expense.user_id == user_id)
        return self.db.scalars(stmt).first()

    def create_for_user(self, user_id: int, data: ExpenseCreate) -> Expense:
        expense = Expense(user_id=user_id, **data.model_dump())
        return self.create(expense)

    def apply_update(self, expense: Expense, data: ExpenseUpdate) -> Expense:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(expense, field, value)
        return self.update(expense)

    def month_total_cents(self, user_id: int, *, from_date: date, to_date: date) -> int:
        stmt = select(func.sum(Expense.amount_cents)).where(
            Expense.user_id == user_id,
            Expense.spent_on >= from_date,
            Expense.spent_on <= to_date,
        )
        return int(self.db.scalar(stmt) or 0)

    def month_count(self, user_id: int, *, from_date: date, to_date: date) -> int:
        stmt = select(func.count(Expense.id)).where(
            Expense.user_id == user_id,
            Expense.spent_on >= from_date,
            Expense.spent_on <= to_date,
        )
        return int(self.db.scalar(stmt) or 0)

    def latest_for_user(self, user_id: int) -> Expense | None:
        stmt = (
            select(Expense)
            .where(Expense.user_id == user_id)
            .order_by(Expense.updated_at.desc(), Expense.id.desc())
            .limit(1)
        )
        return self.db.scalars(stmt).first()
