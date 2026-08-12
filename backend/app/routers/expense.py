"""Expenses CRUD, filtering, and summary endpoints."""

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.expense import ExpenseCreate, ExpenseRead, ExpenseSummary, ExpenseUpdate
from app.services import expense_service
from app.services.expense_service import ExpenseNotFoundError

router = APIRouter()

_not_found = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found"
)


@router.get("/expenses", response_model=list[ExpenseRead], summary="List expenses")
def list_expenses(
    category: str | None = Query(None),
    q: str | None = Query(None),
    from_date: date | None = Query(None, alias="from"),
    to_date: date | None = Query(None, alias="to"),
    limit: int = Query(100, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[ExpenseRead]:
    return expense_service.list_expenses(
        db,
        current_user,
        category=category,
        query=q,
        from_date=from_date,
        to_date=to_date,
        limit=limit,
        offset=offset,
    )


@router.get(
    "/expenses/summary",
    response_model=ExpenseSummary,
    summary="Expenses summary for the Explore card",
)
def expenses_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ExpenseSummary:
    return expense_service.get_summary(db, current_user, today=date.today())


@router.post(
    "/expenses",
    response_model=ExpenseRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create an expense",
)
def create_expense(
    payload: ExpenseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ExpenseRead:
    return expense_service.create_expense(db, current_user, payload)


@router.get("/expenses/{expense_id}", response_model=ExpenseRead, summary="Get an expense")
def get_expense(
    expense_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ExpenseRead:
    try:
        return expense_service.get_expense(db, current_user, expense_id)
    except ExpenseNotFoundError:
        raise _not_found


@router.patch(
    "/expenses/{expense_id}", response_model=ExpenseRead, summary="Update an expense"
)
def update_expense(
    expense_id: int,
    payload: ExpenseUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ExpenseRead:
    try:
        return expense_service.update_expense(db, current_user, expense_id, payload)
    except ExpenseNotFoundError:
        raise _not_found


@router.delete(
    "/expenses/{expense_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an expense",
)
def delete_expense(
    expense_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    try:
        expense_service.delete_expense(db, current_user, expense_id)
    except ExpenseNotFoundError:
        raise _not_found
