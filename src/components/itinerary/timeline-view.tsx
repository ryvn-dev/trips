"use client";

import { useState, useCallback } from "react";
import { DaySection } from "./day-section";
import { TripStats } from "./trip-stats";
import type { Trip, Activity } from "@/types/trip";

export function TimelineView({
  trip,
  onActivityHover,
  onActivityClick,
  activeActivityId,
}: {
  trip: Trip;
  onActivityHover: (id: string | null) => void;
  onActivityClick: (activity: Activity) => void;
  activeActivityId: string | null;
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
              className={`shrink-0 px-4 py-3 text-sm font-medium transition-colors border-b-2 cursor-pointer ${
                activeDay === index
                  ? "border-foreground text-foreground"
                  : "border-transparent text-ink-muted hover:text-foreground"
              }`}
            >
              Day {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline content */}
      <div className="flex-1 space-y-10 p-4 sm:p-6">
        {trip.days.map((day, index) => (
          <DaySection
            key={day.date}
            day={day}
            dayIndex={index}
            activeActivityId={activeActivityId}
            onActivityHover={onActivityHover}
            onActivityClick={onActivityClick}
          />
        ))}

        {/* End marker */}
        <div className="flex items-center gap-3 py-8">
          <div className="h-px flex-1 bg-border" />
          <span className="text-sm text-ink-muted">End of trip</span>
          <div className="h-px flex-1 bg-border" />
        </div>
      </div>
    </div>
  );
}
