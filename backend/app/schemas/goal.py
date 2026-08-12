"""Goal request/response schemas."""

from datetime import date, datetime

from pydantic import BaseModel, Field

from app.schemas.common import ORMModel


class GoalCreate(BaseModel):
    """Payload for creating a goal."""

    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    unit: str | None = Field(default=None, max_length=40)
    target_value: int = Field(default=1, ge=1)
    current_value: int = Field(default=0, ge=0)
    due_date: date | None = None


class GoalUpdate(BaseModel):
    """Partial update; only provided fields are applied."""

    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    unit: str | None = Field(default=None, max_length=40)
    target_value: int | None = Field(default=None, ge=1)
    current_value: int | None = Field(default=None, ge=0)
    due_date: date | None = None
    is_completed: bool | None = None
    is_archived: bool | None = None


class GoalRead(ORMModel):
    """A goal as returned to clients, with computed progress percentage."""

    id: int
    title: str
    description: str | None
    unit: str | None
    target_value: int
    current_value: int
    due_date: date | None
    is_completed: bool
    is_archived: bool
    created_at: datetime
    updated_at: datetime
    progress_percent: int


class GoalSummary(BaseModel):
    """Compact stats used to populate the Explore Goals card with live data."""

    active_count: int
    completed_count: int
    overall_progress: int
    last_updated: datetime | None
    latest_title: str | None


class GoalAdvanceInput(BaseModel):
    """Increment/decrement a goal's current progress by ``amount``."""

    amount: int = 1
