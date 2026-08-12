"""Planner business logic: filtered task views and rescheduling.

Reuses the shared Task repository and :mod:`app.services.task_service` so the
Planner and Today modules operate on a single, consistent task domain rather
than duplicating persistence or ownership logic.
"""

from datetime import date

from sqlalchemy.orm import Session

from app.models.task import Task
from app.models.user import User
from app.repositories.task import PlannerFilter, TaskRepository
from app.schemas.task import TaskReschedule, TaskUpdate
from app.services.task_service import TaskNotFoundError


def list_planner_tasks(
    db: Session, user: User, task_filter: PlannerFilter, today: date
) -> list[Task]:
    """Return the user's tasks for a Planner view (``today``/``upcoming``/...)."""
    return TaskRepository(db).list_planner(user.id, task_filter, today)


def reschedule_task(
    db: Session, user: User, task_id: int, data: TaskReschedule
) -> Task:
    """Move an owned task to a new date/time, raising if it does not exist."""
    repo = TaskRepository(db)
    task = repo.get_for_user(task_id, user.id)
    if task is None:
        raise TaskNotFoundError(task_id)
    return repo.update(
        task, TaskUpdate(due_date=data.due_date, due_time=data.due_time)
    )
