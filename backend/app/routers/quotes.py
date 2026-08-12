"""Quote endpoint for the Daily Message card."""

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.quote import QuoteRead
from app.services import quote_service
from app.services.quote_service import QuoteNotFoundError

router = APIRouter()


@router.get(
    "/quotes/random",
    response_model=QuoteRead,
    summary="Get a random active motivational quote",
)
def get_random_quote(
    response: Response,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> QuoteRead:
    # The quote is meant to vary per request, so prevent any caching.
    response.headers["Cache-Control"] = "no-store"
    try:
        quote = quote_service.get_random_quote(db)
    except QuoteNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No quotes available"
        )
    return QuoteRead.model_validate(quote)
