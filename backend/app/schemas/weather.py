"""Weather response schema for the Today module."""

from pydantic import BaseModel


class WeatherRead(BaseModel):
    """Current weather for a city as returned to clients."""

    temp_c: float
    feels_like_c: float
    condition: str
    city: str
    icon: str
