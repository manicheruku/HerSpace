import { api } from "@/shared/api/client";
import { normalizeServerDate } from "@/shared/utils/datetime";
import type { ModuleId } from "@/modules/explore/types/explore.types";
import type { SearchGroup, SearchHit, SearchResponse } from "@/shared/search/types";

/** Raw wire shapes (snake_case) as returned by the FastAPI search endpoint. */
interface RawHit {
  id: number;
  title: string;
  preview: string | null;
  route: string;
  matched_field: string;
  updated_at: string | null;
}

interface RawGroup {
  module: ModuleId;
  title: string;
  icon: string;
  hits: RawHit[];
}

interface RawResponse {
  query: string;
  total: number;
  groups: RawGroup[];
}

function mapHit(hit: RawHit): SearchHit {
  return {
    id: hit.id,
    title: hit.title,
    preview: hit.preview,
    route: hit.route,
    matchedField: hit.matched_field,
    updatedAt: normalizeServerDate(hit.updated_at),
  };
}

function mapGroup(group: RawGroup): SearchGroup {
  return {
    module: group.module,
    title: group.title,
    icon: group.icon,
    hits: group.hits.map(mapHit),
  };
}

/**
 * Query the global search endpoint. Forwards TanStack Query's `AbortSignal`
 * so in-flight requests are cancelled when the debounced term changes.
 */
export async function searchAll(
  query: string,
  signal?: AbortSignal,
): Promise<SearchResponse> {
  const raw = await api.get<RawResponse>(
    `/search?q=${encodeURIComponent(query)}`,
    { signal },
  );
  return {
    query: raw.query,
    total: raw.total,
    groups: raw.groups.map(mapGroup),
  };
}
