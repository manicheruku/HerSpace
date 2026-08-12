/** Stable identifier for every module surfaced in the Explore library. */
export type ModuleId =
  | "habits"
  | "period"
  | "water"
  | "mood"
  | "journal"
  | "notes"
  | "memories"
  | "goals"
  | "expenses";

/** Top-level grouping a module belongs to. */
export type ExploreSectionId = "wellness" | "personal" | "growth" | "finance";

/** A single headline statistic shown on a module card (e.g. "5 active"). */
export interface ModuleStat {
  label: string;
  value: string;
}

/**
 * Static identity & appearance of a module. This never changes at runtime and
 * lives in the module catalog, so it is safe to import anywhere.
 */
export interface ModuleConfig {
  id: ModuleId;
  name: string;
  description: string;
  /** Emoji glyph rendered inside the gradient icon tile. */
  icon: string;
  section: ExploreSectionId;
  /** Navigation target used by the Open action. */
  route: string;
  /** When false, Open shows a "coming soon" hint instead of navigating. */
  implemented: boolean;
  /** Tailwind gradient utility classes for the icon tile background. */
  gradient: string;
  /** Whether the Quick Add shortcut is offered for this module. */
  quickAdd: boolean;
  /** Action label for the quick-add sheet, e.g. "New habit". */
  quickAddLabel: string;
  /** Placeholder shown inside the quick-add input. */
  quickAddPlaceholder: string;
}

/**
 * Runtime data merged onto a module. Supplied by mock data today and by real
 * per-module APIs later — without any change to the card UI.
 */
export interface ModuleData {
  stats: ModuleStat[];
  /** ISO timestamp of the last activity, or null if never used. */
  lastUpdated: string | null;
}

/** A fully-resolved module = static config + runtime data. */
export interface ExploreModule extends ModuleConfig, ModuleData {}

/** A titled group of modules for rendering. */
export interface ExploreSection {
  id: ExploreSectionId;
  title: string;
  modules: ExploreModule[];
}
