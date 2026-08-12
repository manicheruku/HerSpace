"""Persistence layer for :class:`~app.models.habit.Habit` and check-ins."""

from datetime import date

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.habit import Habit, HabitCheckin
from app.repositories.base import BaseRepository
from app.schemas.habit import HabitCreate, HabitUpdate


class HabitRepository(BaseRepository[Habit]):
    """Habit-specific queries on top of the generic CRUD repository."""

    def __init__(self, db: Session) -> None:
        super().__init__(Habit, db)

    def list_for_user(
        self,
        user_id: int,
        *,
        include_archived: bool = False,
        query: str | None = None,
    ) -> list[Habit]:
        """Return a user's habits, newest first, with optional filters."""
        stmt = select(Habit).where(Habit.user_id == user_id)

        if not include_archived:
            stmt = stmt.where(Habit.is_archived.is_(False))

        if query:
            pattern = f"%{query.replace('%', r'\%').replace('_', r'\_')}%"
            stmt = stmt.where(Habit.name.ilike(pattern))

        stmt = stmt.order_by(Habit.created_at.desc(), Habit.id.desc())
        return list(self.db.scalars(stmt).all())

    def get_for_user(self, habit_id: int, user_id: int) -> Habit | None:
        stmt = select(Habit).where(Habit.id == habit_id, Habit.user_id == user_id)
        return self.db.scalars(stmt).first()

    def create_for_user(self, user_id: int, data: HabitCreate) -> Habit:
        habit = Habit(user_id=user_id, **data.model_dump())
        return self.create(habit)

    def apply_update(self, habit: Habit, data: HabitUpdate) -> Habit:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(habit, field, value)
        return self.update(habit)

    def count_active(self, user_id: int) -> int:
        stmt = select(func.count(Habit.id)).where(
            Habit.user_id == user_id, Habit.is_archived.is_(False)
        )
        return int(self.db.scalar(stmt) or 0)

    def latest_for_user(self, user_id: int) -> Habit | None:
        stmt = (
            select(Habit)
            .where(Habit.user_id == user_id, Habit.is_archived.is_(False))
            .order_by(Habit.created_at.desc(), Habit.id.desc())
            .limit(1)
        )
        return self.db.scalars(stmt).first()

    # --- Check-ins -----------------------------------------------------------

    def checkin_dates(self, habit_id: int) -> list[date]:
        """All completed dates for a habit, newest first."""
        stmt = (
            select(HabitCheckin.checkin_date)
            .where(HabitCheckin.habit_id == habit_id)
            .order_by(HabitCheckin.checkin_date.desc())
        )
        return list(self.db.scalars(stmt).all())

    def get_checkin(self, habit_id: int, on: date) -> HabitCheckin | None:
        stmt = select(HabitCheckin).where(
            HabitCheckin.habit_id == habit_id, HabitCheckin.checkin_date == on
        )
        return self.db.scalars(stmt).first()

    def add_checkin(self, habit: Habit, on: date) -> HabitCheckin:
        checkin = HabitCheckin(
            habit_id=habit.id, user_id=habit.user_id, checkin_date=on
        )
        self.db.add(checkin)
        self.db.commit()
        self.db.refresh(checkin)
        return checkin

    def remove_checkin(self, checkin: HabitCheckin) -> None:
        self.db.delete(checkin)
        self.db.commit()

    def checked_in_today_count(self, user_id: int, today: date) -> int:
        """How many of a user's active habits are completed today."""
        stmt = (
            select(func.count(func.distinct(HabitCheckin.habit_id)))
            .join(Habit, Habit.id == HabitCheckin.habit_id)
            .where(
                HabitCheckin.user_id == user_id,
                HabitCheckin.checkin_date == today,
                Habit.is_archived.is_(False),
            )
        )
        return int(self.db.scalar(stmt) or 0)
