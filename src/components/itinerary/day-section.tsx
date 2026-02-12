"use client";

import { motion } from "framer-motion";
import { ActivityCard } from "./activity-card";
import type { TripDay, Activity } from "@/types/trip";

function formatDayDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export function DaySection({
  day,
  dayIndex,
  activeActivityId,
  onActivityHover,
  onActivityClick,
}: {
  day: TripDay;
  dayIndex: number;
  activeActivityId: string | null;
  onActivityHover: (id: string | null) => void;
  onActivityClick: (activity: Activity) => void;
}) {
  return (
    <motion.section
      id={`day-${dayIndex}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: dayIndex * 0.1 }}
      className="scroll-mt-20"
    >
      {/* Day header */}
      <div className="mb-4 flex items-baseline gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">
          {dayIndex + 1}
        </div>
        <div>
          <h3 className="text-lg font-semibold tracking-tight">{day.title}</h3>
          <p className="text-xs text-ink-muted">{formatDayDate(day.date)}</p>
        </div>
      </div>

      {/* Activities */}
      <div className="ml-1 space-y-1 timeline-line">
        {day.activities.map((activity, actIndex) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            index={actIndex}
            isActive={activeActivityId === activity.id}
            onHover={onActivityHover}
            onClick={onActivityClick}
          />
        ))}
      </div>
    </motion.section>
  );
}
