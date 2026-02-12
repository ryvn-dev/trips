"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ActivityCard } from "./activity-card";
import { filterActivitiesByRoute } from "@/lib/route-utils";
import type { TripDay, Activity, RouteGroup } from "@/types/trip";

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
  activeRoutes,
  routeGroups,
}: {
  day: TripDay;
  dayIndex: number;
  activeActivityId: string | null;
  onActivityHover: (id: string | null) => void;
  onActivityClick: (activity: Activity) => void;
  activeRoutes: Set<string>;
  routeGroups?: RouteGroup[];
}) {
  const filteredActivities = useMemo(
    () => filterActivitiesByRoute(day.activities, activeRoutes),
    [day.activities, activeRoutes],
  );

  const routeGroupMap = useMemo(() => {
    const map = new Map<string, RouteGroup>();
    routeGroups?.forEach((rg) => map.set(rg.id, rg));
    return map;
  }, [routeGroups]);

  if (filteredActivities.length === 0) return null;

  return (
    <motion.section
      id={`day-${dayIndex}`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7 }}
      className="scroll-mt-20"
    >
      {/* Day header — editorial section opener */}
      <div className="mb-6 mt-2">
        <div className="flex items-end gap-4">
          <span className="text-5xl sm:text-6xl font-mono font-bold leading-none text-ink/[0.08] select-none">
            {String(dayIndex + 1).padStart(2, "0")}
          </span>
          <div className="flex-1 pb-1">
            <p className="text-[10px] uppercase tracking-[0.3em] text-ink-muted mb-0.5">
              {formatDayDate(day.date)}
            </p>
            <h3 className="text-lg sm:text-xl font-semibold tracking-tight">
              {day.title}
            </h3>
          </div>
        </div>
        <div className="mt-3 h-px bg-gradient-to-r from-border via-border to-transparent" />
      </div>

      {/* Activities */}
      <div className="ml-1 space-y-1 timeline-line">
        {filteredActivities.map((activity, actIndex) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            index={actIndex}
            isActive={activeActivityId === activity.id}
            onHover={onActivityHover}
            onClick={onActivityClick}
            routeGroup={
              activity.routeGroup
                ? routeGroupMap.get(activity.routeGroup)
                : undefined
            }
          />
        ))}
      </div>
    </motion.section>
  );
}
