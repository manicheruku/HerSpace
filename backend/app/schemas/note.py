"""Note request/response schemas."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.common import ORMModel

#: Optional colour label used to visually group notes.
NoteColor = Literal["rose", "peach", "sky", "mint", "lilac"]


class NoteCreate(BaseModel):
    """Payload for creating a note."""

    title: str = Field(min_length=1, max_length=200)
    content: str = Field(min_length=1)
    color: NoteColor | None = None
    tags: list[str] = Field(default_factory=list)
    is_pinned: bool = False


class NoteUpdate(BaseModel):
    """Partial update; only provided fields are applied."""

    title: str | None = Field(default=None, min_length=1, max_length=200)
    content: str | None = Field(default=None, min_length=1)
    color: NoteColor | None = None
    tags: list[str] | None = None
    is_pinned: bool | None = None


class NoteRead(ORMModel):
    """A note as returned to clients."""

    id: int
    title: str
    content: str
    color: NoteColor | None
    tags: list[str]
    is_pinned: bool
    created_at: datetime
    updated_at: datetime


class NoteSummary(BaseModel):
    """Compact stats used to populate the Explore card with live data."""

    count: int
    pinned_count: int
    last_updated: datetime | None
    latest_title: str | None
    latest_preview: str | None
