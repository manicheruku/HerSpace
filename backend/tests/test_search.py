"""Tests for the Global Search system (engine, grouping, ownership)."""

from fastapi import status

AUTH = "/api/v1/auth"
TASKS = "/api/v1/tasks"
SEARCH = "/api/v1/search"


def _auth_headers(client, email="search@example.com"):
    payload = {"name": "Finder", "email": email, "password": "supersecret123"}
    token = client.post(f"{AUTH}/register", json=payload).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_search_requires_auth(client):
    resp = client.get(SEARCH, params={"q": "anything"})
    assert resp.status_code in (
        status.HTTP_401_UNAUTHORIZED,
        status.HTTP_403_FORBIDDEN,
    )


def test_short_query_returns_empty(client):
    headers = _auth_headers(client)
    resp = client.get(SEARCH, params={"q": "a"}, headers=headers)
    assert resp.status_code == status.HTTP_200_OK
    body = resp.json()
    assert body["total"] == 0
    assert body["groups"] == []


def test_search_matches_task_title(client):
    headers = _auth_headers(client)
    client.post(TASKS, json={"title": "Buy groceries"}, headers=headers)
    client.post(TASKS, json={"title": "Call dentist"}, headers=headers)

    resp = client.get(SEARCH, params={"q": "groc"}, headers=headers)
    assert resp.status_code == status.HTTP_200_OK
    body = resp.json()
    assert body["total"] == 1
    assert len(body["groups"]) == 1
    group = body["groups"][0]
    assert group["module"] == "tasks"
    assert group["hits"][0]["title"] == "Buy groceries"
    assert group["hits"][0]["route"].startswith("/planner")
    assert group["hits"][0]["matched_field"] == "title"


def test_search_matches_task_notes(client):
    headers = _auth_headers(client)
    client.post(
        TASKS,
        json={"title": "Meeting", "notes": "discuss quarterly budget numbers"},
        headers=headers,
    )
    resp = client.get(SEARCH, params={"q": "budget"}, headers=headers)
    body = resp.json()
    assert body["total"] == 1
    assert body["groups"][0]["hits"][0]["matched_field"] == "notes"


def test_search_is_scoped_to_owner(client):
    owner = _auth_headers(client, email="owner@example.com")
    other = _auth_headers(client, email="other@example.com")
    client.post(TASKS, json={"title": "Secret plan"}, headers=owner)

    resp = client.get(SEARCH, params={"q": "secret"}, headers=other)
    assert resp.json()["total"] == 0

    resp = client.get(SEARCH, params={"q": "secret"}, headers=owner)
    assert resp.json()["total"] == 1


def test_search_no_results(client):
    headers = _auth_headers(client)
    client.post(TASKS, json={"title": "Water the plants"}, headers=headers)
    resp = client.get(SEARCH, params={"q": "zzzznothing"}, headers=headers)
    body = resp.json()
    assert body["total"] == 0
    assert body["groups"] == []


def test_search_respects_per_module_limit(client):
    headers = _auth_headers(client)
    for i in range(8):
        client.post(TASKS, json={"title": f"report item {i}"}, headers=headers)

    resp = client.get(SEARCH, params={"q": "report", "limit": 3}, headers=headers)
    body = resp.json()
    assert len(body["groups"][0]["hits"]) == 3
