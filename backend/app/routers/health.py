"""Health and readiness endpoints used by load balancers and uptime checks."""

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.schemas.common import HealthResponse
from app.version import __version__

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse, summary="Liveness check")
def health() -> HealthResponse:
    """Return basic service metadata. Always cheap and dependency-free."""
    return HealthResponse(
        status="ok",
        app=settings.app_name,
        environment=settings.environment,
        version=__version__,
    )


@router.get("/health/ready", summary="Readiness check")
def readiness(db: Session = Depends(get_db)) -> dict[str, str]:
    """Verify the database connection is reachable."""
    db.execute(text("SELECT 1"))
    return {"status": "ready", "database": "ok"}
