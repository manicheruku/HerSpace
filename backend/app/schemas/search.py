"""Schemas for the Global Search system.

These types define the stable API contract returned by ``GET /search``. They are
deliberately module-agnostic: every module contributes hits in the same shape so
the frontend overlay never needs to know about individual modules.
"""

from datetime import datetime

from pydantic import BaseModel


class SearchHit(BaseModel):
    """A single matched record from any module."""

    id: int
    title: str
    preview: str | None = None
    route: str
    matched_field: str
    updated_at: datetime | None = None


class SearchGroup(BaseModel):
    """All hits from one module, grouped for display."""

    module: str
    title: str
    icon: str
    hits: list[SearchHit]


class SearchResponse(BaseModel):
    """The complete grouped result set for a query."""

    query: str
    total: int
    groups: list[SearchGroup]
