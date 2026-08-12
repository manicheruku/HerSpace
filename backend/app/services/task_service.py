"""Task business logic for the Today module.

Keeps ownership enforcement and persistence orchestration out of the router so
endpoints stay thin and the logic stays testable.
"""

from sqlalchemy.orm import Session

from app.models.task import Task
from app.models.user import User
from app.repositories.task import TaskRepository
from app.schemas.task import TaskCreate, TaskUpdate


class TaskNotFoundError(Exception):
    """Raised when a task does not exist or is not owned by the user."""


def list_tasks(db: Session, user: User) -> list[Task]:
    """Return all tasks belonging to ``user``."""
    return TaskRepository(db).list_for_user(user.id)


def create_task(db: Session, user: User, data: TaskCreate) -> Task:
    """Create a new task owned by ``user``."""
    return TaskRepository(db).create(user.id, data)


def get_task(db: Session, user: User, task_id: int) -> Task:
    """Return a single owned task, raising :class:`TaskNotFoundError` if absent."""
    task = TaskRepository(db).get_for_user(task_id, user.id)
    if task is None:
        raise TaskNotFoundError(task_id)
    return task


def update_task(db: Session, user: User, task_id: int, data: TaskUpdate) -> Task:
    """Update an owned task, raising :class:`TaskNotFoundError` if absent."""
    repo = TaskRepository(db)
    task = repo.get_for_user(task_id, user.id)
    if task is None:
        raise TaskNotFoundError(task_id)
    return repo.update(task, data)


def delete_task(db: Session, user: User, task_id: int) -> None:
    """Delete an owned task, raising :class:`TaskNotFoundError` if absent."""
    repo = TaskRepository(db)
    task = repo.get_for_user(task_id, user.id)
    if task is None:
        raise TaskNotFoundError(task_id)
    repo.delete(task)
