"""Weather integration for the Today module.

Fetches current weather from the free `Open-Meteo <https://open-meteo.com>`_ API
behind a swappable :class:`WeatherProvider` interface, with a small in-memory TTL
cache so repeated requests for the same city do not hammer the upstream service.
"""

from __future__ import annotations

import time
from typing import Protocol

import httpx

from app.core.config import settings
from app.schemas.weather import WeatherRead

_HTTP_TIMEOUT_SECONDS = 8.0

# WMO weather codes -> (human condition, emoji icon).
# https://open-meteo.com/en/docs (see "Weather variable documentation").
_WEATHER_CODE_MAP: dict[int, tuple[str, str]] = {
    0: ("Clear", "☀️"),
    1: ("Mainly Clear", "☀️"),
    2: ("Partly Cloudy", "⛅"),
    3: ("Cloudy", "☁️"),
    45: ("Fog", "🌫️"),
    48: ("Fog", "🌫️"),
    51: ("Drizzle", "🌧️"),
    53: ("Drizzle", "🌧️"),
    55: ("Drizzle", "🌧️"),
    56: ("Freezing Drizzle", "🌧️"),
    57: ("Freezing Drizzle", "🌧️"),
    61: ("Rain", "🌧️"),
    63: ("Rain", "🌧️"),
    65: ("Heavy Rain", "🌧️"),
    66: ("Freezing Rain", "🌧️"),
    67: ("Freezing Rain", "🌧️"),
    71: ("Snow", "❄️"),
    73: ("Snow", "❄️"),
    75: ("Heavy Snow", "❄️"),
    77: ("Snow Grains", "❄️"),
    80: ("Rain Showers", "🌧️"),
    81: ("Rain Showers", "🌧️"),
    82: ("Violent Rain Showers", "🌧️"),
    85: ("Snow Showers", "❄️"),
    86: ("Snow Showers", "❄️"),
    95: ("Thunderstorm", "⛈️"),
    96: ("Thunderstorm", "⛈️"),
    99: ("Thunderstorm", "⛈️"),
}

_DEFAULT_CONDITION = ("Partly Cloudy", "⛅")


class WeatherUnavailableError(Exception):
    """Raised when current weather cannot be retrieved for a city."""


class WeatherProvider(Protocol):
    """Interface for a current-weather source, so providers stay swappable."""

    def get_current(self, city: str) -> WeatherRead:
        """Return the current weather for ``city``."""
        ...

    def get_current_by_coords(self, lat: float, lon: float) -> WeatherRead:
        """Return the current weather for a latitude/longitude pair."""
        ...


def _map_weather_code(code: int | None) -> tuple[str, str]:
    """Map a WMO weather code to a (condition, icon) pair with a sane default."""
    if code is None:
        return _DEFAULT_CONDITION
    return _WEATHER_CODE_MAP.get(code, _DEFAULT_CONDITION)


