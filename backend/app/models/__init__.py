"""Model package.

Import concrete models here as modules are added so that Alembic autogeneration
and ``Base.metadata`` can discover every table from a single import.
"""

from app.core.database import Base
from app.models.expense import Expense
from app.models.goal import Goal
from app.models.habit import Habit, HabitCheckin
from app.models.journal_entry import JournalEntry
from app.models.memory import Memory
from app.models.note import Note
from app.models.quote import Quote
from app.models.task import Task
from app.models.user import User
from app.models.water_log import WaterLog

__all__ = [
    "Base",
    "Expense",
    "Goal",
    "Habit",
    "HabitCheckin",
    "JournalEntry",
    "Memory",
    "Note",
    "Quote",
    "Task",
    "User",
    "WaterLog",
]
