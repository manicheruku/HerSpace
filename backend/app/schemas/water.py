"""Water tracker response schema for the Today module."""

from datetime import date

from app.schemas.common import ORMModel


class WaterRead(ORMModel):
    """A single day's water intake as returned to clients."""

    log_date: date
    glasses: int
    goal: int
