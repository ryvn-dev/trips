"use client";

import { useState } from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import {
  ChevronRight,
  MapPin,
  Users,
  ClipboardList,
  BookOpen,
} from "lucide-react";
import type { Trip } from "@/types/trip";
import type { LucideIcon } from "lucide-react";
import CountUp from "@/components/ui/count-up";

export type MobileView = "hub" | "itinerary" | "preparation" | "culture";

const SNAP_POINTS = ["180px", 0.45, 0.92] as const;
const HALF_SNAP = 0.45;

type SnapPoint = (typeof SNAP_POINTS)[number];

interface NavItem {
  key: MobileView;
  icon: LucideIcon;
  title: string;
  description: string;
}

function HubStats({ trip }: { trip: Trip }) {
  const totalActivities = trip.days.reduce(
    (sum, day) => sum + day.activities.length,
    0,
  );
  const foodCount = trip.days.reduce(
    (sum, day) =>
      sum + day.activities.filter((a) => a.category === "food").length,
    0,
  );
  const sightCount = trip.days.reduce(
    (sum, day) =>
      sum + day.activities.filter((a) => a.category === "sight").length,
    0,
  );

  const stats = [
    { value: trip.days.length, label: trip.days.length === 1 ? "Day" : "Days" },
    { value: totalActivities, label: "Stops" },
    { value: foodCount, label: "Eats" },
    { value: sightCount, label: "Sights" },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 px-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col items-center rounded-lg py-3"
        >
          <CountUp
            from={0}
            to={stat.value}
            direction="up"
            duration={1}
            className="text-2xl font-mono font-bold tabular-nums leading-none text-ink"
          />
          <span className="mt-2 text-[10px] uppercase tracking-[0.2em] text-ink-muted">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function HubDrawer({
  trip,
  onNavigate,
}: {
  trip: Trip;
  onNavigate: (view: MobileView) => void;
}) {
  const [activeSnap, setActiveSnap] = useState<SnapPoint>(HALF_SNAP);

  const navItems: NavItem[] = [
    {
      key: "itinerary",
      icon: MapPin,
      title: "Itinerary",
      description: "Day-by-day route & activities",
    },
    ...(trip.guides?.preparation
      ? [
          {
            key: "preparation" as const,
            icon: ClipboardList,
            title: "Pre-Trip Prep",
            description: "Visa, packing, budget & more",
          },
        ]
      : []),
    ...(trip.guides?.culture
      ? [
          {
            key: "culture" as const,
            icon: BookOpen,
            title: "Culture & History",
            description: "Customs, food, language",
          },
        ]
      : []),
  ];

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
        <DrawerPrimitive.Content className="drawer-glass fixed inset-x-0 bottom-0 z-50 flex h-full max-h-[92vh] flex-col rounded-t-2xl border-t border-border/30 outline-none lg:!hidden">
          <DrawerPrimitive.Title className="sr-only">Trip Overview</DrawerPrimitive.Title>
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-3 cursor-grab active:cursor-grabbing">
            <div className="h-1 w-10 rounded-full bg-ink-muted/30" />
          </div>

          {/* Stats */}
          <div className="pb-4">
            <HubStats trip={trip} />
          </div>

          <div className="h-px bg-border/40" />

          {/* Scrollable content */}
          <div data-vaul-no-drag className="flex-1 overflow-y-auto overscroll-contain">
            {/* Navigation items */}
            <div className="divide-y divide-border/40">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => onNavigate(item.key)}
                    className="flex w-full items-center gap-3.5 px-5 py-4 text-left transition-all active:bg-paper-dark/50 cursor-pointer"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo/8">
                      <Icon className="h-4 w-4 text-ink-light" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-ink-muted mt-0.5">
                        {item.description}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-ink-muted/60 shrink-0" />
                  </button>
                );
              })}
            </div>

            {/* Travelers */}
            <div className="px-5 py-4">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-ink-muted mb-3">
                <Users className="h-3 w-3" />
                Travelers
              </div>
              <div className="flex flex-wrap gap-2">
                {trip.travelers.map((name) => (
                  <span
                    key={name}
                    className="inline-flex items-center gap-1.5 rounded-full border border-indigo/15 bg-indigo/8 px-3 py-1.5 text-xs font-medium text-ink"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="px-5 pb-4">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-ink-muted mb-2">
                <MapPin className="h-3 w-3" />
                Location
              </div>
              <p className="text-sm text-ink">{trip.location}</p>
            </div>

            {/* End marker */}
            <div className="flex flex-col items-center gap-2 pt-4 pb-[40vh]">
              <div className="h-2 w-2 rotate-45 bg-sand/40" />
            </div>
          </div>
        </DrawerPrimitive.Content>
      </DrawerPrimitive.Portal>
    </DrawerPrimitive.Root>
  );
}
