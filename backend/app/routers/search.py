"""Global Search endpoint.

A single, module-agnostic entry point that returns results grouped by module.
The set of searched modules is driven entirely by the search registry, so this
router never changes as new modules become searchable.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.search import SearchResponse
from app.search import service as search_service

router = APIRouter()


@router.get(
    "/search",
    response_model=SearchResponse,
    summary="Global search across all modules",
)
def global_search(
    q: str = Query("", description="Search term"),
    limit: int = Query(5, ge=1, le=20, description="Max hits per module"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SearchResponse:
    return search_service.search(db, current_user, q, limit)
