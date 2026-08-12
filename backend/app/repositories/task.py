"""Persistence layer for :class:`~app.models.task.Task`."""

from datetime import UTC, date, datetime
from typing import Literal

from sqlalchemy import case, select
from sqlalchemy.orm import Session

from app.models.task import Task
from app.repositories.base import BaseRepository
from app.schemas.task import TaskCreate, TaskUpdate

PlannerFilter = Literal["today", "upcoming", "completed", "all"]


class TaskRepository(BaseRepository[Task]):
    """Task-specific queries on top of the generic CRUD repository."""

    def __init__(self, db: Session) -> None:
        super().__init__(Task, db)

    def list_for_user(self, user_id: int) -> list[Task]:
        """Return the user's tasks ordered by ``position`` then ``created_at``."""
        stmt = (
            select(Task)
            .where(Task.user_id == user_id)
            .order_by(Task.position.asc(), Task.created_at.asc())
        )
        return list(self.db.scalars(stmt).all())

    def list_planner(
        self, user_id: int, task_filter: PlannerFilter, today: date
    ) -> list[Task]:
        """Return the user's tasks for a Planner view, filtered and time-ordered.

        Ordering keeps scheduled items first (by date then time) and pushes
        undated tasks to the end, using a portable ``CASE`` expression so the
        query behaves identically on SQLite and PostgreSQL.
        """
        stmt = select(Task).where(Task.user_id == user_id)

        if task_filter == "today":
            stmt = stmt.where(Task.due_date == today, Task.is_completed.is_(False))
        elif task_filter == "upcoming":
            stmt = stmt.where(Task.due_date > today, Task.is_completed.is_(False))
        elif task_filter == "completed":
            stmt = stmt.where(Task.is_completed.is_(True))

        undated_last = case((Task.due_date.is_(None), 1), else_=0)
        stmt = stmt.order_by(
            undated_last,
            Task.due_date.asc(),
            Task.due_time.asc(),
            Task.position.asc(),
            Task.created_at.asc(),
        )
        return list(self.db.scalars(stmt).all())

    def get_for_user(self, task_id: int, user_id: int) -> Task | None:
        """Return a single task owned by ``user_id``, or ``None``."""
        stmt = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        return self.db.scalars(stmt).first()

    def create(self, user_id: int, data: TaskCreate) -> Task:
        """Create and persist a new task for ``user_id``."""
        task = Task(user_id=user_id, **data.model_dump())
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        return task


    def update(self, task: Task, data: TaskUpdate) -> Task:
        """Apply only the provided fields and persist the task.

        Toggling ``is_completed`` keeps ``completed_at`` in sync: it is set to the
        current UTC time when completion flips on and cleared when it flips off.
        """
        fields = data.model_dump(exclude_unset=True)

        if "is_completed" in fields:
            new_state = fields["is_completed"]
            if new_state and not task.is_completed:
                task.completed_at = datetime.now(UTC)
            elif not new_state and task.is_completed:
                task.completed_at = None

        for field, value in fields.items():
            setattr(task, field, value)

        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        return task

    def delete(self, task: Task) -> None:
        """Delete a task."""
        self.db.delete(task)
        self.db.commit()
