"""Tests for the Habits module (CRUD, check-ins, streaks, summary, search)."""

from datetime import date, timedelta

from fastapi import status

AUTH = "/api/v1/auth"
HABITS = "/api/v1/habits"
SEARCH = "/api/v1/search"


def _auth_headers(client, email="habits@example.com"):
    payload = {"name": "Habiter", "email": email, "password": "supersecret123"}
    token = client.post(f"{AUTH}/register", json=payload).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def _create(client, headers, **overrides):
    body = {"name": "Drink water"}
    body.update(overrides)
    return client.post(HABITS, json=body, headers=headers)


def test_create_habit(client):
    headers = _auth_headers(client)
    resp = _create(client, headers, emoji="💧", color="sky")
    assert resp.status_code == status.HTTP_201_CREATED
    body = resp.json()
    assert body["name"] == "Drink water"
    assert body["emoji"] == "💧"
    assert body["color"] == "sky"
    assert body["is_archived"] is False
    assert body["current_streak"] == 0
    assert body["longest_streak"] == 0
    assert body["completed_today"] is False
    assert body["total_checkins"] == 0
    assert body["week_count"] == 0
    assert body["recent_checkins"] == []


def test_create_requires_name(client):
    headers = _auth_headers(client)
    resp = client.post(HABITS, json={"name": ""}, headers=headers)
    assert resp.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_invalid_color_rejected(client):
    headers = _auth_headers(client)
    resp = _create(client, headers, color="neon")
    assert resp.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_list_newest_first(client):
    headers = _auth_headers(client)
    _create(client, headers, name="First")
    _create(client, headers, name="Second")
    resp = client.get(HABITS, headers=headers)
    names = [h["name"] for h in resp.json()]
    assert names == ["Second", "First"]


def test_get_habit(client):
    headers = _auth_headers(client)
    habit_id = _create(client, headers).json()["id"]
    resp = client.get(f"{HABITS}/{habit_id}", headers=headers)
    assert resp.status_code == status.HTTP_200_OK
    assert resp.json()["id"] == habit_id


def test_update_habit(client):
    headers = _auth_headers(client)
    habit_id = _create(client, headers).json()["id"]
    resp = client.patch(
        f"{HABITS}/{habit_id}",
        json={"name": "Meditate", "color": "lilac"},
        headers=headers,
    )
    assert resp.status_code == status.HTTP_200_OK
    assert resp.json()["name"] == "Meditate"
    assert resp.json()["color"] == "lilac"


def test_toggle_checkin_today(client):
    headers = _auth_headers(client)
    habit_id = _create(client, headers).json()["id"]

    on = client.post(f"{HABITS}/{habit_id}/check", headers=headers)
    body = on.json()
    assert body["completed_today"] is True
    assert body["current_streak"] == 1
    assert body["total_checkins"] == 1
    assert body["week_count"] == 1

    off = client.post(f"{HABITS}/{habit_id}/check", headers=headers)
    body = off.json()
    assert body["completed_today"] is False
    assert body["current_streak"] == 0
    assert body["total_checkins"] == 0


def test_streak_counts_consecutive_days(client):
    headers = _auth_headers(client)
    habit_id = _create(client, headers).json()["id"]
    today = date.today()
    # Check in for today, yesterday, and two days ago.
    for delta in (0, 1, 2):
        on = (today - timedelta(days=delta)).isoformat()
        client.post(f"{HABITS}/{habit_id}/check", params={"on": on}, headers=headers)
    body = client.get(f"{HABITS}/{habit_id}", headers=headers).json()
    assert body["current_streak"] == 3
    assert body["longest_streak"] == 3
    assert body["total_checkins"] == 3


