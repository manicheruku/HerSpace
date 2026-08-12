"""Global Search service: fan out a query across all registered modules."""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.search import SearchGroup, SearchResponse
from app.search.registry import registry

#: Minimum query length before we hit the database.
MIN_QUERY_LENGTH = 2
#: Default per-module hit cap.
DEFAULT_LIMIT = 5


def search(
    db: Session, user: User, query: str, limit: int = DEFAULT_LIMIT
) -> SearchResponse:
    """Run ``query`` against every registered contributor and group the results."""
    cleaned = query.strip()
    if len(cleaned) < MIN_QUERY_LENGTH:
        return SearchResponse(query=cleaned, total=0, groups=[])

    groups: list[SearchGroup] = []
    total = 0
    for contributor in registry.all():
        hits = contributor.search(db, user, cleaned, limit)
        if not hits:
            continue
        total += len(hits)
        groups.append(
            SearchGroup(
                module=contributor.module_id,
                title=contributor.title,
                icon=contributor.icon,
                hits=hits,
            )
        )

    return SearchResponse(query=cleaned, total=total, groups=groups)
