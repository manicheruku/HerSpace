"""Tests for the Journal module (CRUD, filters, favorite, summary, search)."""

from fastapi import status

AUTH = "/api/v1/auth"
JOURNAL = "/api/v1/journal"
SEARCH = "/api/v1/search"


def _auth_headers(client, email="journal@example.com"):
    payload = {"name": "Writer", "email": email, "password": "supersecret123"}
    token = client.post(f"{AUTH}/register", json=payload).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def _create(client, headers, **overrides):
    body = {"title": "My day", "content": "Today was calm and productive."}
    body.update(overrides)
    return client.post(f"{JOURNAL}/entries", json=body, headers=headers)


def test_create_entry(client):
    headers = _auth_headers(client)
    resp = _create(client, headers, mood="good", tags=["work", "calm"])
    assert resp.status_code == status.HTTP_201_CREATED
    body = resp.json()
    assert body["title"] == "My day"
    assert body["mood"] == "good"
    assert body["tags"] == ["work", "calm"]
    assert body["is_favorite"] is False
    assert body["created_at"] and body["updated_at"]


def test_create_requires_title_and_content(client):
    headers = _auth_headers(client)
    resp = client.post(f"{JOURNAL}/entries", json={"title": ""}, headers=headers)
    assert resp.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_list_newest_first(client):
    headers = _auth_headers(client)
    _create(client, headers, title="First")
    _create(client, headers, title="Second")
    resp = client.get(f"{JOURNAL}/entries", headers=headers)
    titles = [e["title"] for e in resp.json()]
    assert titles == ["Second", "First"]


def test_get_entry(client):
    headers = _auth_headers(client)
    entry_id = _create(client, headers).json()["id"]
    resp = client.get(f"{JOURNAL}/entries/{entry_id}", headers=headers)
    assert resp.status_code == status.HTTP_200_OK
    assert resp.json()["id"] == entry_id


def test_update_entry(client):
    headers = _auth_headers(client)
    entry_id = _create(client, headers).json()["id"]
    resp = client.patch(
        f"{JOURNAL}/entries/{entry_id}",
        json={"title": "Edited", "mood": "great"},
        headers=headers,
    )
    assert resp.status_code == status.HTTP_200_OK
    assert resp.json()["title"] == "Edited"
    assert resp.json()["mood"] == "great"


def test_toggle_favorite(client):
    headers = _auth_headers(client)
    entry_id = _create(client, headers).json()["id"]
    first = client.post(f"{JOURNAL}/entries/{entry_id}/favorite", headers=headers)
    assert first.json()["is_favorite"] is True
    second = client.post(f"{JOURNAL}/entries/{entry_id}/favorite", headers=headers)
    assert second.json()["is_favorite"] is False


def test_filter_favorites(client):
    headers = _auth_headers(client)
    fav_id = _create(client, headers, title="Fav").json()["id"]
    _create(client, headers, title="Plain")
    client.post(f"{JOURNAL}/entries/{fav_id}/favorite", headers=headers)
    resp = client.get(f"{JOURNAL}/entries", params={"favorite": "true"}, headers=headers)
    titles = [e["title"] for e in resp.json()]
    assert titles == ["Fav"]


def test_filter_by_tag(client):
    headers = _auth_headers(client)
    _create(client, headers, title="Tagged", tags=["gratitude"])
    _create(client, headers, title="Untagged")
    resp = client.get(f"{JOURNAL}/entries", params={"tag": "gratitude"}, headers=headers)
    titles = [e["title"] for e in resp.json()]
    assert titles == ["Tagged"]


def test_text_filter(client):
    headers = _auth_headers(client)
    _create(client, headers, title="Beach trip", content="sand and waves")
    _create(client, headers, title="Work log", content="meetings all day")
    resp = client.get(f"{JOURNAL}/entries", params={"q": "waves"}, headers=headers)
    titles = [e["title"] for e in resp.json()]
    assert titles == ["Beach trip"]


def test_delete_entry(client):
    headers = _auth_headers(client)
    entry_id = _create(client, headers).json()["id"]
    resp = client.delete(f"{JOURNAL}/entries/{entry_id}", headers=headers)
    assert resp.status_code == status.HTTP_204_NO_CONTENT
    assert (
        client.get(f"{JOURNAL}/entries/{entry_id}", headers=headers).status_code
        == status.HTTP_404_NOT_FOUND
    )


def test_entries_are_owner_scoped(client):
    owner = _auth_headers(client, email="owner_j@example.com")
    other = _auth_headers(client, email="other_j@example.com")
    entry_id = _create(client, owner, title="Private").json()["id"]
    resp = client.get(f"{JOURNAL}/entries/{entry_id}", headers=other)
    assert resp.status_code == status.HTTP_404_NOT_FOUND


def test_summary(client):
    headers = _auth_headers(client)
    resp = client.get(f"{JOURNAL}/summary", headers=headers)
    assert resp.json() == {
        "count": 0,
        "favorite_count": 0,
        "last_updated": None,
        "latest_title": None,
        "latest_preview": None,
    }
    _create(client, headers, title="Latest", content="  spaced   out    text  ")
    summary = client.get(f"{JOURNAL}/summary", headers=headers).json()
    assert summary["count"] == 1
    assert summary["latest_title"] == "Latest"
    assert summary["latest_preview"] == "spaced out text"
    assert summary["last_updated"] is not None


def test_journal_is_searchable(client):
    headers = _auth_headers(client)
    _create(client, headers, title="Gratitude entry", content="grateful for sunshine")
    resp = client.get(SEARCH, params={"q": "grateful"}, headers=headers)
    body = resp.json()
    modules = {g["module"] for g in body["groups"]}
    assert "journal" in modules
    journal_group = next(g for g in body["groups"] if g["module"] == "journal")
    hit = journal_group["hits"][0]
    assert hit["route"].startswith("/journal/")
    assert hit["matched_field"] == "content"
