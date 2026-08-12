import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";

import { PullToRefresh } from "@/components/ui";
import { DailyMessageCard } from "@/modules/today/components/DailyMessageCard";
import { GreetingCard } from "@/modules/today/components/GreetingCard";
import { MoodCard } from "@/modules/today/components/MoodCard";
import { TaskCard } from "@/modules/today/components/TaskCard";
import { WaterCard } from "@/modules/today/components/WaterCard";
import { WeatherCard } from "@/modules/today/components/WeatherCard";

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 24 },
  },
};

export function TodayPage() {
  const reduceMotion = useReducedMotion();
  const queryClient = useQueryClient();

  const cards = [
    GreetingCard,
    WeatherCard,
    TaskCard,
    WaterCard,
    MoodCard,
    DailyMessageCard,
  ];

  return (
    <PullToRefresh onRefresh={() => queryClient.invalidateQueries()}>
      <motion.div
        className="flex flex-col gap-4 px-5 pb-8 pt-6"
        variants={reduceMotion ? undefined : containerVariants}
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
      >
        {cards.map((CardComponent, index) => (
          <motion.div
            key={index}
            variants={reduceMotion ? undefined : itemVariants}
          >
            <CardComponent />
          </motion.div>
        ))}
      </motion.div>
    </PullToRefresh>
  );
}
