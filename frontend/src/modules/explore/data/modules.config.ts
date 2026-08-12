import type { ExploreSectionId, ModuleConfig } from "@/modules/explore/types/explore.types";

/** Display titles for each section. */
export const SECTION_TITLES: Record<ExploreSectionId, string> = {
  wellness: "Wellness",
  personal: "Personal",
  growth: "Growth",
  finance: "Finance",
};

/** Render order of sections in the library. */
export const SECTION_ORDER: ExploreSectionId[] = [
  "wellness",
  "personal",
  "growth",
  "finance",
];

/**
 * The static catalog of every module in the app. Appearance and identity only;
 * runtime numbers (stats, last updated) are supplied by the service layer so
 * they can later come from real APIs.
 */
export const MODULE_CATALOG: ModuleConfig[] = [
  // ── Wellness ──────────────────────────────────────────────────────────────
  {
    id: "habits",
    name: "Habits",
    description: "Build gentle daily routines that gradually stick.",
    icon: "🌱",
    section: "wellness",
    route: "/habits",
    implemented: true,
    gradient: "from-blossom-100 to-lilac-100",
    quickAdd: true,
    quickAddLabel: "New habit",
    quickAddPlaceholder: "e.g. Meditate, Walk 10 min",
  },
  {
    id: "period",
    name: "Period Tracker",
    description: "Track your cycle and symptoms with calm, clear timelines.",
    icon: "🩷",
    section: "wellness",
    route: "/period-tracker",
    implemented: false,
    gradient: "from-rose-100 to-blossom-100",
    quickAdd: true,
    quickAddLabel: "Log cycle",
    quickAddPlaceholder: "e.g. Day 1 started, mild cramps",
  },
  {
    id: "water",
    name: "Water",
    description: "Stay hydrated with a soft daily nudge.",
    icon: "💧",
    section: "wellness",
    route: "/today",
    implemented: true,
    gradient: "from-sky-100 to-blossom-100",
    quickAdd: true,
    quickAddLabel: "Log water",
    quickAddPlaceholder: "How many glasses?",
  },
  {
    id: "mood",
    name: "Mood",
    description: "Check in with how you're feeling today.",
    icon: "🌈",
    section: "wellness",
    route: "/today",
    implemented: true,
    gradient: "from-lilac-100 to-sky-100",
    quickAdd: true,
    quickAddLabel: "Log mood",
    quickAddPlaceholder: "How do you feel right now?",
  },

  // ── Personal ──────────────────────────────────────────────────────────────
  {
    id: "journal",
    name: "Journal",
    description: "A private space for your daily reflections.",
    icon: "📔",
    section: "personal",
    route: "/journal",
    implemented: true,
    gradient: "from-blossom-100 to-sky-100",
    quickAdd: true,
    quickAddLabel: "New entry",
    quickAddPlaceholder: "What's on your mind?",
  },
  {
    id: "notes",
    name: "Notes",
    description: "Capture ideas and lists in a tidy place.",
    icon: "📝",
    section: "personal",
    route: "/notes",
    implemented: true,
    gradient: "from-lilac-100 to-blossom-100",
    quickAdd: true,
    quickAddLabel: "New note",
    quickAddPlaceholder: "Jot something down…",
  },
  {
    id: "memories",
    name: "Memories",
    description: "Keep the little moments worth remembering.",
    icon: "📸",
    section: "personal",
    route: "/memories",
    implemented: true,
    gradient: "from-sky-100 to-lilac-100",
    quickAdd: true,
    quickAddLabel: "Add memory",
    quickAddPlaceholder: "Describe a moment…",
  },

  // ── Growth ────────────────────────────────────────────────────────────────
  {
    id: "goals",
    name: "Goals",
    description: "Set intentions and watch your progress grow.",
    icon: "🎯",
    section: "growth",
    route: "/goals",
    implemented: true,
    gradient: "from-blossom-100 to-lilac-100",
    quickAdd: true,
    quickAddLabel: "New goal",
    quickAddPlaceholder: "e.g. Read 12 books this year",
  },
  // ── Finance ───────────────────────────────────────────────────────────────
  {
    id: "expenses",
    name: "Expenses",
    description: "Track spending gently, without the stress.",
    icon: "💰",
    section: "finance",
    route: "/expenses",
    implemented: true,
    gradient: "from-sky-100 to-blossom-100",
    quickAdd: true,
    quickAddLabel: "Add expense",
    quickAddPlaceholder: "e.g. Coffee — $4",
  },
];
