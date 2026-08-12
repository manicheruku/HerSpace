"""Task request/response schemas shared by the Today and Planner modules."""

from datetime import date, datetime, time
from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.common import ORMModel

TaskPriority = Literal["low", "medium", "high"]


class TaskCreate(BaseModel):
    """Payload for creating a new task."""

    title: str = Field(min_length=1, max_length=200)
    priority: TaskPriority = "medium"
    notes: str | None = None
    due_date: date | None = None
    due_time: time | None = None
    category: str | None = Field(default=None, max_length=50)
    reminder_at: datetime | None = None


class TaskUpdate(BaseModel):
    """Partial update payload; only provided fields are applied."""

    title: str | None = Field(default=None, min_length=1, max_length=200)
    notes: str | None = None
    priority: TaskPriority | None = None
    is_completed: bool | None = None
    due_date: date | None = None
    due_time: time | None = None
    category: str | None = Field(default=None, max_length=50)
    reminder_at: datetime | None = None


class TaskReschedule(BaseModel):
    """Payload for moving a task to a new date/time on the Planner timeline."""

    due_date: date | None = None
    due_time: time | None = None


class TaskRead(ORMModel):
    """Task as returned to clients."""

    id: int
    title: str
    notes: str | None
    priority: TaskPriority
    is_completed: bool
    completed_at: datetime | None
    position: int
    due_date: date | None
    due_time: time | None
    category: str | None
    reminder_at: datetime | None
    created_at: datetime
    updated_at: datetime

