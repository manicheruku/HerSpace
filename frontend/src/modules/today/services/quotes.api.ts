import { api } from "@/shared/api/client";
import type { DailyMessage } from "@/modules/today/types/today.types";

/** Raw quote payload as returned by the backend (`GET /quotes/random`). */
interface QuoteDto {
  id: number;
  text: string;
  author: string | null;
}

function mapQuote(dto: QuoteDto): DailyMessage {
  return {
    id: String(dto.id),
    text: dto.text,
    author: dto.author ?? undefined,
  };
}

/** Fetch a random active quote for the Daily Message card. */
export async function fetchRandomQuote(): Promise<DailyMessage> {
  const dto = await api.get<QuoteDto>("/quotes/random");
  return mapQuote(dto);
}
