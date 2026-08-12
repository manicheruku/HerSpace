import { api } from "@/shared/api/client";
import type { Coords } from "@/shared/hooks/useGeolocation";
import type { Weather } from "@/modules/today/types/today.types";

/** Raw snake_case shape returned by the backend `/weather` endpoint. */
interface WeatherDto {
  temp_c: number;
  feels_like_c: number;
  condition: string;
  city: string;
  icon: string;
}

function mapWeather(dto: WeatherDto): Weather {
  return {
    tempC: dto.temp_c,
    feelsLikeC: dto.feels_like_c,
    condition: dto.condition,
    city: dto.city,
    icon: dto.icon,
  };
}

export async function fetchWeather(coords?: Coords): Promise<Weather> {
  const path = coords
    ? `/weather?lat=${encodeURIComponent(coords.lat)}&lon=${encodeURIComponent(
        coords.lon,
      )}`
    : "/weather";
  const dto = await api.get<WeatherDto>(path);
  return mapWeather(dto);
}
