"""Expenses business logic."""

from datetime import date

from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.expense import ExpenseRepository
from app.schemas.expense import ExpenseCreate, ExpenseRead, ExpenseSummary, ExpenseUpdate


class ExpenseNotFoundError(Exception):
    """Raised when an expense does not exist or is not owned by the user."""


def _month_range(today: date) -> tuple[date, date]:
    start = date(today.year, today.month, 1)
    if today.month == 12:
        next_month = date(today.year + 1, 1, 1)
    else:
        next_month = date(today.year, today.month + 1, 1)
    end = next_month.fromordinal(next_month.toordinal() - 1)
    return start, end


def list_expenses(
    db: Session,
    user: User,
    *,
    category: str | None = None,
    query: str | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
    limit: int = 100,
    offset: int = 0,
) -> list[ExpenseRead]:
    expenses = ExpenseRepository(db).list_for_user(
        user.id,
        category=category,
        query=query,
        from_date=from_date,
        to_date=to_date,
        limit=limit,
        offset=offset,
    )
    return [ExpenseRead.model_validate(expense) for expense in expenses]


def get_expense(db: Session, user: User, expense_id: int) -> ExpenseRead:
    expense = ExpenseRepository(db).get_for_user(expense_id, user.id)
    if expense is None:
        raise ExpenseNotFoundError(expense_id)
    return ExpenseRead.model_validate(expense)


def create_expense(db: Session, user: User, data: ExpenseCreate) -> ExpenseRead:
    expense = ExpenseRepository(db).create_for_user(user.id, data)
    return ExpenseRead.model_validate(expense)


def update_expense(
    db: Session, user: User, expense_id: int, data: ExpenseUpdate
) -> ExpenseRead:
    repo = ExpenseRepository(db)
    expense = repo.get_for_user(expense_id, user.id)
    if expense is None:
        raise ExpenseNotFoundError(expense_id)
    expense = repo.apply_update(expense, data)
    return ExpenseRead.model_validate(expense)


def delete_expense(db: Session, user: User, expense_id: int) -> None:
    repo = ExpenseRepository(db)
    expense = repo.get_for_user(expense_id, user.id)
    if expense is None:
        raise ExpenseNotFoundError(expense_id)
    repo.delete(expense)


def get_summary(db: Session, user: User, *, today: date) -> ExpenseSummary:
    """Build the compact summary that powers the Explore Expenses card."""
    repo = ExpenseRepository(db)
    start, end = _month_range(today)
    latest = repo.latest_for_user(user.id)
    return ExpenseSummary(
        month_total_cents=repo.month_total_cents(user.id, from_date=start, to_date=end),
        month_count=repo.month_count(user.id, from_date=start, to_date=end),
        latest_title=latest.title if latest else None,
        last_updated=latest.updated_at if latest else None,
    )
