"""Notes CRUD, filtering, pin toggle, and summary endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.note import NoteCreate, NoteRead, NoteSummary, NoteUpdate
from app.services import note_service
from app.services.note_service import NoteNotFoundError

router = APIRouter()

_not_found = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND, detail="Note not found"
)


@router.get("/notes/entries", response_model=list[NoteRead], summary="List notes")
def list_notes(
    pinned: bool | None = Query(None),
    tag: str | None = Query(None),
    q: str | None = Query(None),
    limit: int = Query(100, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[NoteRead]:
    notes = note_service.list_notes(
        db, current_user, pinned=pinned, tag=tag, query=q, limit=limit, offset=offset
    )
    return [NoteRead.model_validate(note) for note in notes]


@router.get(
    "/notes/summary",
    response_model=NoteSummary,
    summary="Notes summary for the Explore card",
)
def notes_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> NoteSummary:
    return note_service.get_summary(db, current_user)


@router.post(
    "/notes/entries",
    response_model=NoteRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a note",
)
def create_note(
    payload: NoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> NoteRead:
    note = note_service.create_note(db, current_user, payload)
    return NoteRead.model_validate(note)


@router.get(
    "/notes/entries/{note_id}", response_model=NoteRead, summary="Get a note"
)
def get_note(
    note_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> NoteRead:
    try:
        note = note_service.get_note(db, current_user, note_id)
    except NoteNotFoundError:
        raise _not_found
    return NoteRead.model_validate(note)


@router.patch(
    "/notes/entries/{note_id}", response_model=NoteRead, summary="Update a note"
)
def update_note(
    note_id: int,
    payload: NoteUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> NoteRead:
    try:
        note = note_service.update_note(db, current_user, note_id, payload)
    except NoteNotFoundError:
        raise _not_found
    return NoteRead.model_validate(note)


@router.post(
    "/notes/entries/{note_id}/pin",
    response_model=NoteRead,
    summary="Toggle pin on a note",
)
def toggle_pin(
    note_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> NoteRead:
    try:
        note = note_service.toggle_pinned(db, current_user, note_id)
    except NoteNotFoundError:
        raise _not_found
    return NoteRead.model_validate(note)


@router.delete(
    "/notes/entries/{note_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a note",
)
def delete_note(
    note_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    try:
        note_service.delete_note(db, current_user, note_id)
    except NoteNotFoundError:
        raise _not_found
