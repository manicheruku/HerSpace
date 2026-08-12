"""Tests for the weather module.

The Open-Meteo network call is monkeypatched so tests stay hermetic and never
touch the real network.
"""

import pytest
from fastapi import status

from app.schemas.weather import WeatherRead
from app.services import weather_service
from app.services.weather_service import WeatherUnavailableError

AUTH = "/api/v1/auth"
BASE = "/api/v1/weather"


def _auth_headers(client, email="sunny@example.com"):
    payload = {"name": "Sunny", "email": email, "password": "supersecret123"}
    token = client.post(f"{AUTH}/register", json=payload).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(autouse=True)
def _clear_weather_cache():
    weather_service._cache.clear()
    yield
    weather_service._cache.clear()


def test_weather_returns_mapped_payload(client, monkeypatch):
    headers = _auth_headers(client)

    def _fake_get_current(self, city):
        return WeatherRead(
            temp_c=21.5,
            feels_like_c=23.0,
            condition="Clear",
            city="Pune",
            icon="☀️",
        )

    monkeypatch.setattr(
        weather_service.OpenMeteoProvider, "get_current", _fake_get_current
    )

    resp = client.get(BASE, headers=headers)
    assert resp.status_code == status.HTTP_200_OK
    body = resp.json()
    assert body == {
        "temp_c": 21.5,
        "feels_like_c": 23.0,
        "condition": "Clear",
        "city": "Pune",
        "icon": "☀️",
    }


def test_weather_by_coords_uses_coordinate_lookup(client, monkeypatch):
    headers = _auth_headers(client)

    captured: dict[str, float] = {}

    def _fake_by_coords(self, lat, lon):
        captured["lat"] = lat
        captured["lon"] = lon
        return WeatherRead(
            temp_c=18.0,
            feels_like_c=17.0,
            condition="Cloudy",
            city="Hyderabad",
            icon="☁️",
        )

    monkeypatch.setattr(
        weather_service.OpenMeteoProvider,
        "get_current_by_coords",
        _fake_by_coords,
    )

    resp = client.get(f"{BASE}?lat=17.38&lon=78.48", headers=headers)
    assert resp.status_code == status.HTTP_200_OK
    assert resp.json()["city"] == "Hyderabad"
    assert captured == {"lat": 17.38, "lon": 78.48}


def test_weather_unavailable_returns_503(client, monkeypatch):
    headers = _auth_headers(client)

    def _raise(self, city):
        raise WeatherUnavailableError("boom")

    monkeypatch.setattr(
        weather_service.OpenMeteoProvider, "get_current", _raise
    )

    resp = client.get(BASE, headers=headers)
    assert resp.status_code == status.HTTP_503_SERVICE_UNAVAILABLE


def test_weather_requires_auth(client):
    resp = client.get(BASE)
    assert resp.status_code in (
        status.HTTP_401_UNAUTHORIZED,
        status.HTTP_403_FORBIDDEN,
    )
