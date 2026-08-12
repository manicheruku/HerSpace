"""Aggregates all versioned API routers.

As each module is built (auth, today, planner, ...) its router is included here
behind the ``/api/v1`` prefix.
"""

from fastapi import APIRouter

from app.routers import (
    auth,
    expense,
    goal,
    habit,
    health,
    journal,
    memory,
    note,
    planner,
    quotes,
    search,
    tasks,
    water,
    weather,
)

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(tasks.router, tags=["tasks"])
api_router.include_router(planner.router, tags=["planner"])
api_router.include_router(journal.router, tags=["journal"])
api_router.include_router(memory.router, tags=["memories"])
api_router.include_router(note.router, tags=["notes"])
api_router.include_router(habit.router, tags=["habits"])
api_router.include_router(goal.router, tags=["goals"])
api_router.include_router(expense.router, tags=["expenses"])
api_router.include_router(water.router, prefix="/water", tags=["water"])
api_router.include_router(weather.router, tags=["weather"])
api_router.include_router(quotes.router, tags=["quotes"])
api_router.include_router(search.router, tags=["search"])