class OpenMeteoProvider:
    """Current-weather provider backed by the Open-Meteo API."""

    def __init__(
        self,
        *,
        geocoding_url: str | None = None,
        forecast_url: str | None = None,
        reverse_geocoding_url: str | None = None,
    ) -> None:
        self._geocoding_url = geocoding_url or settings.weather_geocoding_url
        self._forecast_url = forecast_url or settings.weather_forecast_url
        self._reverse_geocoding_url = (
            reverse_geocoding_url or settings.weather_reverse_geocoding_url
        )

    def get_current(self, city: str) -> WeatherRead:
        """Geocode ``city`` then fetch and map its current weather."""
        try:
            with httpx.Client(timeout=_HTTP_TIMEOUT_SECONDS) as http:
                lat, lon, resolved_name = self._geocode(http, city)
                temp_c, feels_like_c, code = self._fetch_current(http, lat, lon)
        except httpx.HTTPError as exc:
            raise WeatherUnavailableError(str(exc)) from exc

        condition, icon = _map_weather_code(code)
        return WeatherRead(
            temp_c=temp_c,
            feels_like_c=feels_like_c,
            condition=condition,
            city=resolved_name or city,
            icon=icon,
        )

    def get_current_by_coords(self, lat: float, lon: float) -> WeatherRead:
        """Fetch current weather for coordinates and reverse-geocode the name."""
        try:
            with httpx.Client(timeout=_HTTP_TIMEOUT_SECONDS) as http:
                temp_c, feels_like_c, code = self._fetch_current(http, lat, lon)
                city = self._reverse_geocode(http, lat, lon)
        except httpx.HTTPError as exc:
            raise WeatherUnavailableError(str(exc)) from exc

        condition, icon = _map_weather_code(code)
        return WeatherRead(
            temp_c=temp_c,
            feels_like_c=feels_like_c,
            condition=condition,
            city=city,
            icon=icon,
        )

    def _reverse_geocode(self, http: httpx.Client, lat: float, lon: float) -> str:
        """Resolve coordinates to a human-friendly place name.

        Reverse geocoding is best-effort: if it fails we still return weather
        with a neutral label rather than failing the whole request.
        """
        try:
            resp = http.get(
                self._reverse_geocoding_url,
                params={
                    "latitude": lat,
                    "longitude": lon,
                    "localityLanguage": "en",
                },
            )
            resp.raise_for_status()
            data = resp.json()
        except httpx.HTTPError:
            return "Your location"
        return str(
            data.get("city")
            or data.get("locality")
            or data.get("principalSubdivision")
            or "Your location"
        )

    def _geocode(
        self, http: httpx.Client, city: str
    ) -> tuple[float, float, str]:
        """Resolve a city name to (latitude, longitude, resolved_name)."""
        resp = http.get(
            self._geocoding_url, params={"name": city, "count": 1}
        )
        resp.raise_for_status()
        results = resp.json().get("results") or []
        if not results:
            raise WeatherUnavailableError(f"No location found for '{city}'")
        first = results[0]
        return (
            float(first["latitude"]),
            float(first["longitude"]),
            str(first.get("name") or city),
        )

    def _fetch_current(
        self, http: httpx.Client, lat: float, lon: float
    ) -> tuple[float, float, int | None]:
        """Fetch (temperature_2m, apparent_temperature, weather_code)."""
        resp = http.get(
            self._forecast_url,
            params={
                "latitude": lat,
                "longitude": lon,
                "current": "temperature_2m,apparent_temperature,weather_code",
            },
        )
        resp.raise_for_status()
        current = resp.json().get("current") or {}
        if "temperature_2m" not in current:
            raise WeatherUnavailableError("Current weather unavailable")
        temp_c = float(current["temperature_2m"])
        raw_feels = current.get("apparent_temperature")
        feels_like_c = float(raw_feels) if raw_feels is not None else temp_c
        raw_code = current.get("weather_code")
        code = int(raw_code) if raw_code is not None else None
        return temp_c, feels_like_c, code


# Default provider instance used by the service-level entry point.
_provider: WeatherProvider = OpenMeteoProvider()

# Simple in-memory TTL cache keyed by lowercased city -> (expiry_ts, WeatherRead).
_cache: dict[str, tuple[float, WeatherRead]] = {}


def get_weather(city: str) -> WeatherRead:
    """Return current weather for ``city``, served from a short-lived cache.

    Raises :class:`WeatherUnavailableError` if the upstream API fails or the city
    cannot be resolved.
    """
    key = city.strip().lower()
    now = time.monotonic()

    cached = _cache.get(key)
    if cached is not None and cached[0] > now:
        return cached[1]

    result = _provider.get_current(city)
    _cache[key] = (now + settings.weather_cache_ttl_seconds, result)
    return result


def get_weather_by_coords(lat: float, lon: float) -> WeatherRead:
    """Return current weather for coordinates, served from a short-lived cache.

    Raises :class:`WeatherUnavailableError` if the upstream API fails.
    """
    key = f"@{round(lat, 2)},{round(lon, 2)}"
    now = time.monotonic()

    cached = _cache.get(key)
    if cached is not None and cached[0] > now:
        return cached[1]

    result = _provider.get_current_by_coords(lat, lon)
    _cache[key] = (now + settings.weather_cache_ttl_seconds, result)
    return result
