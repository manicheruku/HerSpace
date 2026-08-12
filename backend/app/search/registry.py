"""Registry that lets each module plug itself into Global Search.

A module contributes a :class:`SearchContributor` describing how to search its
own data and how to build a deep link to each record. The search service simply
iterates the registered contributors, so adding a future module to search means
adding one contributor file and registering it here — nothing else changes.
"""

from __future__ import annotations

from typing import Protocol, runtime_checkable

from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.search import SearchHit


@runtime_checkable
class SearchContributor(Protocol):
    """Everything the search service needs from a searchable module."""

    #: Stable module id, matching the frontend ``ModuleId`` union (e.g. "journal").
    module_id: str
    #: Human-readable group title shown in the overlay (e.g. "Journal").
    title: str
    #: Emoji/icon shown beside the group.
    icon: str

    def search(
        self, db: Session, user: User, query: str, limit: int
    ) -> list[SearchHit]:
        """Return this module's hits for ``query``, scoped to ``user``."""


class SearchRegistry:
    """Ordered collection of contributors."""

    def __init__(self) -> None:
        self._contributors: list[SearchContributor] = []

    def register(self, contributor: SearchContributor) -> SearchContributor:
        """Register a contributor (idempotent by ``module_id``)."""
        if any(c.module_id == contributor.module_id for c in self._contributors):
            return contributor
        self._contributors.append(contributor)
        return contributor

    def all(self) -> list[SearchContributor]:
        return list(self._contributors)


#: Process-wide registry. Contributors register themselves on import.
registry = SearchRegistry()
