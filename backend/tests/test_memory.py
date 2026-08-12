"""Tests for the Memories module (CRUD, filters, favorite, summary, search)."""

from datetime import date, timedelta

from fastapi import status

AUTH = "/api/v1/auth"
MEMORIES = "/api/v1/memories"
SEARCH = "/api/v1/search"


def _auth_headers(client, email="memories@example.com"):
    payload = {"name": "Remember", "email": email, "password": "supersecret123"}
    token = client.post(f"{AUTH}/register", json=payload).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def _create(client, headers, **overrides):
    body = {
        "title": "Beach day",
        "content": "Warm wind and sunset.",
        "memory_on": date.today().isoformat(),
        "mood": "happy",
        "is_favorite": False,
    }
    body.update(overrides)
    return client.post(f"{MEMORIES}/entries", json=body, headers=headers)


def test_create_memory(client):
    headers = _auth_headers(client)
    resp = _create(client, headers)
    assert resp.status_code == status.HTTP_201_CREATED
    body = resp.json()
    assert body["title"] == "Beach day"
    assert body["mood"] == "happy"
    assert body["memory_on"] == date.today().isoformat()


def test_create_requires_title_and_content(client):
    headers = _auth_headers(client)
    resp = client.post(f"{MEMORIES}/entries", json={"title": ""}, headers=headers)
    assert resp.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_invalid_mood_rejected(client):
    headers = _auth_headers(client)
    resp = _create(client, headers, mood="sad")
    assert resp.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_list_favorites_first_then_recent(client):
    headers = _auth_headers(client)
    _create(client, headers, title="Older", memory_on=(date.today() - timedelta(days=2)).isoformat())
    _create(client, headers, title="Recent", memory_on=date.today().isoformat())
    fav_id = _create(client, headers, title="Favorite", memory_on=date.today().isoformat()).json()["id"]
    client.post(f"{MEMORIES}/entries/{fav_id}/favorite", headers=headers)
    resp = client.get(f"{MEMORIES}/entries", headers=headers)
    titles = [m["title"] for m in resp.json()]
    assert titles[0] == "Favorite"


def test_get_memory(client):
    headers = _auth_headers(client)
    memory_id = _create(client, headers).json()["id"]
    resp = client.get(f"{MEMORIES}/entries/{memory_id}", headers=headers)
    assert resp.status_code == status.HTTP_200_OK
    assert resp.json()["id"] == memory_id


def test_update_memory(client):
    headers = _auth_headers(client)
    memory_id = _create(client, headers).json()["id"]
    resp = client.patch(
        f"{MEMORIES}/entries/{memory_id}",
        json={"title": "Trip", "mood": "grateful"},
        headers=headers,
    )
    assert resp.status_code == status.HTTP_200_OK
    assert resp.json()["title"] == "Trip"
    assert resp.json()["mood"] == "grateful"


def test_toggle_favorite(client):
    headers = _auth_headers(client)
    memory_id = _create(client, headers).json()["id"]
    first = client.post(f"{MEMORIES}/entries/{memory_id}/favorite", headers=headers)
    assert first.json()["is_favorite"] is True
    second = client.post(f"{MEMORIES}/entries/{memory_id}/favorite", headers=headers)
    assert second.json()["is_favorite"] is False


def test_filter_favorite(client):
    headers = _auth_headers(client)
    fav_id = _create(client, headers, title="Fav").json()["id"]
    _create(client, headers, title="Plain")
    client.post(f"{MEMORIES}/entries/{fav_id}/favorite", headers=headers)
    resp = client.get(f"{MEMORIES}/entries", params={"favorite": "true"}, headers=headers)
    titles = [m["title"] for m in resp.json()]
    assert titles == ["Fav"]


def test_filter_by_mood(client):
    headers = _auth_headers(client)
    _create(client, headers, title="Happy", mood="happy")
    _create(client, headers, title="Calm", mood="calm")
    resp = client.get(f"{MEMORIES}/entries", params={"mood": "calm"}, headers=headers)
    titles = [m["title"] for m in resp.json()]
    assert titles == ["Calm"]


def test_filter_by_date_range(client):
    headers = _auth_headers(client)
    today = date.today()
    _create(client, headers, title="Old", memory_on=(today - timedelta(days=6)).isoformat())
    _create(client, headers, title="InRange", memory_on=(today - timedelta(days=1)).isoformat())
    resp = client.get(
        f"{MEMORIES}/entries",
        params={"from": (today - timedelta(days=2)).isoformat(), "to": today.isoformat()},
        headers=headers,
    )
    titles = [m["title"] for m in resp.json()]
    assert titles == ["InRange"]


def test_text_filter(client):
    headers = _auth_headers(client)
    _create(client, headers, title="Picnic", content="we packed mangoes")
    _create(client, headers, title="Walk", content="city lights")
    resp = client.get(f"{MEMORIES}/entries", params={"q": "mangoes"}, headers=headers)
    titles = [m["title"] for m in resp.json()]
    assert titles == ["Picnic"]


def test_delete_memory(client):
    headers = _auth_headers(client)
    memory_id = _create(client, headers).json()["id"]
    resp = client.delete(f"{MEMORIES}/entries/{memory_id}", headers=headers)
    assert resp.status_code == status.HTTP_204_NO_CONTENT
    assert (
        client.get(f"{MEMORIES}/entries/{memory_id}", headers=headers).status_code
        == status.HTTP_404_NOT_FOUND
    )


def test_memories_are_owner_scoped(client):
    owner = _auth_headers(client, email="owner_m@example.com")
    other = _auth_headers(client, email="other_m@example.com")
    memory_id = _create(client, owner, title="Private").json()["id"]
    resp = client.get(f"{MEMORIES}/entries/{memory_id}", headers=other)
    assert resp.status_code == status.HTTP_404_NOT_FOUND


def test_summary(client):
    headers = _auth_headers(client)
    resp = client.get(f"{MEMORIES}/summary", headers=headers)
    assert resp.json() == {
        "count": 0,
        "favorite_count": 0,
        "last_updated": None,
        "latest_title": None,
        "latest_preview": None,
    }
    _create(client, headers, title="Latest", content="  a   tiny   memory  ")
    summary = client.get(f"{MEMORIES}/summary", headers=headers).json()
    assert summary["count"] == 1
    assert summary["latest_title"] == "Latest"
    assert summary["latest_preview"] == "a tiny memory"


def test_memories_are_searchable(client):
    headers = _auth_headers(client)
    _create(client, headers, title="Concert night", content="neon stage lights")
    resp = client.get(SEARCH, params={"q": "neon"}, headers=headers)
    body = resp.json()
    modules = {g["module"] for g in body["groups"]}
    assert "memories" in modules
    group = next(g for g in body["groups"] if g["module"] == "memories")
    hit = group["hits"][0]
    assert hit["route"].startswith("/memories/")
    assert hit["matched_field"] == "content"
