"""Tests for the Goals module (CRUD, progress, summary, search)."""

from fastapi import status

AUTH = "/api/v1/auth"
GOALS = "/api/v1/goals"
SEARCH = "/api/v1/search"


def _auth_headers(client, email="goals@example.com"):
    payload = {"name": "Goaler", "email": email, "password": "supersecret123"}
    token = client.post(f"{AUTH}/register", json=payload).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def _create(client, headers, **overrides):
    body = {"title": "Read 12 books", "target_value": 12, "current_value": 2}
    body.update(overrides)
    return client.post(GOALS, json=body, headers=headers)


def test_create_goal(client):
    headers = _auth_headers(client)
    resp = _create(client, headers, unit="books")
    assert resp.status_code == status.HTTP_201_CREATED
    body = resp.json()
    assert body["title"] == "Read 12 books"
    assert body["unit"] == "books"
    assert body["progress_percent"] == 17
    assert body["is_completed"] is False


def test_create_requires_title(client):
    headers = _auth_headers(client)
    resp = client.post(GOALS, json={"title": ""}, headers=headers)
    assert resp.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_list_and_query(client):
    headers = _auth_headers(client)
    _create(client, headers, title="Read books")
    _create(client, headers, title="Run marathon")
    filtered = client.get(GOALS, params={"q": "marathon"}, headers=headers)
    titles = [g["title"] for g in filtered.json()]
    assert titles == ["Run marathon"]


def test_get_goal(client):
    headers = _auth_headers(client)
    goal_id = _create(client, headers).json()["id"]
    resp = client.get(f"{GOALS}/{goal_id}", headers=headers)
    assert resp.status_code == status.HTTP_200_OK
    assert resp.json()["id"] == goal_id


def test_update_goal(client):
    headers = _auth_headers(client)
    goal_id = _create(client, headers).json()["id"]
    resp = client.patch(
        f"{GOALS}/{goal_id}",
        json={"title": "Read 24 books", "target_value": 24},
        headers=headers,
    )
    assert resp.status_code == status.HTTP_200_OK
    body = resp.json()
    assert body["title"] == "Read 24 books"
    assert body["progress_percent"] == 8


def test_advance_goal(client):
    headers = _auth_headers(client)
    goal_id = _create(client, headers, target_value=5, current_value=4).json()["id"]
    resp = client.post(f"{GOALS}/{goal_id}/advance", json={"amount": 1}, headers=headers)
    assert resp.status_code == status.HTTP_200_OK
    body = resp.json()
    assert body["current_value"] == 5
    assert body["is_completed"] is True
    assert body["progress_percent"] == 100


def test_advance_clamps_to_zero(client):
    headers = _auth_headers(client)
    goal_id = _create(client, headers, target_value=10, current_value=1).json()["id"]
    resp = client.post(
        f"{GOALS}/{goal_id}/advance", json={"amount": -99}, headers=headers
    )
    assert resp.json()["current_value"] == 0


def test_archive_filter(client):
    headers = _auth_headers(client)
    goal_id = _create(client, headers, title="Archived goal").json()["id"]
    client.patch(f"{GOALS}/{goal_id}", json={"is_archived": True}, headers=headers)

    active = client.get(GOALS, headers=headers).json()
    assert active == []

    with_archived = client.get(
        GOALS, params={"include_archived": "true"}, headers=headers
    ).json()
    assert with_archived[0]["title"] == "Archived goal"


def test_delete_goal(client):
    headers = _auth_headers(client)
    goal_id = _create(client, headers).json()["id"]
    resp = client.delete(f"{GOALS}/{goal_id}", headers=headers)
    assert resp.status_code == status.HTTP_204_NO_CONTENT
    assert (
        client.get(f"{GOALS}/{goal_id}", headers=headers).status_code
        == status.HTTP_404_NOT_FOUND
    )


def test_goals_are_owner_scoped(client):
    owner = _auth_headers(client, email="owner_g@example.com")
    other = _auth_headers(client, email="other_g@example.com")
    goal_id = _create(client, owner, title="Private goal").json()["id"]
    resp = client.get(f"{GOALS}/{goal_id}", headers=other)
    assert resp.status_code == status.HTTP_404_NOT_FOUND


def test_summary(client):
    headers = _auth_headers(client)
    empty = client.get(f"{GOALS}/summary", headers=headers).json()
    assert empty == {
        "active_count": 0,
        "completed_count": 0,
        "overall_progress": 0,
        "last_updated": None,
        "latest_title": None,
    }

    _create(client, headers, title="Goal A", target_value=10, current_value=5)
    _create(client, headers, title="Goal B", target_value=4, current_value=4)

    summary = client.get(f"{GOALS}/summary", headers=headers).json()
    assert summary["active_count"] == 1
    assert summary["completed_count"] == 1
    assert summary["overall_progress"] == 64
    assert summary["latest_title"] == "Goal B"


def test_goals_are_searchable(client):
    headers = _auth_headers(client)
    _create(client, headers, title="Read books", description="finish fiction list")
    resp = client.get(SEARCH, params={"q": "fiction"}, headers=headers)
    body = resp.json()
    modules = {g["module"] for g in body["groups"]}
    assert "goals" in modules
    group = next(g for g in body["groups"] if g["module"] == "goals")
    hit = group["hits"][0]
    assert hit["route"].startswith("/goals/")
    assert hit["matched_field"] == "description"
