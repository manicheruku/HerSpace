"""Authentication business logic.

Keeps password hashing, duplicate detection and credential verification out of
the router so endpoints stay thin and the logic stays testable.
"""

from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.models.user import User
from app.repositories.user import UserRepository


class EmailAlreadyExistsError(Exception):
    """Raised when registering with an email that is already taken."""


def register_user(db: Session, *, name: str, email: str, password: str) -> User:
    """Create a new user, raising on a duplicate email."""
    repo = UserRepository(db)
    if repo.get_by_email(email) is not None:
        raise EmailAlreadyExistsError(email)
    return repo.create_user(
        name=name,
        email=email,
        hashed_password=hash_password(password),
    )


def authenticate(db: Session, *, email: str, password: str) -> User | None:
    """Return the matching active user, or ``None`` on bad credentials."""
    repo = UserRepository(db)
    user = repo.get_by_email(email)
    if user is None or not user.is_active:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user
