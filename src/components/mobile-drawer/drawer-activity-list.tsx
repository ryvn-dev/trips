"use client";

import { useMemo, useRef } from "react";
import { ActivityCard } from "@/components/itinerary/activity-card";
import { filterActivitiesByRoute } from "@/lib/route-utils";
import type { Trip, Activity, RouteGroup } from "@/types/trip";

const TAP_THRESHOLD = 15; // px — movement under this is a tap, over is a scroll

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

  // Pointer-event tap detection — onClick on Framer Motion's motion.div is
  // unreliable inside a Vaul drawer on mobile (touch events get swallowed).
  // Track pointerDown position and fire click on pointerUp if movement < threshold.
  const downRef = useRef<{ x: number; y: number; id: string } | null>(null);

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
          <div
            key={activity.id}
            data-activity-id={activity.id}
            onPointerDown={(e) => {
              downRef.current = { x: e.clientX, y: e.clientY, id: activity.id };
            }}
            onPointerUp={(e) => {
              const down = downRef.current;
              downRef.current = null;
              if (!down || down.id !== activity.id) return;
              const dx = Math.abs(e.clientX - down.x);
              const dy = Math.abs(e.clientY - down.y);
              if (dx < TAP_THRESHOLD && dy < TAP_THRESHOLD) {
                onActivityClick(activity);
              }
            }}
          >
            <ActivityCard
              activity={activity}
              index={actIndex}
              isActive={activeActivityId === activity.id}
              onHover={onActivityHover}
              onClick={() => {}} // no-op — tap handled by pointer events above
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
