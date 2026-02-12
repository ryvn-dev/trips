"use client";

import { useState, useCallback } from "react";
import { DaySection } from "./day-section";
import { TripStats } from "./trip-stats";
import { RouteFilter } from "./route-filter";
import type { Trip, Activity } from "@/types/trip";

export function TimelineView({
  trip,
  onActivityHover,
  onActivityClick,
  activeActivityId,
  activeRoutes,
  onToggleRoute,
}: {
  trip: Trip;
  onActivityHover: (id: string | null) => void;
  onActivityClick: (activity: Activity) => void;
  activeActivityId: string | null;
  activeRoutes: Set<string>;
  onToggleRoute: (routeId: string) => void;
}) {
  const [activeDay, setActiveDay] = useState(0);

  const scrollToDay = useCallback((index: number) => {
    setActiveDay(index);
    const el = document.getElementById(`day-${index}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <div className="flex flex-col">
      {/* Stats bar */}
      <div className="border-b border-border bg-card/50">
        <TripStats trip={trip} />
      </div>

      {/* Day navigation tabs */}
      <div className="sticky top-14 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="flex overflow-x-auto scrollbar-none">
          {trip.days.map((day, index) => (
            <button
              key={day.date}
              onClick={() => scrollToDay(index)}
              className={`shrink-0 px-3 py-3 text-xs transition-colors cursor-pointer flex flex-col items-center border-b-2 ${
                activeDay === index
                  ? "border-foreground text-foreground font-semibold"
                  : "border-transparent text-ink-muted hover:text-foreground"
              }`}
            >
              <span className="font-mono text-[10px] text-ink-muted/60">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="mt-0.5 tracking-tight">Day {index + 1}</span>
            </button>
          ))}
        </div>
        {trip.routeGroups && trip.routeGroups.length > 0 && (
          <div className="border-t border-border/50">
            <RouteFilter
              routeGroups={trip.routeGroups}
              activeRoutes={activeRoutes}
              onToggleRoute={onToggleRoute}
            />
          </div>
        )}
      </div>

      {/* Timeline content */}
      <div className="flex-1 space-y-14 sm:space-y-16 p-4 sm:p-6">
        {trip.days.map((day, index) => (
          <DaySection
            key={day.date}
            day={day}
            dayIndex={index}
            activeActivityId={activeActivityId}
            onActivityHover={onActivityHover}
            onActivityClick={onActivityClick}
            activeRoutes={activeRoutes}
            routeGroups={trip.routeGroups}
          />
        ))}

        {/* End marker — editorial terminal */}
        <div className="flex flex-col items-center gap-2 py-12">
          <div className="h-8 w-px bg-border" />
          <div className="h-2 w-2 rotate-45 bg-vermillion/30" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-ink-muted mt-1">
            End of journey
          </span>
        </div>
      </div>
    </div>
  );
}
