"""Goals business logic.

Keeps ownership enforcement and persistence orchestration out of the router so
endpoints stay thin and domain rules stay testable.
"""

from sqlalchemy.orm import Session

from app.models.goal import Goal
from app.models.user import User
from app.repositories.goal import GoalRepository
from app.schemas.goal import GoalAdvanceInput, GoalCreate, GoalRead, GoalSummary, GoalUpdate


class GoalNotFoundError(Exception):
    """Raised when a goal does not exist or is not owned by the user."""


def _progress_percent(current: int, target: int) -> int:
    if target <= 0:
        return 0
    pct = round((current / target) * 100)
    return max(0, min(100, pct))


def _to_read(goal: Goal) -> GoalRead:
    return GoalRead(
        id=goal.id,
        title=goal.title,
        description=goal.description,
        unit=goal.unit,
        target_value=goal.target_value,
        current_value=goal.current_value,
        due_date=goal.due_date,
        is_completed=goal.is_completed,
        is_archived=goal.is_archived,
        created_at=goal.created_at,
        updated_at=goal.updated_at,
        progress_percent=_progress_percent(goal.current_value, goal.target_value),
    )


def list_goals(
    db: Session,
    user: User,
    *,
    include_archived: bool = False,
    query: str | None = None,
) -> list[GoalRead]:
    goals = GoalRepository(db).list_for_user(
        user.id, include_archived=include_archived, query=query
    )
    return [_to_read(goal) for goal in goals]


def get_goal(db: Session, user: User, goal_id: int) -> GoalRead:
    goal = GoalRepository(db).get_for_user(goal_id, user.id)
    if goal is None:
        raise GoalNotFoundError(goal_id)
    return _to_read(goal)


def create_goal(db: Session, user: User, data: GoalCreate) -> GoalRead:
    repo = GoalRepository(db)
    goal = repo.create_for_user(user.id, data)
    _sync_completion(repo, goal)
    return _to_read(goal)


def update_goal(db: Session, user: User, goal_id: int, data: GoalUpdate) -> GoalRead:
    repo = GoalRepository(db)
    goal = repo.get_for_user(goal_id, user.id)
    if goal is None:
        raise GoalNotFoundError(goal_id)
    goal = repo.apply_update(goal, data)
    _sync_completion(repo, goal)
    return _to_read(goal)


def advance_goal(
    db: Session, user: User, goal_id: int, payload: GoalAdvanceInput
) -> GoalRead:
    repo = GoalRepository(db)
    goal = repo.get_for_user(goal_id, user.id)
    if goal is None:
        raise GoalNotFoundError(goal_id)

    next_value = max(0, goal.current_value + payload.amount)
    goal = repo.apply_update(goal, GoalUpdate(current_value=next_value))
    _sync_completion(repo, goal)
    return _to_read(goal)


def delete_goal(db: Session, user: User, goal_id: int) -> None:
    repo = GoalRepository(db)
    goal = repo.get_for_user(goal_id, user.id)
    if goal is None:
        raise GoalNotFoundError(goal_id)
    repo.delete(goal)


def get_summary(db: Session, user: User) -> GoalSummary:
    repo = GoalRepository(db)
    goals = repo.list_for_user(user.id, include_archived=False)

    if goals:
        total = sum(goal.target_value for goal in goals)
        current = sum(min(goal.current_value, goal.target_value) for goal in goals)
        overall_progress = _progress_percent(current, total)
    else:
        overall_progress = 0

    latest = repo.latest_for_user(user.id)

    return GoalSummary(
        active_count=repo.count_active(user.id),
        completed_count=repo.count_completed(user.id),
        overall_progress=overall_progress,
        last_updated=latest.updated_at if latest else None,
        latest_title=latest.title if latest else None,
    )


def _sync_completion(repo: GoalRepository, goal: Goal) -> Goal:
    should_complete = goal.current_value >= goal.target_value
    if goal.is_completed != should_complete:
        goal = repo.apply_update(goal, GoalUpdate(is_completed=should_complete))
    return goal
