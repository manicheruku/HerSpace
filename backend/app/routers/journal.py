"""Journal CRUD, filtering, favorite toggle, and summary endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.journal import (
    JournalCreate,
    JournalRead,
    JournalSummary,
    JournalUpdate,
)
from app.services import journal_service
from app.services.journal_service import JournalEntryNotFoundError

router = APIRouter()

_not_found = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND, detail="Journal entry not found"
)


@router.get(
    "/journal/entries",
    response_model=list[JournalRead],
    summary="List journal entries",
)
def list_entries(
    favorite: bool | None = Query(None),
    tag: str | None = Query(None),
    q: str | None = Query(None),
    limit: int = Query(100, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[JournalRead]:
    entries = journal_service.list_entries(
        db, current_user, favorite=favorite, tag=tag, query=q, limit=limit, offset=offset
    )
    return [JournalRead.model_validate(entry) for entry in entries]


@router.get(
    "/journal/summary",
    response_model=JournalSummary,
    summary="Journal summary for the Explore card",
)
def journal_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> JournalSummary:
    return journal_service.get_summary(db, current_user)


@router.post(
    "/journal/entries",
    response_model=JournalRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a journal entry",
)
def create_entry(
    payload: JournalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> JournalRead:
    entry = journal_service.create_entry(db, current_user, payload)
    return JournalRead.model_validate(entry)


@router.get(
    "/journal/entries/{entry_id}",
    response_model=JournalRead,
    summary="Get a journal entry",
)
def get_entry(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> JournalRead:
    try:
        entry = journal_service.get_entry(db, current_user, entry_id)
    except JournalEntryNotFoundError:
        raise _not_found
    return JournalRead.model_validate(entry)


@router.patch(
    "/journal/entries/{entry_id}",
    response_model=JournalRead,
    summary="Update a journal entry",
)
def update_entry(
    entry_id: int,
    payload: JournalUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> JournalRead:
    try:
        entry = journal_service.update_entry(db, current_user, entry_id, payload)
    except JournalEntryNotFoundError:
        raise _not_found
    return JournalRead.model_validate(entry)


@router.post(
    "/journal/entries/{entry_id}/favorite",
    response_model=JournalRead,
    summary="Toggle favorite on a journal entry",
)
def toggle_favorite(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> JournalRead:
    try:
        entry = journal_service.toggle_favorite(db, current_user, entry_id)
    except JournalEntryNotFoundError:
        raise _not_found
    return JournalRead.model_validate(entry)


@router.delete(
    "/journal/entries/{entry_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a journal entry",
)
def delete_entry(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    try:
        journal_service.delete_entry(db, current_user, entry_id)
    except JournalEntryNotFoundError:
        raise _not_found
