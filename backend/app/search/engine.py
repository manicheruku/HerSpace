"""Swappable search engine abstraction.

The engine decides *how* text is matched; a :class:`SearchContributor` decides
*what* is matched (which model and columns). This separation is the seam that
lets us start on a portable ``ILIKE`` implementation today and later drop in a
PostgreSQL full-text engine (``to_tsvector``/``ts_rank``) or Elasticsearch
without touching contributors, the service, the router, or the frontend.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol

from sqlalchemy import ColumnElement, Integer, Select, func, or_, select
from sqlalchemy.orm import InstrumentedAttribute

from app.models.base import IntIDMixin


@dataclass(frozen=True)
class SearchField:
    """A searchable column and its relevance weight (higher wins)."""

    column: InstrumentedAttribute[str | None]
    weight: int = 1


class SearchEngine(Protocol):
    """Contract every concrete engine must satisfy."""

    def build_filter(
        self, query: str, fields: list[SearchField]
    ) -> ColumnElement[bool]:
        """Return a boolean expression matching ``query`` across ``fields``."""

    def rank(self, query: str, fields: list[SearchField]) -> ColumnElement[int]:
        """Return an orderable relevance score expression (higher is better)."""


class LikeSearchEngine:
    """Portable engine using case-insensitive ``ILIKE`` matching.

    Runs identically on SQLite and PostgreSQL. Relevance is a simple weighted
    sum: a field contributes its weight when it contains the term. It is not a
    linguistic ranker, but it keeps the API contract stable so a smarter engine
    can replace it invisibly.
    """

    def _pattern(self, query: str) -> str:
        escaped = query.replace("%", r"\%").replace("_", r"\_")
        return f"%{escaped}%"

    def build_filter(
        self, query: str, fields: list[SearchField]
    ) -> ColumnElement[bool]:
        pattern = self._pattern(query)
        return or_(*(field.column.ilike(pattern) for field in fields))

    def rank(self, query: str, fields: list[SearchField]) -> ColumnElement[int]:
        pattern = self._pattern(query)
        terms = [
            func.coalesce(func.cast(field.column.ilike(pattern), Integer), 0)
            * field.weight
            for field in fields
        ]
        expr = terms[0]
        for term in terms[1:]:
            expr = expr + term
        return expr


def build_search_query(
    model: type[IntIDMixin],
    engine: SearchEngine,
    query: str,
    fields: list[SearchField],
    *,
    user_id_column: InstrumentedAttribute[int],
    user_id: int,
    limit: int,
) -> Select[tuple[IntIDMixin]]:
    """Assemble an ownership-scoped, ranked, limited search statement."""
    score = engine.rank(query, fields).label("search_score")
    return (
        select(model)
        .where(user_id_column == user_id)
        .where(engine.build_filter(query, fields))
        .order_by(score.desc())
        .limit(limit)
    )


#: The active engine. Swap this line to change the backend implementation.
default_engine: SearchEngine = LikeSearchEngine()
