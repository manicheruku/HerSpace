"""Shared FastAPI dependencies."""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import TokenError, decode_access_token
from app.models.user import User
from app.repositories.user import UserRepository

_bearer_scheme = HTTPBearer(auto_error=True)

_credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Resolve and validate the bearer token into the active user."""
    try:
        subject = decode_access_token(credentials.credentials)
        user_id = int(subject)
    except (TokenError, ValueError):
        raise _credentials_exception

    user = UserRepository(db).get(user_id)
    if user is None or not user.is_active:
        raise _credentials_exception
    return user
