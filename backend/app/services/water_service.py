"""Water tracker business logic for the Today module."""

from sqlalchemy.orm import Session

from app.models.user import User
from app.models.water_log import WaterLog
from app.repositories.water_log import WaterLogRepository


def get_today(db: Session, user: User) -> WaterLog:
    """Return today's water log for ``user``, creating it if needed."""
    return WaterLogRepository(db).get_or_create_today(user.id)


def increment(db: Session, user: User) -> WaterLog:
    """Add one glass to today's water log."""
    repo = WaterLogRepository(db)
    log = repo.get_or_create_today(user.id)
    return repo.adjust(log, 1)


def decrement(db: Session, user: User) -> WaterLog:
    """Remove one glass from today's water log, clamped at zero."""
    repo = WaterLogRepository(db)
    log = repo.get_or_create_today(user.id)
    return repo.adjust(log, -1)
