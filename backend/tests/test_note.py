"""Tests for the Notes module (CRUD, filters, pin, summary, search)."""

from fastapi import status

AUTH = "/api/v1/auth"
NOTES = "/api/v1/notes"
SEARCH = "/api/v1/search"


def _auth_headers(client, email="notes@example.com"):
    payload = {"name": "Noter", "email": email, "password": "supersecret123"}
    token = client.post(f"{AUTH}/register", json=payload).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def _create(client, headers, **overrides):
    body = {"title": "Shopping", "content": "Milk, eggs, bread."}
    body.update(overrides)
    return client.post(f"{NOTES}/entries", json=body, headers=headers)


def test_create_note(client):
    headers = _auth_headers(client)
    resp = _create(client, headers, color="mint", tags=["home", "food"])
    assert resp.status_code == status.HTTP_201_CREATED
    body = resp.json()
    assert body["title"] == "Shopping"
    assert body["color"] == "mint"
    assert body["tags"] == ["home", "food"]
    assert body["is_pinned"] is False
    assert body["created_at"] and body["updated_at"]


def test_create_requires_title_and_content(client):
    headers = _auth_headers(client)
    resp = client.post(f"{NOTES}/entries", json={"title": ""}, headers=headers)
    assert resp.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_invalid_color_rejected(client):
    headers = _auth_headers(client)
    resp = _create(client, headers, color="neon")
    assert resp.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_list_pinned_first_then_newest(client):
    headers = _auth_headers(client)
    _create(client, headers, title="First")
    _create(client, headers, title="Second")
    pinned_id = _create(client, headers, title="Pinned").json()["id"]
    client.post(f"{NOTES}/entries/{pinned_id}/pin", headers=headers)
    resp = client.get(f"{NOTES}/entries", headers=headers)
    titles = [n["title"] for n in resp.json()]
    assert titles == ["Pinned", "Second", "First"]


def test_get_note(client):
    headers = _auth_headers(client)
    note_id = _create(client, headers).json()["id"]
    resp = client.get(f"{NOTES}/entries/{note_id}", headers=headers)
    assert resp.status_code == status.HTTP_200_OK
    assert resp.json()["id"] == note_id


def test_update_note(client):
    headers = _auth_headers(client)
    note_id = _create(client, headers).json()["id"]
    resp = client.patch(
        f"{NOTES}/entries/{note_id}",
        json={"title": "Edited", "color": "sky"},
        headers=headers,
    )
    assert resp.status_code == status.HTTP_200_OK
    assert resp.json()["title"] == "Edited"
    assert resp.json()["color"] == "sky"


def test_toggle_pin(client):
    headers = _auth_headers(client)
    note_id = _create(client, headers).json()["id"]
    first = client.post(f"{NOTES}/entries/{note_id}/pin", headers=headers)
    assert first.json()["is_pinned"] is True
    second = client.post(f"{NOTES}/entries/{note_id}/pin", headers=headers)
    assert second.json()["is_pinned"] is False


def test_filter_pinned(client):
    headers = _auth_headers(client)
    pin_id = _create(client, headers, title="Pin").json()["id"]
    _create(client, headers, title="Plain")
    client.post(f"{NOTES}/entries/{pin_id}/pin", headers=headers)
    resp = client.get(f"{NOTES}/entries", params={"pinned": "true"}, headers=headers)
    titles = [n["title"] for n in resp.json()]
    assert titles == ["Pin"]


def test_filter_by_tag(client):
    headers = _auth_headers(client)
    _create(client, headers, title="Tagged", tags=["ideas"])
    _create(client, headers, title="Untagged")
    resp = client.get(f"{NOTES}/entries", params={"tag": "ideas"}, headers=headers)
    titles = [n["title"] for n in resp.json()]
    assert titles == ["Tagged"]


def test_text_filter(client):
    headers = _auth_headers(client)
    _create(client, headers, title="Recipe", content="flour and sugar")
    _create(client, headers, title="Errand", content="post office run")
    resp = client.get(f"{NOTES}/entries", params={"q": "sugar"}, headers=headers)
    titles = [n["title"] for n in resp.json()]
    assert titles == ["Recipe"]


def test_delete_note(client):
    headers = _auth_headers(client)
    note_id = _create(client, headers).json()["id"]
    resp = client.delete(f"{NOTES}/entries/{note_id}", headers=headers)
    assert resp.status_code == status.HTTP_204_NO_CONTENT
    assert (
        client.get(f"{NOTES}/entries/{note_id}", headers=headers).status_code
        == status.HTTP_404_NOT_FOUND
    )


def test_notes_are_owner_scoped(client):
    owner = _auth_headers(client, email="owner_n@example.com")
    other = _auth_headers(client, email="other_n@example.com")
    note_id = _create(client, owner, title="Private").json()["id"]
    resp = client.get(f"{NOTES}/entries/{note_id}", headers=other)
    assert resp.status_code == status.HTTP_404_NOT_FOUND


def test_summary(client):
    headers = _auth_headers(client)
    resp = client.get(f"{NOTES}/summary", headers=headers)
    assert resp.json() == {
        "count": 0,
        "pinned_count": 0,
        "last_updated": None,
        "latest_title": None,
        "latest_preview": None,
    }
    _create(client, headers, title="Latest", content="  spaced   out    text  ")
    summary = client.get(f"{NOTES}/summary", headers=headers).json()
    assert summary["count"] == 1
    assert summary["latest_title"] == "Latest"
    assert summary["latest_preview"] == "spaced out text"
    assert summary["last_updated"] is not None


def test_notes_are_searchable(client):
    headers = _auth_headers(client)
    _create(client, headers, title="Idea note", content="build a rocket ship")
    resp = client.get(SEARCH, params={"q": "rocket"}, headers=headers)
    body = resp.json()
    modules = {g["module"] for g in body["groups"]}
    assert "notes" in modules
    notes_group = next(g for g in body["groups"] if g["module"] == "notes")
    hit = notes_group["hits"][0]
    assert hit["route"].startswith("/notes/")
    assert hit["matched_field"] == "content"
