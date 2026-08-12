"""Memory request/response schemas."""

from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.common import ORMModel

MemoryMood = Literal["happy", "grateful", "calm", "excited", "proud", "nostalgic"]


class MemoryCreate(BaseModel):
    """Payload for creating a memory."""

    title: str = Field(min_length=1, max_length=200)
    content: str = Field(min_length=1)
    memory_on: date
    mood: MemoryMood | None = None
    is_favorite: bool = False


class MemoryUpdate(BaseModel):
    """Partial update; only provided fields are applied."""

    title: str | None = Field(default=None, min_length=1, max_length=200)
    content: str | None = Field(default=None, min_length=1)
    memory_on: date | None = None
    mood: MemoryMood | None = None
    is_favorite: bool | None = None


class MemoryRead(ORMModel):
    """A memory as returned to clients."""

    id: int
    title: str
    content: str
    memory_on: date
    mood: MemoryMood | None
    is_favorite: bool
    created_at: datetime
    updated_at: datetime


class MemorySummary(BaseModel):
    """Compact stats used to populate the Explore card with live data."""

    count: int
    favorite_count: int
    last_updated: datetime | None
    latest_title: str | None
    latest_preview: str | None
