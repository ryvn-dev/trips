"use client";

import { useRef, useEffect } from "react";
import type { TripDay } from "@/types/trip";

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function DrawerDaySelector({
  days,
  activeDay,
  onSelectDay,
}: {
  days: TripDay[];
  activeDay: number;
  onSelectDay: (index: number) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Scroll active pill into view
  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeDay]);

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto scrollbar-none px-4 py-3"
    >
      {days.map((day, index) => (
        <button
          key={day.date}
          ref={index === activeDay ? activeRef : undefined}
          onClick={() => onSelectDay(index)}
          className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
            activeDay === index
              ? "border-ink/20 bg-ink text-paper shadow-sm"
              : "border-border bg-transparent text-ink-muted hover:text-ink"
          }`}
        >
          <span className="font-mono text-[10px] opacity-60">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span>{formatShortDate(day.date)}</span>
        </button>
      ))}
    </div>
  );
}
