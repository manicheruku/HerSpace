"""Water tracker endpoints for the Today module."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.water import WaterRead
from app.services import water_service

router = APIRouter()


@router.get("/today", response_model=WaterRead, summary="Get today's water intake")
def get_today(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> WaterRead:
    log = water_service.get_today(db, current_user)
    return WaterRead.model_validate(log)


@router.post(
    "/increment", response_model=WaterRead, summary="Add a glass of water"
)
def increment(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> WaterRead:
    log = water_service.increment(db, current_user)
    return WaterRead.model_validate(log)


@router.post(
    "/decrement", response_model=WaterRead, summary="Remove a glass of water"
)
def decrement(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> WaterRead:
    log = water_service.decrement(db, current_user)
    return WaterRead.model_validate(log)
