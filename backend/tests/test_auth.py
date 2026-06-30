"""Tests for the authentication module."""

from fastapi import status

BASE = "/api/v1/auth"

VALID_USER = {
    "name": "Ada Lovelace",
    "email": "ada@example.com",
    "password": "supersecret123",
}


def _register(client, **overrides):
    payload = {**VALID_USER, **overrides}
    return client.post(f"{BASE}/register", json=payload)


def test_register_success(client):
    resp = _register(client)
    assert resp.status_code == status.HTTP_201_CREATED
    body = resp.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]
    assert body["user"]["email"] == VALID_USER["email"]
    assert body["user"]["name"] == VALID_USER["name"]
    assert "id" in body["user"]
    assert "hashed_password" not in body["user"]


def test_register_duplicate_email(client):
    _register(client)
    resp = _register(client)
    assert resp.status_code == status.HTTP_409_CONFLICT


def test_register_short_password_rejected(client):
    resp = _register(client, password="short")
    assert resp.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_login_success(client):
    _register(client)
    resp = client.post(
        f"{BASE}/login",
        json={"email": VALID_USER["email"], "password": VALID_USER["password"]},
    )
    assert resp.status_code == status.HTTP_200_OK
    body = resp.json()
    assert body["access_token"]
    assert body["user"]["email"] == VALID_USER["email"]


def test_login_wrong_password(client):
    _register(client)
    resp = client.post(
        f"{BASE}/login",
        json={"email": VALID_USER["email"], "password": "wrongpassword"},
    )
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED
    assert resp.json()["detail"] == "Invalid email or password"


def test_login_unknown_email(client):
    resp = client.post(
        f"{BASE}/login",
        json={"email": "nobody@example.com", "password": "supersecret123"},
    )
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED


def test_me_with_valid_token(client):
    token = _register(client).json()["access_token"]
    resp = client.get(
        f"{BASE}/me", headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == status.HTTP_200_OK
    body = resp.json()
    assert body["email"] == VALID_USER["email"]
    assert "hashed_password" not in body


def test_me_without_token(client):
    resp = client.get(f"{BASE}/me")
    assert resp.status_code in (
        status.HTTP_401_UNAUTHORIZED,
        status.HTTP_403_FORBIDDEN,
    )


def test_me_with_invalid_token(client):
    resp = client.get(
        f"{BASE}/me", headers={"Authorization": "Bearer not-a-real-token"}
    )
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED
