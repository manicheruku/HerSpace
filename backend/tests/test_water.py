"""Tests for the water tracker module."""

from datetime import date

from fastapi import status

AUTH = "/api/v1/auth"
BASE = "/api/v1/water"


def _auth_headers(client, email="hydra@example.com"):
    payload = {"name": "Hydra", "email": email, "password": "supersecret123"}
    token = client.post(f"{AUTH}/register", json=payload).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_get_today_creates_row(client):
    headers = _auth_headers(client)
    resp = client.get(f"{BASE}/today", headers=headers)
    assert resp.status_code == status.HTTP_200_OK
    body = resp.json()
    assert body["glasses"] == 0
    assert body["goal"] == 8
    assert body["log_date"] == date.today().isoformat()


def test_increment(client):
    headers = _auth_headers(client)
    client.get(f"{BASE}/today", headers=headers)
    resp = client.post(f"{BASE}/increment", headers=headers)
    assert resp.status_code == status.HTTP_200_OK
    assert resp.json()["glasses"] == 1
    assert client.post(f"{BASE}/increment", headers=headers).json()["glasses"] == 2


def test_decrement_clamps_at_zero(client):
    headers = _auth_headers(client)
    resp = client.post(f"{BASE}/decrement", headers=headers)
    assert resp.status_code == status.HTTP_200_OK
    assert resp.json()["glasses"] == 0


def test_increment_then_decrement(client):
    headers = _auth_headers(client)
    client.post(f"{BASE}/increment", headers=headers)
    client.post(f"{BASE}/increment", headers=headers)
    resp = client.post(f"{BASE}/decrement", headers=headers)
    assert resp.json()["glasses"] == 1


def test_water_scoped_per_user(client):
    a = _auth_headers(client, email="a@example.com")
    b = _auth_headers(client, email="b@example.com")
    client.post(f"{BASE}/increment", headers=a)
    client.post(f"{BASE}/increment", headers=a)
    assert client.get(f"{BASE}/today", headers=a).json()["glasses"] == 2
    assert client.get(f"{BASE}/today", headers=b).json()["glasses"] == 0


def test_water_requires_auth(client):
    resp = client.get(f"{BASE}/today")
    assert resp.status_code in (
        status.HTTP_401_UNAUTHORIZED,
        status.HTTP_403_FORBIDDEN,
    )
