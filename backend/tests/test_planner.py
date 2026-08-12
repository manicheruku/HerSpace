"""Tests for the planner module (scheduling fields, filters, reschedule)."""

from datetime import date, timedelta

from fastapi import status

AUTH = "/api/v1/auth"
TASKS = "/api/v1/tasks"
PLANNER = "/api/v1/planner"


def _auth_headers(client, email="planner@example.com"):
    payload = {"name": "Plan", "email": email, "password": "supersecret123"}
    token = client.post(f"{AUTH}/register", json=payload).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def _today() -> str:
    return date.today().isoformat()


def _tomorrow() -> str:
    return (date.today() + timedelta(days=1)).isoformat()


def test_create_task_with_scheduling_fields(client):
    headers = _auth_headers(client)
    resp = client.post(
        TASKS,
        json={
            "title": "Design review",
            "priority": "high",
            "notes": "bring mockups",
            "due_date": _today(),
            "due_time": "14:30:00",
            "category": "Work",
            "reminder_at": f"{_today()}T14:00:00Z",
        },
        headers=headers,
    )
    assert resp.status_code == status.HTTP_201_CREATED
    body = resp.json()
    assert body["due_date"] == _today()
    assert body["due_time"] == "14:30:00"
    assert body["category"] == "Work"
    assert body["reminder_at"] is not None


def test_scheduling_fields_optional(client):
    headers = _auth_headers(client)
    resp = client.post(TASKS, json={"title": "Loose task"}, headers=headers)
    assert resp.status_code == status.HTTP_201_CREATED
    body = resp.json()
    assert body["due_date"] is None
    assert body["due_time"] is None
    assert body["category"] is None
    assert body["reminder_at"] is None


def test_planner_filter_today(client):
    headers = _auth_headers(client)
    client.post(TASKS, json={"title": "Today task", "due_date": _today()}, headers=headers)
    client.post(TASKS, json={"title": "Tomorrow task", "due_date": _tomorrow()}, headers=headers)
    client.post(TASKS, json={"title": "Undated task"}, headers=headers)

    resp = client.get(f"{PLANNER}/tasks", params={"filter": "today"}, headers=headers)
    assert resp.status_code == status.HTTP_200_OK
    titles = [t["title"] for t in resp.json()]
    assert titles == ["Today task"]


def test_planner_filter_upcoming(client):
    headers = _auth_headers(client)
    client.post(TASKS, json={"title": "Today task", "due_date": _today()}, headers=headers)
    client.post(TASKS, json={"title": "Tomorrow task", "due_date": _tomorrow()}, headers=headers)

    resp = client.get(f"{PLANNER}/tasks", params={"filter": "upcoming"}, headers=headers)
    titles = [t["title"] for t in resp.json()]
    assert titles == ["Tomorrow task"]


def test_planner_filter_completed(client):
    headers = _auth_headers(client)
    task_id = client.post(
        TASKS, json={"title": "Done task", "due_date": _today()}, headers=headers
    ).json()["id"]
    client.post(TASKS, json={"title": "Open task", "due_date": _today()}, headers=headers)
    client.patch(f"{TASKS}/{task_id}", json={"is_completed": True}, headers=headers)

    resp = client.get(f"{PLANNER}/tasks", params={"filter": "completed"}, headers=headers)
    titles = [t["title"] for t in resp.json()]
    assert titles == ["Done task"]


def test_planner_orders_scheduled_before_undated(client):
    headers = _auth_headers(client)
    client.post(TASKS, json={"title": "Undated"}, headers=headers)
    client.post(
        TASKS,
        json={"title": "Timed", "due_date": _today(), "due_time": "09:00:00"},
        headers=headers,
    )

    resp = client.get(f"{PLANNER}/tasks", params={"filter": "all"}, headers=headers)
    titles = [t["title"] for t in resp.json()]
    assert titles == ["Timed", "Undated"]


def test_reschedule_task(client):
    headers = _auth_headers(client)
    task_id = client.post(TASKS, json={"title": "Movable"}, headers=headers).json()["id"]

    resp = client.post(
        f"{PLANNER}/tasks/{task_id}/reschedule",
        json={"due_date": _tomorrow(), "due_time": "08:15:00"},
        headers=headers,
    )
    assert resp.status_code == status.HTTP_200_OK
    body = resp.json()
    assert body["due_date"] == _tomorrow()
    assert body["due_time"] == "08:15:00"


def test_reschedule_missing_task_returns_404(client):
    headers = _auth_headers(client)
    resp = client.post(
        f"{PLANNER}/tasks/9999/reschedule",
        json={"due_date": _today()},
        headers=headers,
    )
    assert resp.status_code == status.HTTP_404_NOT_FOUND


def test_planner_isolated_per_user(client):
    owner = _auth_headers(client, email="owner2@example.com")
    other = _auth_headers(client, email="other2@example.com")
    client.post(TASKS, json={"title": "Owner task", "due_date": _today()}, headers=owner)

    resp = client.get(f"{PLANNER}/tasks", params={"filter": "today"}, headers=other)
    assert resp.status_code == status.HTTP_200_OK
    assert resp.json() == []


def test_planner_requires_auth(client):
    resp = client.get(f"{PLANNER}/tasks")
    assert resp.status_code in (
        status.HTTP_401_UNAUTHORIZED,
        status.HTTP_403_FORBIDDEN,
    )
