"""Task CRUD endpoints for the Today module."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.task import TaskCreate, TaskRead, TaskUpdate
from app.services import task_service
from app.services.task_service import TaskNotFoundError

router = APIRouter()

_not_found = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
)


@router.get("/tasks", response_model=list[TaskRead], summary="List tasks")
def list_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[TaskRead]:
    tasks = task_service.list_tasks(db, current_user)
    return [TaskRead.model_validate(task) for task in tasks]


@router.post(
    "/tasks",
    response_model=TaskRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a task",
)
def create_task(
    payload: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TaskRead:
    task = task_service.create_task(db, current_user, payload)
    return TaskRead.model_validate(task)


@router.get("/tasks/{task_id}", response_model=TaskRead, summary="Get a task")
def get_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TaskRead:
    try:
        task = task_service.get_task(db, current_user, task_id)
    except TaskNotFoundError:
        raise _not_found
    return TaskRead.model_validate(task)


@router.patch("/tasks/{task_id}", response_model=TaskRead, summary="Update a task")
def update_task(
    task_id: int,
    payload: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TaskRead:
    try:
        task = task_service.update_task(db, current_user, task_id, payload)
    except TaskNotFoundError:
        raise _not_found
    return TaskRead.model_validate(task)


@router.delete(
    "/tasks/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a task",
)
def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    try:
        task_service.delete_task(db, current_user, task_id)
    except TaskNotFoundError:
        raise _not_found
