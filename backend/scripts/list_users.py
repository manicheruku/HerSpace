"""Quick helper to list users from the local SQLite dev database.

Usage (from the backend/ folder):
    ..\\.venv\\Scripts\\python.exe scripts/list_users.py
"""

import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent / "herspace.db"


def main() -> None:
    if not DB_PATH.exists():
        print(f"No database found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        rows = conn.execute(
            "SELECT id, name, email, is_active, created_at FROM users ORDER BY id"
        ).fetchall()
    finally:
        conn.close()

    print(f"{'id':<4}{'name':<20}{'email':<28}{'active':<8}created_at")
    print("-" * 78)
    for r in rows:
        print(f"{r['id']:<4}{r['name']:<20}{r['email']:<28}{r['is_active']:<8}{r['created_at']}")
    print(f"\n{len(rows)} user(s)")


if __name__ == "__main__":
    main()
