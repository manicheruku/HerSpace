"""Password hashing and JWT helpers.

Python 3.14 removed the ``crypt`` module, so ``passlib`` is unusable. We use the
``bcrypt`` package directly for password hashing and ``PyJWT`` (imported as
``jwt``) for stateless access tokens.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from app.core.config import settings

ALGORITHM = "HS256"

# bcrypt only considers the first 72 bytes of the input. Anything longer is
# silently truncated, so we cap explicitly to keep hashing deterministic and
# avoid surprising behaviour with very long passwords.
_BCRYPT_MAX_BYTES = 72


class TokenError(Exception):
    """Raised when an access token is missing, malformed or expired."""


def _truncate(password: str) -> bytes:
    """Encode a password to UTF-8 and cap it to bcrypt's 72-byte limit."""
    return password.encode("utf-8")[:_BCRYPT_MAX_BYTES]


def hash_password(password: str) -> str:
    """Return a salted bcrypt hash for ``password``."""
    hashed = bcrypt.hashpw(_truncate(password), bcrypt.gensalt())
    return hashed.decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    """Return ``True`` if ``password`` matches the stored bcrypt ``hashed``."""
    try:
        return bcrypt.checkpw(_truncate(password), hashed.encode("utf-8"))
    except (ValueError, TypeError):
        return False


def create_access_token(subject: str | int) -> str:
    """Create a signed JWT whose ``sub`` claim is ``subject``."""
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(subject),
        "iat": now,
        "exp": now + timedelta(minutes=settings.access_token_expire_minutes),
    }
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def decode_access_token(token: str) -> str:
    """Decode ``token`` and return its ``sub`` claim.

    Raises :class:`TokenError` if the token is invalid, expired or missing a
    subject.
    """
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
    except jwt.PyJWTError as exc:  # expired, bad signature, malformed, ...
        raise TokenError("Could not validate credentials") from exc

    subject = payload.get("sub")
    if not subject:
        raise TokenError("Token missing subject")
    return subject
