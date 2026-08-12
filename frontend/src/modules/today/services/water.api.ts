import { api } from "@/shared/api/client";
import type { Water } from "@/modules/today/types/today.types";

/** Raw snake_case shape returned by the backend `/water` endpoints. */
interface WaterDto {
  log_date: string;
  glasses: number;
  goal: number;
}

function mapWater(dto: WaterDto): Water {
  return {
    date: dto.log_date,
    glasses: dto.glasses,
    goal: dto.goal,
  };
}

export async function fetchWaterToday(): Promise<Water> {
  const dto = await api.get<WaterDto>("/water/today");
  return mapWater(dto);
}

export async function incrementWater(): Promise<Water> {
  const dto = await api.post<WaterDto>("/water/increment");
  return mapWater(dto);
}

export async function decrementWater(): Promise<Water> {
  const dto = await api.post<WaterDto>("/water/decrement");
  return mapWater(dto);
}
