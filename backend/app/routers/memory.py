"""Memories CRUD, filtering, favorite toggle, and summary endpoints."""

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.memory import MemoryCreate, MemoryRead, MemorySummary, MemoryUpdate
from app.services import memory_service
from app.services.memory_service import MemoryNotFoundError

router = APIRouter()

_not_found = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND, detail="Memory not found"
)


@router.get("/memories/entries", response_model=list[MemoryRead], summary="List memories")
def list_memories(
    favorite: bool | None = Query(None),
    mood: str | None = Query(None),
    q: str | None = Query(None),
    from_date: date | None = Query(None, alias="from"),
    to_date: date | None = Query(None, alias="to"),
    limit: int = Query(100, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[MemoryRead]:
    memories = memory_service.list_memories(
        db,
        current_user,
        favorite=favorite,
        mood=mood,
        query=q,
        from_date=from_date,
        to_date=to_date,
        limit=limit,
        offset=offset,
    )
    return [MemoryRead.model_validate(memory) for memory in memories]


@router.get(
    "/memories/summary",
    response_model=MemorySummary,
    summary="Memories summary for the Explore card",
)
def memories_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MemorySummary:
    return memory_service.get_summary(db, current_user)


@router.post(
    "/memories/entries",
    response_model=MemoryRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a memory",
)
def create_memory(
    payload: MemoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MemoryRead:
    memory = memory_service.create_memory(db, current_user, payload)
    return MemoryRead.model_validate(memory)


@router.get(
    "/memories/entries/{memory_id}", response_model=MemoryRead, summary="Get a memory"
)
def get_memory(
    memory_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MemoryRead:
    try:
        memory = memory_service.get_memory(db, current_user, memory_id)
    except MemoryNotFoundError:
        raise _not_found
    return MemoryRead.model_validate(memory)


@router.patch(
    "/memories/entries/{memory_id}", response_model=MemoryRead, summary="Update a memory"
)
def update_memory(
    memory_id: int,
    payload: MemoryUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MemoryRead:
    try:
        memory = memory_service.update_memory(db, current_user, memory_id, payload)
    except MemoryNotFoundError:
        raise _not_found
    return MemoryRead.model_validate(memory)


@router.post(
    "/memories/entries/{memory_id}/favorite",
    response_model=MemoryRead,
    summary="Toggle favorite on a memory",
)
def toggle_favorite(
    memory_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MemoryRead:
    try:
        memory = memory_service.toggle_favorite(db, current_user, memory_id)
    except MemoryNotFoundError:
        raise _not_found
    return MemoryRead.model_validate(memory)


@router.delete(
    "/memories/entries/{memory_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a memory",
)
def delete_memory(
    memory_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    try:
        memory_service.delete_memory(db, current_user, memory_id)
    except MemoryNotFoundError:
        raise _not_found
