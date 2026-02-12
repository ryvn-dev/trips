"use client";

import { ChevronUp } from "lucide-react";
import { CATEGORY_CONFIG, type Activity } from "@/types/trip";

export function DrawerPeekCard({
  activity,
  tripTitle,
  onTap,
}: {
  activity: Activity | null;
  tripTitle: string;
  onTap: () => void;
}) {
  if (!activity) {
    return (
      <button onClick={onTap} className="w-full px-4 pb-4 pt-1 cursor-pointer">
        <p className="text-sm font-semibold text-ink">{tripTitle}</p>
        <div className="mt-2 flex items-center justify-center gap-1 text-[10px] uppercase tracking-[0.2em] text-ink-muted">
          <ChevronUp className="h-3 w-3" />
          <span>Swipe up for itinerary</span>
        </div>
      </button>
    );
  }

  const config = CATEGORY_CONFIG[activity.category];

  return (
    <button onClick={onTap} className="w-full px-4 pb-4 pt-1 text-left cursor-pointer">
      <div className="flex items-center gap-3">
        <span className="text-lg">{config.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-ink truncate">
            {activity.title}
          </p>
          <div className="flex items-center gap-2 text-[11px] text-ink-muted">
            <span className="font-mono">{activity.time}</span>
            {activity.duration && (
              <>
                <span className="text-sand">·</span>
                <span>{activity.duration}</span>
              </>
            )}
          </div>
        </div>
        <ChevronUp className="h-4 w-4 text-ink-muted shrink-0" />
      </div>
    </button>
  );
}
