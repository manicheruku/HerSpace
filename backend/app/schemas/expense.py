"""Expense request/response schemas."""

from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.common import ORMModel

ExpenseCategory = Literal[
    "food",
    "transport",
    "shopping",
    "health",
    "home",
    "bills",
    "other",
]


class ExpenseCreate(BaseModel):
    """Payload for creating an expense."""

    title: str = Field(min_length=1, max_length=200)
    amount_cents: int = Field(ge=1)
    category: ExpenseCategory = "other"
    spent_on: date
    note: str | None = None


class ExpenseUpdate(BaseModel):
    """Partial update; only provided fields are applied."""

    title: str | None = Field(default=None, min_length=1, max_length=200)
    amount_cents: int | None = Field(default=None, ge=1)
    category: ExpenseCategory | None = None
    spent_on: date | None = None
    note: str | None = None


class ExpenseRead(ORMModel):
    """An expense as returned to clients."""

    id: int
    title: str
    amount_cents: int
    category: ExpenseCategory
    spent_on: date
    note: str | None
    created_at: datetime
    updated_at: datetime


class ExpenseSummary(BaseModel):
    """Compact stats used to populate the Explore Expenses card with live data."""

    month_total_cents: int
    month_count: int
    latest_title: str | None
    last_updated: datetime | None
