"""Model package.

Import concrete models here as modules are added so that Alembic autogeneration
and ``Base.metadata`` can discover every table from a single import.
"""

from app.core.database import Base
from app.models.user import User

__all__ = ["Base", "User"]
