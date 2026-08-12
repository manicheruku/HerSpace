/** Types for the Global Search system — mirror the backend `SearchResponse`. */

import type { ModuleId } from "@/modules/explore/types/explore.types";

export interface SearchHit {
  id: number;
  title: string;
  preview: string | null;
  route: string;
  matchedField: string;
  updatedAt: string | null;
}

export interface SearchGroup {
  module: ModuleId;
  title: string;
  icon: string;
  hits: SearchHit[];
}

export interface SearchResponse {
  query: string;
  total: number;
  groups: SearchGroup[];
}

/** A flattened hit carrying its group, used for keyboard navigation. */
export interface FlatHit extends SearchHit {
  module: ModuleId;
  moduleTitle: string;
  moduleIcon: string;
}
