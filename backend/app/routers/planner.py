"""Planner endpoints: filtered task views and rescheduling.

Writes (create/update/delete) are served by the shared ``/tasks`` router; this
router adds the Planner-specific read filters and the reschedule action so the
frontend Planner module has a cohesive namespace without duplicating CRUD logic.
"""

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.repositories.task import PlannerFilter
from app.schemas.task import TaskRead, TaskReschedule
from app.services import planner_service
from app.services.task_service import TaskNotFoundError

router = APIRouter()

_not_found = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
)


@router.get(
    "/planner/tasks",
    response_model=list[TaskRead],
    summary="List planner tasks",
)
def list_planner_tasks(
    task_filter: PlannerFilter = Query("all", alias="filter"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[TaskRead]:
    tasks = planner_service.list_planner_tasks(
        db, current_user, task_filter, date.today()
    )
    return [TaskRead.model_validate(task) for task in tasks]


@router.post(
    "/planner/tasks/{task_id}/reschedule",
    response_model=TaskRead,
    summary="Reschedule a task",
)
def reschedule_task(
    task_id: int,
    payload: TaskReschedule,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TaskRead:
    try:
        task = planner_service.reschedule_task(db, current_user, task_id, payload)
    except TaskNotFoundError:
        raise _not_found
    return TaskRead.model_validate(task)
