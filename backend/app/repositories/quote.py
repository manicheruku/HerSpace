"""Persistence layer for :class:`~app.models.quote.Quote`."""

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.quote import Quote
from app.repositories.base import BaseRepository


class QuoteRepository(BaseRepository[Quote]):
    """Quote-specific queries on top of the generic CRUD repository."""

    def __init__(self, db: Session) -> None:
        super().__init__(Quote, db)

    def get_random_active(self) -> Quote | None:
        """Return a single random active quote, or ``None`` if there are none.

        ``func.random()`` is supported by both SQLite and PostgreSQL, so the same
        query works in development and production.
        """
        stmt = (
            select(Quote)
            .where(Quote.is_active.is_(True))
            .order_by(func.random())
            .limit(1)
        )
        return self.db.scalars(stmt).first()
