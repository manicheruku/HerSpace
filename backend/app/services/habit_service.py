"""Habits business logic: ownership enforcement + streak/progress derivation.

Streaks and counts are computed from :class:`HabitCheckin` rows rather than
stored, so there is a single source of truth and no counters to reconcile.
"""

from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.models.habit import Habit
from app.models.user import User
from app.repositories.habit import HabitRepository
from app.schemas.habit import HabitCreate, HabitRead, HabitSummary, HabitUpdate

#: How many recent completed dates to surface to the UI heatmap/detail view.
RECENT_CHECKIN_LIMIT = 14
#: Window used for the "this week" completion count.
WEEK_WINDOW_DAYS = 7


class HabitNotFoundError(Exception):
    """Raised when a habit does not exist or is not owned by the user."""


def _current_streak(dates: set[date], today: date) -> int:
    """Count consecutive completed days ending today (or yesterday if pending).

    A habit not yet done *today* does not break an otherwise-live streak — the
    run is measured from yesterday so users keep credit until the day ends.
    """
    cursor = today if today in dates else today - timedelta(days=1)
    streak = 0
    while cursor in dates:
        streak += 1
        cursor -= timedelta(days=1)
    return streak


def _longest_streak(sorted_dates: list[date]) -> int:
    """Longest run of consecutive days across all history (dates ascending)."""
    longest = 0
    run = 0
    previous: date | None = None
    for current in sorted_dates:
        if previous is not None and current - previous == timedelta(days=1):
            run += 1
        else:
            run = 1
        longest = max(longest, run)
        previous = current
    return longest


def _to_read(repo: HabitRepository, habit: Habit, today: date) -> HabitRead:
    dates_desc = repo.checkin_dates(habit.id)
    date_set = set(dates_desc)
    week_start = today - timedelta(days=WEEK_WINDOW_DAYS - 1)
    return HabitRead(
        id=habit.id,
        name=habit.name,
        emoji=habit.emoji,
        color=habit.color,  # type: ignore[arg-type]
        is_archived=habit.is_archived,
        created_at=habit.created_at,
        updated_at=habit.updated_at,
        current_streak=_current_streak(date_set, today),
        longest_streak=_longest_streak(sorted(date_set)),
        completed_today=today in date_set,
        total_checkins=len(date_set),
        week_count=sum(1 for d in date_set if week_start <= d <= today),
        recent_checkins=dates_desc[:RECENT_CHECKIN_LIMIT],
    )


def list_habits(
    db: Session,
    user: User,
    *,
    today: date,
    include_archived: bool = False,
    query: str | None = None,
) -> list[HabitRead]:
    repo = HabitRepository(db)
    habits = repo.list_for_user(
        user.id, include_archived=include_archived, query=query
    )
    return [_to_read(repo, habit, today) for habit in habits]


def get_habit(db: Session, user: User, habit_id: int, *, today: date) -> HabitRead:
    repo = HabitRepository(db)
    habit = repo.get_for_user(habit_id, user.id)
    if habit is None:
        raise HabitNotFoundError(habit_id)
    return _to_read(repo, habit, today)


def create_habit(
    db: Session, user: User, data: HabitCreate, *, today: date
) -> HabitRead:
    repo = HabitRepository(db)
    habit = repo.create_for_user(user.id, data)
    return _to_read(repo, habit, today)


def update_habit(
    db: Session, user: User, habit_id: int, data: HabitUpdate, *, today: date
) -> HabitRead:
    repo = HabitRepository(db)
    habit = repo.get_for_user(habit_id, user.id)
    if habit is None:
        raise HabitNotFoundError(habit_id)
    repo.apply_update(habit, data)
    return _to_read(repo, habit, today)


def toggle_checkin(
    db: Session, user: User, habit_id: int, *, on: date, today: date
) -> HabitRead:
    """Mark or unmark a habit as done on ``on``; returns the updated habit."""
    repo = HabitRepository(db)
    habit = repo.get_for_user(habit_id, user.id)
    if habit is None:
        raise HabitNotFoundError(habit_id)
    existing = repo.get_checkin(habit.id, on)
    if existing is None:
        repo.add_checkin(habit, on)
    else:
        repo.remove_checkin(existing)
    return _to_read(repo, habit, today)


def delete_habit(db: Session, user: User, habit_id: int) -> None:
    repo = HabitRepository(db)
    habit = repo.get_for_user(habit_id, user.id)
    if habit is None:
        raise HabitNotFoundError(habit_id)
    repo.delete(habit)


def get_summary(db: Session, user: User, *, today: date) -> HabitSummary:
    """Build the compact summary that powers the Explore Habits card."""
    repo = HabitRepository(db)
    habits = repo.list_for_user(user.id, include_archived=False)
    best_streak = 0
    for habit in habits:
        streak = _current_streak(set(repo.checkin_dates(habit.id)), today)
        best_streak = max(best_streak, streak)
    latest = repo.latest_for_user(user.id)
    return HabitSummary(
        active_count=len(habits),
        checked_in_today=repo.checked_in_today_count(user.id, today),
        best_streak=best_streak,
        latest_name=latest.name if latest else None,
    )
