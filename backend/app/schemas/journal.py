"""Journal request/response schemas."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.common import ORMModel

#: Mood vocabulary shared with the Today mood tracker.
JournalMood = Literal["great", "good", "okay", "down", "awful"]


class JournalCreate(BaseModel):
    """Payload for creating a journal entry."""

    title: str = Field(min_length=1, max_length=200)
    content: str = Field(min_length=1)
    mood: JournalMood | None = None
    tags: list[str] = Field(default_factory=list)
    is_favorite: bool = False


class JournalUpdate(BaseModel):
    """Partial update; only provided fields are applied."""

    title: str | None = Field(default=None, min_length=1, max_length=200)
    content: str | None = Field(default=None, min_length=1)
    mood: JournalMood | None = None
    tags: list[str] | None = None
    is_favorite: bool | None = None


class JournalRead(ORMModel):
    """A journal entry as returned to clients."""

    id: int
    title: str
    content: str
    mood: JournalMood | None
    tags: list[str]
    is_favorite: bool
    created_at: datetime
    updated_at: datetime


class JournalSummary(BaseModel):
    """Compact stats used to populate the Explore card with live data."""

    count: int
    favorite_count: int
    last_updated: datetime | None
    latest_title: str | None
    latest_preview: str | None
