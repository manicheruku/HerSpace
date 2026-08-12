import { useCallback } from "react";

import type { MoodOption, MoodValue } from "@/modules/today/types/today.types";
import { useLocalStorage } from "@/shared/hooks/useLocalStorage";

const MOOD_OPTIONS: MoodOption[] = [
  { value: "great", emoji: "😀", label: "Great" },
  { value: "good", emoji: "🙂", label: "Good" },
  { value: "okay", emoji: "😐", label: "Okay" },
  { value: "down", emoji: "😔", label: "Down" },
  { value: "awful", emoji: "😭", label: "Awful" },
];

interface UseMoodResult {
  options: MoodOption[];
  selected: MoodValue | null;
  select: (value: MoodValue) => void;
}

export function useMood(): UseMoodResult {
  const [selected, setSelected] = useLocalStorage<MoodValue | null>(
    "herspace:today:mood",
    null,
  );

  const select = useCallback(
    (value: MoodValue) => {
      setSelected(value);
    },
    [setSelected],
  );

  return { options: MOOD_OPTIONS, selected, select };
}
