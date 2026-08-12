"""Application configuration loaded from environment variables.

Uses pydantic-settings so values are validated and typed. A single cached
``settings`` instance is exposed via :func:`get_settings`.
"""

from functools import lru_cache
from typing import Annotated

from pydantic import field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    """Strongly-typed application settings."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # Application
    app_name: str = "HerSpace API"
    environment: str = "development"
    debug: bool = True
    api_v1_prefix: str = "/api/v1"

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # Database
    database_url: str = "sqlite:///./herspace.db"

    # CORS
    cors_origins: Annotated[list[str], NoDecode] = ["http://localhost:5173"]

    # Security (consumed from Phase 2 onwards)
    secret_key: str = "change-me"
    access_token_expire_minutes: int = 30

    # Weather (Open-Meteo)
    weather_geocoding_url: str = "https://geocoding-api.open-meteo.com/v1/search"
    weather_forecast_url: str = "https://api.open-meteo.com/v1/forecast"
    weather_reverse_geocoding_url: str = (
        "https://api.bigdatacloud.net/data/reverse-geocode-client"
    )
    weather_cache_ttl_seconds: int = 600

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _split_cors_origins(cls, value: object) -> object:
        """Allow CORS origins to be provided as a comma-separated string."""
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"


@lru_cache
def get_settings() -> Settings:
    """Return a cached settings instance."""
    return Settings()


settings = get_settings()
