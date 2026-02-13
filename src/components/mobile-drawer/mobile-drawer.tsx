"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { ArrowLeft } from "lucide-react";
import { DrawerDaySelector } from "./drawer-day-selector";
import { DrawerPeekCard } from "./drawer-peek-card";
import { DrawerActivityList } from "./drawer-activity-list";
import { RouteFilter } from "@/components/itinerary/route-filter";
import { useScrollToMapSync } from "@/hooks/use-scroll-to-map-sync";
import type { Trip, Activity } from "@/types/trip";

const SNAP_POINTS = ["180px", 0.55, 0.92] as const;
const COLLAPSED_SNAP = "180px";
const HALF_SNAP = 0.55;

type SnapPoint = (typeof SNAP_POINTS)[number];

export function MobileDrawer({
  trip,
  activeActivityId,
  onActivityHover,
  onActivityClick,
  activeRoutes,
  onToggleRoute,
  onActiveActivityChange,
  onBack,
}: {
  trip: Trip;
  activeActivityId: string | null;
  onActivityHover: (id: string | null) => void;
  onActivityClick: (activity: Activity) => void;
  activeRoutes: Set<string>;
  onToggleRoute: (routeId: string) => void;
  onActiveActivityChange: (id: string) => void;
  onBack?: () => void;
}) {
  const [activeSnap, setActiveSnap] = useState<SnapPoint>(HALF_SNAP);
  const [activeDay, setActiveDay] = useState(0);
  const [scrollSyncEnabled, setScrollSyncEnabled] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const isCollapsed = activeSnap === COLLAPSED_SNAP;

  // Current activity for peek card (when collapsed)
  const currentActivity = useMemo(() => {
    if (!activeActivityId) return null;
    for (const day of trip.days) {
      const found = day.activities.find((a) => a.id === activeActivityId);
      if (found) return found;
    }
    return null;
  }, [trip.days, activeActivityId]);

  // Handle day selection — scroll to day in drawer
  const handleSelectDay = useCallback((index: number) => {
    setActiveDay(index);
  }, []);

  // Handle activity click within drawer — disable scroll sync briefly
  const handleDrawerActivityClick = useCallback(
    (activity: Activity) => {
      setScrollSyncEnabled(false);
      onActivityClick(activity);
      // Re-enable scroll sync after a brief pause
      setTimeout(() => setScrollSyncEnabled(true), 1200);
    },
    [onActivityClick],
  );

  // Handle scroll-to-map sync callback
  const handleActivityVisible = useCallback(
    (id: string) => {
      onActiveActivityChange(id);
    },
    [onActiveActivityChange],
  );

  // Expand from collapsed on peek card tap
  const handleExpandDrawer = useCallback(() => {
    setActiveSnap(HALF_SNAP);
  }, []);

  // Scroll-to-map sync disabled on mobile — only tap selects an activity
  useScrollToMapSync({
    containerRef: scrollContainerRef,
    onActivityVisible: handleActivityVisible,
    enabled: false,
  });

  return (
    <DrawerPrimitive.Root
      open={true}
      modal={false}
      snapPoints={[...SNAP_POINTS]}
      activeSnapPoint={activeSnap}
      setActiveSnapPoint={setActiveSnap as (snap: string | number | null) => void}
      fadeFromIndex={2}
      dismissible={false}
    >
      <DrawerPrimitive.Portal>
        <DrawerPrimitive.Content
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="drawer-glass fixed inset-x-0 bottom-0 z-50 flex h-full max-h-[92vh] flex-col rounded-t-2xl border-t border-border/30 outline-none lg:!hidden"
        >
          <DrawerPrimitive.Title className="sr-only">Itinerary</DrawerPrimitive.Title>
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
            <div className="h-1 w-10 rounded-full bg-ink-muted/30" />
          </div>

          {isCollapsed ? (
            <DrawerPeekCard
              activity={currentActivity}
              tripTitle={trip.title}
              onTap={handleExpandDrawer}
            />
          ) : (
            <>
              {/* Back link */}
              {onBack && (
                <div className="px-4 pt-1 pb-2">
                  <button
                    onClick={onBack}
                    className="flex items-center gap-1 text-xs text-ink-muted transition-colors hover:text-ink cursor-pointer"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Overview
                  </button>
                </div>
              )}

              {/* Day selector */}
              <DrawerDaySelector
                days={trip.days}
                activeDay={activeDay}
                onSelectDay={handleSelectDay}
              />

              {/* Route filter (if trip has route groups) */}
              {trip.routeGroups && trip.routeGroups.length > 0 && (
                <RouteFilter
                  routeGroups={trip.routeGroups}
                  activeRoutes={activeRoutes}
                  onToggleRoute={onToggleRoute}
                />
              )}

              {/* Scrollable activity list */}
              <div
                ref={scrollContainerRef}
                data-vaul-no-drag
                className="flex-1 overflow-y-auto overscroll-contain pb-8"
              >
                <DrawerActivityList
                  trip={trip}
                  dayIndex={activeDay}
                  activeActivityId={activeActivityId}
                  onActivityHover={onActivityHover}
                  onActivityClick={handleDrawerActivityClick}
                  activeRoutes={activeRoutes}
                />

                {/* End marker */}
                <div className="flex flex-col items-center gap-2 pt-8 pb-[40vh]">
                  <div className="h-6 w-px bg-border/60" />
                  <div className="h-2 w-2 rotate-45 bg-vermillion/30" />
                  <span className="text-[10px] uppercase tracking-[0.3em] text-ink-muted mt-1">
                    End of journey
                  </span>
                </div>
              </div>
            </>
          )}
        </DrawerPrimitive.Content>
      </DrawerPrimitive.Portal>
    </DrawerPrimitive.Root>
  );
}
