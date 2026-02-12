"use client";

import { useMemo } from "react";
import { ActivityCard } from "@/components/itinerary/activity-card";
import { filterActivitiesByRoute } from "@/lib/route-utils";
import type { Trip, Activity, RouteGroup } from "@/types/trip";

function formatDayDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export function DrawerActivityList({
  trip,
  dayIndex,
  activeActivityId,
  onActivityHover,
  onActivityClick,
  activeRoutes,
}: {
  trip: Trip;
  dayIndex: number;
  activeActivityId: string | null;
  onActivityHover: (id: string | null) => void;
  onActivityClick: (activity: Activity) => void;
  activeRoutes: Set<string>;
}) {
  const day = trip.days[dayIndex];

  const routeGroupMap = useMemo(() => {
    const map = new Map<string, RouteGroup>();
    trip.routeGroups?.forEach((rg) => map.set(rg.id, rg));
    return map;
  }, [trip.routeGroups]);

  const filteredActivities = useMemo(
    () => (day ? filterActivitiesByRoute(day.activities, activeRoutes) : []),
    [day, activeRoutes],
  );

  if (!day || filteredActivities.length === 0) return null;

  return (
    <div>
      {/* Day header */}
      <div className="px-4 pb-3 pt-1">
        <p className="text-[10px] uppercase tracking-[0.3em] text-ink-muted">
          {formatDayDate(day.date)}
        </p>
        <h3 className="text-base font-semibold tracking-tight text-ink">
          {day.title}
        </h3>
      </div>

      {/* Activity list */}
      <div className="space-y-1 px-2">
        {filteredActivities.map((activity, actIndex) => (
          <div key={activity.id} data-activity-id={activity.id}>
            <ActivityCard
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
          </div>
        ))}
      </div>
    </div>
  );
}
