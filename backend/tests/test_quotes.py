"""Tests for the quotes module."""

from fastapi import status

from app.models.quote import Quote

AUTH = "/api/v1/auth"
BASE = "/api/v1/quotes"

SEEDED = {
    "You are exactly where you need to be.",
    "Small steps still move you forward.",
}


def _auth_headers(client, email="quinn@example.com"):
    payload = {"name": "Quinn", "email": email, "password": "supersecret123"}
    token = client.post(f"{AUTH}/register", json=payload).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def _seed_quotes(db_session):
    db_session.add_all(
        [
            Quote(text="You are exactly where you need to be.", author="HerSpace"),
            Quote(text="Small steps still move you forward.", author="HerSpace"),
            Quote(text="Resting is not a setback.", author="HerSpace", is_active=False),
        ]
    )
    db_session.commit()


def test_random_quote_returns_seeded_quote(client, db_session):
    _seed_quotes(db_session)
    headers = _auth_headers(client)
    resp = client.get(f"{BASE}/random", headers=headers)
    assert resp.status_code == status.HTTP_200_OK
    body = resp.json()
    assert body["text"] in SEEDED
    assert "id" in body
    assert "author" in body
    assert body["author"] == "HerSpace"


def test_random_quote_not_cached(client, db_session):
    _seed_quotes(db_session)
    headers = _auth_headers(client)
    resp = client.get(f"{BASE}/random", headers=headers)
    assert resp.status_code == status.HTTP_200_OK
    assert resp.headers.get("cache-control") == "no-store"


def test_random_quote_returns_404_when_empty(client):
    headers = _auth_headers(client)
    resp = client.get(f"{BASE}/random", headers=headers)
    assert resp.status_code == status.HTTP_404_NOT_FOUND


def test_random_quote_requires_auth(client):
    resp = client.get(f"{BASE}/random")
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED
