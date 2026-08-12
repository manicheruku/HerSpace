"""Persistence layer for :class:`~app.models.goal.Goal`."""

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.goal import Goal
from app.repositories.base import BaseRepository
from app.schemas.goal import GoalCreate, GoalUpdate


class GoalRepository(BaseRepository[Goal]):
    """Goal-specific queries on top of the generic CRUD repository."""

    def __init__(self, db: Session) -> None:
        super().__init__(Goal, db)

    def list_for_user(
        self,
        user_id: int,
        *,
        include_archived: bool = False,
        query: str | None = None,
    ) -> list[Goal]:
        stmt = select(Goal).where(Goal.user_id == user_id)

        if not include_archived:
            stmt = stmt.where(Goal.is_archived.is_(False))

        if query:
            pattern = f"%{query.replace('%', r'\\%').replace('_', r'\\_')}%"
            stmt = stmt.where(
                Goal.title.ilike(pattern) | Goal.description.ilike(pattern)
            )

        stmt = stmt.order_by(Goal.updated_at.desc(), Goal.id.desc())
        return list(self.db.scalars(stmt).all())

    def get_for_user(self, goal_id: int, user_id: int) -> Goal | None:
        stmt = select(Goal).where(Goal.id == goal_id, Goal.user_id == user_id)
        return self.db.scalars(stmt).first()

    def create_for_user(self, user_id: int, data: GoalCreate) -> Goal:
        goal = Goal(user_id=user_id, **data.model_dump())
        return self.create(goal)

    def apply_update(self, goal: Goal, data: GoalUpdate) -> Goal:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(goal, field, value)
        return self.update(goal)

    def count_active(self, user_id: int) -> int:
        stmt = select(func.count(Goal.id)).where(
            Goal.user_id == user_id,
            Goal.is_archived.is_(False),
            Goal.is_completed.is_(False),
        )
        return int(self.db.scalar(stmt) or 0)

    def count_completed(self, user_id: int) -> int:
        stmt = select(func.count(Goal.id)).where(
            Goal.user_id == user_id,
            Goal.is_archived.is_(False),
            Goal.is_completed.is_(True),
        )
        return int(self.db.scalar(stmt) or 0)

    def latest_for_user(self, user_id: int) -> Goal | None:
        stmt = (
            select(Goal)
            .where(Goal.user_id == user_id)
            .order_by(Goal.updated_at.desc(), Goal.id.desc())
            .limit(1)
        )
        return self.db.scalars(stmt).first()
