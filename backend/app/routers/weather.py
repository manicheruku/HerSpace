"""Weather endpoint for the Today module."""

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.weather import WeatherRead
from app.services import weather_service
from app.services.weather_service import WeatherUnavailableError

router = APIRouter()


@router.get(
    "/weather",
    response_model=WeatherRead,
    summary="Get current weather for the user's location",
)
def get_weather(
    lat: float | None = Query(default=None, ge=-90, le=90),
    lon: float | None = Query(default=None, ge=-180, le=180),
    current_user: User = Depends(get_current_user),
) -> WeatherRead:
    """Return current weather.

    When the client supplies ``lat``/``lon`` (from the browser's geolocation)
    weather is fetched for those coordinates; otherwise it falls back to the
    user's saved city.
    """
    try:
        if lat is not None and lon is not None:
            return weather_service.get_weather_by_coords(lat, lon)
        return weather_service.get_weather(current_user.city)
    except WeatherUnavailableError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Weather is currently unavailable",
        )