def test_streak_survives_pending_today(client):
    headers = _auth_headers(client)
    habit_id = _create(client, headers).json()["id"]
    today = date.today()
    # Completed yesterday and the day before, but NOT today yet.
    for delta in (1, 2):
        on = (today - timedelta(days=delta)).isoformat()
        client.post(f"{HABITS}/{habit_id}/check", params={"on": on}, headers=headers)
    body = client.get(f"{HABITS}/{habit_id}", headers=headers).json()
    assert body["completed_today"] is False
    assert body["current_streak"] == 2


def test_streak_breaks_with_gap(client):
    headers = _auth_headers(client)
    habit_id = _create(client, headers).json()["id"]
    today = date.today()
    # Today and three days ago -> current streak only counts today.
    for delta in (0, 3):
        on = (today - timedelta(days=delta)).isoformat()
        client.post(f"{HABITS}/{habit_id}/check", params={"on": on}, headers=headers)
    body = client.get(f"{HABITS}/{habit_id}", headers=headers).json()
    assert body["current_streak"] == 1
    assert body["longest_streak"] == 1


def test_checkin_is_idempotent_per_day(client):
    headers = _auth_headers(client)
    habit_id = _create(client, headers).json()["id"]
    today = date.today().isoformat()
    client.post(f"{HABITS}/{habit_id}/check", params={"on": today}, headers=headers)
    # Toggling the same day again removes it (does not duplicate).
    client.post(f"{HABITS}/{habit_id}/check", params={"on": today}, headers=headers)
    body = client.get(f"{HABITS}/{habit_id}", headers=headers).json()
    assert body["total_checkins"] == 0


def test_archive_hides_from_default_list(client):
    headers = _auth_headers(client)
    habit_id = _create(client, headers, name="Old habit").json()["id"]
    client.patch(f"{HABITS}/{habit_id}", json={"is_archived": True}, headers=headers)
    active = client.get(HABITS, headers=headers).json()
    assert active == []
    with_archived = client.get(
        HABITS, params={"include_archived": "true"}, headers=headers
    ).json()
    assert [h["name"] for h in with_archived] == ["Old habit"]


def test_delete_habit(client):
    headers = _auth_headers(client)
    habit_id = _create(client, headers).json()["id"]
    client.post(f"{HABITS}/{habit_id}/check", headers=headers)
    resp = client.delete(f"{HABITS}/{habit_id}", headers=headers)
    assert resp.status_code == status.HTTP_204_NO_CONTENT
    assert (
        client.get(f"{HABITS}/{habit_id}", headers=headers).status_code
        == status.HTTP_404_NOT_FOUND
    )


def test_habits_are_owner_scoped(client):
    owner = _auth_headers(client, email="owner_h@example.com")
    other = _auth_headers(client, email="other_h@example.com")
    habit_id = _create(client, owner, name="Private").json()["id"]
    resp = client.get(f"{HABITS}/{habit_id}", headers=other)
    assert resp.status_code == status.HTTP_404_NOT_FOUND


def test_summary(client):
    headers = _auth_headers(client)
    empty = client.get(f"{HABITS}/summary", headers=headers).json()
    assert empty == {
        "active_count": 0,
        "checked_in_today": 0,
        "best_streak": 0,
        "latest_name": None,
    }
    habit_id = _create(client, headers, name="Stretch").json()["id"]
    client.post(f"{HABITS}/{habit_id}/check", headers=headers)
    summary = client.get(f"{HABITS}/summary", headers=headers).json()
    assert summary["active_count"] == 1
    assert summary["checked_in_today"] == 1
    assert summary["best_streak"] == 1
    assert summary["latest_name"] == "Stretch"


def test_habits_are_searchable(client):
    headers = _auth_headers(client)
    _create(client, headers, name="Morning run")
    resp = client.get(SEARCH, params={"q": "run"}, headers=headers)
    body = resp.json()
    modules = {g["module"] for g in body["groups"]}
    assert "habits" in modules
    group = next(g for g in body["groups"] if g["module"] == "habits")
    hit = group["hits"][0]
    assert hit["route"].startswith("/habits/")
    assert hit["matched_field"] == "name"
