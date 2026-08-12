"""Tests for the tasks module."""

from fastapi import status

AUTH = "/api/v1/auth"
BASE = "/api/v1/tasks"


def _auth_headers(client, email="tess@example.com"):
    payload = {"name": "Tess", "email": email, "password": "supersecret123"}
    token = client.post(f"{AUTH}/register", json=payload).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_create_task(client):
    headers = _auth_headers(client)
    resp = client.post(
        BASE,
        json={"title": "Buy groceries", "priority": "high", "notes": "milk"},
        headers=headers,
    )
    assert resp.status_code == status.HTTP_201_CREATED
    body = resp.json()
    assert body["title"] == "Buy groceries"
    assert body["priority"] == "high"
    assert body["notes"] == "milk"
    assert body["is_completed"] is False
    assert body["completed_at"] is None
    assert "id" in body


def test_create_task_defaults_priority(client):
    headers = _auth_headers(client)
    resp = client.post(BASE, json={"title": "Stretch"}, headers=headers)
    assert resp.status_code == status.HTTP_201_CREATED
    assert resp.json()["priority"] == "medium"


def test_create_task_invalid_priority_rejected(client):
    headers = _auth_headers(client)
    resp = client.post(
        BASE, json={"title": "x", "priority": "urgent"}, headers=headers
    )
    assert resp.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_list_tasks(client):
    headers = _auth_headers(client)
    client.post(BASE, json={"title": "A"}, headers=headers)
    client.post(BASE, json={"title": "B"}, headers=headers)
    resp = client.get(BASE, headers=headers)
    assert resp.status_code == status.HTTP_200_OK
    titles = [t["title"] for t in resp.json()]
    assert titles == ["A", "B"]


def test_get_task(client):
    headers = _auth_headers(client)
    task_id = client.post(BASE, json={"title": "A"}, headers=headers).json()["id"]
    resp = client.get(f"{BASE}/{task_id}", headers=headers)
    assert resp.status_code == status.HTTP_200_OK
    assert resp.json()["id"] == task_id


def test_update_task_marks_complete_sets_completed_at(client):
    headers = _auth_headers(client)
    task_id = client.post(BASE, json={"title": "A"}, headers=headers).json()["id"]

    resp = client.patch(
        f"{BASE}/{task_id}", json={"is_completed": True}, headers=headers
    )
    assert resp.status_code == status.HTTP_200_OK
    body = resp.json()
    assert body["is_completed"] is True
    assert body["completed_at"] is not None

    resp = client.patch(
        f"{BASE}/{task_id}", json={"is_completed": False}, headers=headers
    )
    body = resp.json()
    assert body["is_completed"] is False
    assert body["completed_at"] is None


def test_update_task_fields(client):
    headers = _auth_headers(client)
    task_id = client.post(BASE, json={"title": "A"}, headers=headers).json()["id"]
    resp = client.patch(
        f"{BASE}/{task_id}",
        json={"title": "A2", "priority": "low", "notes": "n"},
        headers=headers,
    )
    body = resp.json()
    assert body["title"] == "A2"
    assert body["priority"] == "low"
    assert body["notes"] == "n"


def test_delete_task(client):
    headers = _auth_headers(client)
    task_id = client.post(BASE, json={"title": "A"}, headers=headers).json()["id"]
    resp = client.delete(f"{BASE}/{task_id}", headers=headers)
    assert resp.status_code == status.HTTP_204_NO_CONTENT
    assert (
        client.get(f"{BASE}/{task_id}", headers=headers).status_code
        == status.HTTP_404_NOT_FOUND
    )


def test_get_missing_task_returns_404(client):
    headers = _auth_headers(client)
    resp = client.get(f"{BASE}/9999", headers=headers)
    assert resp.status_code == status.HTTP_404_NOT_FOUND


def test_cannot_access_other_users_task(client):
    owner = _auth_headers(client, email="owner@example.com")
    other = _auth_headers(client, email="other@example.com")
    task_id = client.post(BASE, json={"title": "A"}, headers=owner).json()["id"]

    assert (
        client.get(f"{BASE}/{task_id}", headers=other).status_code
        == status.HTTP_404_NOT_FOUND
    )
    assert (
        client.patch(
            f"{BASE}/{task_id}", json={"title": "hacked"}, headers=other
        ).status_code
        == status.HTTP_404_NOT_FOUND
    )
    assert (
        client.delete(f"{BASE}/{task_id}", headers=other).status_code
        == status.HTTP_404_NOT_FOUND
    )


def test_tasks_require_auth(client):
    resp = client.get(BASE)
    assert resp.status_code in (
        status.HTTP_401_UNAUTHORIZED,
        status.HTTP_403_FORBIDDEN,
    )
