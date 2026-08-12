import type { JSX } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

import { SearchResultItem } from "@/shared/search/components/SearchResultItem";
import type { FlatHit, SearchGroup } from "@/shared/search/types";

interface SearchResultsProps {
  groups: SearchGroup[];
  query: string;
  activeIndex: number;
  onSelect: (hit: FlatHit) => void;
  onHover: (index: number) => void;
}

const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.03 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 26 } },
};

/**
 * Grouped, staggered search results. Flattens groups into a single index space
 * so the parent overlay can drive keyboard navigation across every module.
 */
export function SearchResults({
  groups,
  query,
  activeIndex,
  onSelect,
  onHover,
}: SearchResultsProps): JSX.Element {
  const reduceMotion = useReducedMotion();

  let runningIndex = -1;

  return (
    <motion.div
      className="flex flex-col gap-4 px-3 py-3"
      variants={reduceMotion ? undefined : listVariants}
      initial={reduceMotion ? false : "hidden"}
      animate="visible"
    >
      {groups.map((group) => (
        <div key={group.module} className="flex flex-col gap-1">
          <div className="flex items-center gap-2 px-3 pb-1">
            <span aria-hidden="true">{group.icon}</span>
            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-300">
              {group.title}
            </h3>
            <span className="text-xs text-ink-300">{group.hits.length}</span>
          </div>
          {group.hits.map((hit) => {
            runningIndex += 1;
            const index = runningIndex;
            const flat: FlatHit = {
              ...hit,
              module: group.module,
              moduleTitle: group.title,
              moduleIcon: group.icon,
            };
            return (
              <motion.div key={`${group.module}-${hit.id}`} variants={reduceMotion ? undefined : itemVariants}>
                <SearchResultItem
                  hit={flat}
                  query={query}
                  isActive={index === activeIndex}
                  onSelect={onSelect}
                  onHover={() => onHover(index)}
                />
              </motion.div>
            );
          })}
        </div>
      ))}
    </motion.div>
  );
}
