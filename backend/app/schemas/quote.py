"""Quote response schemas for the Daily Message card."""

from app.schemas.common import ORMModel


class QuoteRead(ORMModel):
    """A motivational quote as returned to clients."""

    id: int
    text: str
    author: str | None
