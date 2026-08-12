"""Habit request/response schemas."""

from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field

#: Optional colour label used to visually group habits (shared palette with Notes).
HabitColor = Literal["rose", "peach", "sky", "mint", "lilac"]


class HabitCreate(BaseModel):
    """Payload for creating a habit."""

    name: str = Field(min_length=1, max_length=120)
    emoji: str | None = Field(default=None, max_length=20)
    color: HabitColor | None = None


class HabitUpdate(BaseModel):
    """Partial update; only provided fields are applied."""

    name: str | None = Field(default=None, min_length=1, max_length=120)
    emoji: str | None = Field(default=None, max_length=20)
    color: HabitColor | None = None
    is_archived: bool | None = None


class HabitRead(BaseModel):
    """A habit plus its derived progress stats, as returned to clients."""

    id: int
    name: str
    emoji: str | None
    color: HabitColor | None
    is_archived: bool
    created_at: datetime
    updated_at: datetime
    #: Consecutive days completed, ending today (or yesterday if today is pending).
    current_streak: int
    #: Longest run of consecutive completed days ever.
    longest_streak: int
    #: Whether the habit has been checked in today.
    completed_today: bool
    #: Total number of days ever completed.
    total_checkins: int
    #: Days completed within the last 7 days (today inclusive).
    week_count: int
    #: The most recent completed dates (newest first), capped for the UI.
    recent_checkins: list[date]


class HabitSummary(BaseModel):
    """Compact stats used to populate the Explore Habits card with live data."""

    active_count: int
    checked_in_today: int
    best_streak: int
    latest_name: str | None
