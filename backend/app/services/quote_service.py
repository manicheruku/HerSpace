"""Quote business logic for the Daily Message card.

Keeps quote selection out of the router so the endpoint stays thin and the
logic stays testable.
"""

from sqlalchemy.orm import Session

from app.models.quote import Quote
from app.repositories.quote import QuoteRepository


class QuoteNotFoundError(Exception):
    """Raised when no active quote is available to serve."""


def get_random_quote(db: Session) -> Quote:
    """Return a random active quote, raising :class:`QuoteNotFoundError` if none."""
    quote = QuoteRepository(db).get_random_active()
    if quote is None:
        raise QuoteNotFoundError
    return quote
