"""Aggregates all versioned API routers.

As each module is built (auth, today, planner, ...) its router is included here
behind the ``/api/v1`` prefix.
"""

from fastapi import APIRouter

from app.routers import auth, health

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
