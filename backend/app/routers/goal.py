"""Goals CRUD, progress updates, and summary endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.goal import GoalAdvanceInput, GoalCreate, GoalRead, GoalSummary, GoalUpdate
from app.services import goal_service
from app.services.goal_service import GoalNotFoundError

router = APIRouter()

_not_found = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found"
)


@router.get("/goals", response_model=list[GoalRead], summary="List goals")
def list_goals(
    include_archived: bool = Query(False),
    q: str | None = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[GoalRead]:
    return goal_service.list_goals(
        db,
        current_user,
        include_archived=include_archived,
        query=q,
    )


@router.get(
    "/goals/summary",
    response_model=GoalSummary,
    summary="Goals summary for the Explore card",
)
def goals_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> GoalSummary:
    return goal_service.get_summary(db, current_user)


@router.post(
    "/goals",
    response_model=GoalRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a goal",
)
def create_goal(
    payload: GoalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> GoalRead:
    return goal_service.create_goal(db, current_user, payload)


@router.get("/goals/{goal_id}", response_model=GoalRead, summary="Get a goal")
def get_goal(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> GoalRead:
    try:
        return goal_service.get_goal(db, current_user, goal_id)
    except GoalNotFoundError:
        raise _not_found


@router.patch(
    "/goals/{goal_id}", response_model=GoalRead, summary="Update a goal"
)
def update_goal(
    goal_id: int,
    payload: GoalUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> GoalRead:
    try:
        return goal_service.update_goal(db, current_user, goal_id, payload)
    except GoalNotFoundError:
        raise _not_found


@router.post(
    "/goals/{goal_id}/advance",
    response_model=GoalRead,
    summary="Increment or decrement goal progress",
)
def advance_goal(
    goal_id: int,
    payload: GoalAdvanceInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> GoalRead:
    try:
        return goal_service.advance_goal(db, current_user, goal_id, payload)
    except GoalNotFoundError:
        raise _not_found


@router.delete(
    "/goals/{goal_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a goal",
)
def delete_goal(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    try:
        goal_service.delete_goal(db, current_user, goal_id)
    except GoalNotFoundError:
        raise _not_found
