"""Habits CRUD, daily check-in toggle, and summary endpoints."""

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.habit import HabitCreate, HabitRead, HabitSummary, HabitUpdate
from app.services import habit_service
from app.services.habit_service import HabitNotFoundError

router = APIRouter()

_not_found = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found"
)


@router.get("/habits", response_model=list[HabitRead], summary="List habits")
def list_habits(
    include_archived: bool = Query(False),
    q: str | None = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[HabitRead]:
    return habit_service.list_habits(
        db,
        current_user,
        today=date.today(),
        include_archived=include_archived,
        query=q,
    )


@router.get(
    "/habits/summary",
    response_model=HabitSummary,
    summary="Habits summary for the Explore card",
)
def habits_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> HabitSummary:
    return habit_service.get_summary(db, current_user, today=date.today())


@router.post(
    "/habits",
    response_model=HabitRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a habit",
)
def create_habit(
    payload: HabitCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> HabitRead:
    return habit_service.create_habit(db, current_user, payload, today=date.today())


@router.get("/habits/{habit_id}", response_model=HabitRead, summary="Get a habit")
def get_habit(
    habit_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> HabitRead:
    try:
        return habit_service.get_habit(
            db, current_user, habit_id, today=date.today()
        )
    except HabitNotFoundError:
        raise _not_found


@router.patch(
    "/habits/{habit_id}", response_model=HabitRead, summary="Update a habit"
)
def update_habit(
    habit_id: int,
    payload: HabitUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> HabitRead:
    try:
        return habit_service.update_habit(
            db, current_user, habit_id, payload, today=date.today()
        )
    except HabitNotFoundError:
        raise _not_found


@router.post(
    "/habits/{habit_id}/check",
    response_model=HabitRead,
    summary="Toggle a habit's completion for a day",
)
def toggle_checkin(
    habit_id: int,
    on: date | None = Query(None, description="Date to toggle; defaults to today"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> HabitRead:
    today = date.today()
    try:
        return habit_service.toggle_checkin(
            db, current_user, habit_id, on=on or today, today=today
        )
    except HabitNotFoundError:
        raise _not_found


@router.delete(
    "/habits/{habit_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a habit",
)
def delete_habit(
    habit_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    try:
        habit_service.delete_habit(db, current_user, habit_id)
    except HabitNotFoundError:
        raise _not_found
