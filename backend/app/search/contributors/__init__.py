"""Imports every search contributor so it registers itself on startup.

Add a new module to Global Search by creating a contributor module here and
importing it below. No other file in the search package changes.
"""

from app.search.contributors import (  # noqa: F401
	expense,
	goal,
	habit,
	journal,
	memory,
	note,
	tasks,
)

__all__ = ["expense", "goal", "habit", "journal", "memory", "note", "tasks"]
