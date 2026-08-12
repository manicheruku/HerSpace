"""Persistence layer for :class:`~app.models.water_log.WaterLog`."""

from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.water_log import WaterLog
from app.repositories.base import BaseRepository


class WaterLogRepository(BaseRepository[WaterLog]):
    """Water-log queries on top of the generic CRUD repository."""

    def __init__(self, db: Session) -> None:
        super().__init__(WaterLog, db)

    def get_or_create_today(
        self, user_id: int, *, goal_default: int = 8
    ) -> WaterLog:
        """Return today's water log for the user, creating an empty one if absent.

        A new day naturally produces a new dated row, leaving prior days intact.
        """
        today = date.today()
        stmt = select(WaterLog).where(
            WaterLog.user_id == user_id, WaterLog.log_date == today
        )
        log = self.db.scalars(stmt).first()
        if log is None:
            log = WaterLog(
                user_id=user_id, log_date=today, glasses=0, goal=goal_default
            )
            self.db.add(log)
            self.db.commit()
            self.db.refresh(log)
        return log

    def adjust(self, log: WaterLog, delta: int) -> WaterLog:
        """Add ``delta`` glasses to the log, clamped at a minimum of zero."""
        log.glasses = max(0, log.glasses + delta)
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)
        return log
