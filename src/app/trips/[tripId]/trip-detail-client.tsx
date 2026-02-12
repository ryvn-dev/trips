"use client";

import { useState, useCallback } from "react";
import { MapIcon, X } from "lucide-react";
import { TripHero } from "@/components/itinerary/trip-hero";
import { TimelineView } from "@/components/itinerary/timeline-view";
import { MapPanel } from "@/components/map/map-panel";
import { MapProvider } from "@/components/map/map-provider";
import { Button } from "@/components/ui/button";
import type { Trip, Activity } from "@/types/trip";

export function TripDetailClient({ trip }: { trip: Trip }) {
  const [activeActivityId, setActiveActivityId] = useState<string | null>(null);
  const [mobileMapOpen, setMobileMapOpen] = useState(false);

  const handleActivityHover = useCallback((id: string | null) => {
    setActiveActivityId(id);
  }, []);

  const handleActivityClick = useCallback((activity: Activity) => {
    setActiveActivityId(activity.id);
    // On mobile, open the map when clicking an activity with coordinates
    if (activity.coordinates && window.innerWidth < 1024) {
      setMobileMapOpen(true);
    }
  }, []);

  return (
    <main className="min-h-screen">
      <TripHero trip={trip} />

      <div className="relative lg:flex">
        {/* Timeline - left side */}
        <div className="w-full lg:w-[60%] xl:w-[55%]">
          <TimelineView
            trip={trip}
            activeActivityId={activeActivityId}
            onActivityHover={handleActivityHover}
            onActivityClick={handleActivityClick}
          />
        </div>

        {/* Map - right side (desktop) */}
        <div className="hidden lg:block lg:w-[40%] xl:w-[45%]">
          <div className="sticky top-14 h-[calc(100vh-3.5rem)]">
            <MapProvider>
              <MapPanel
                trip={trip}
                activeActivityId={activeActivityId}
                onActivityHover={handleActivityHover}
                onActivityClick={handleActivityClick}
              />
            </MapProvider>
          </div>
        </div>

        {/* Mobile map toggle button */}
        <div className="fixed bottom-6 right-6 z-50 lg:hidden">
          <Button
            onClick={() => setMobileMapOpen(!mobileMapOpen)}
            size="lg"
            className="h-14 w-14 rounded-full shadow-xl cursor-pointer"
          >
            <MapIcon className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile map overlay */}
        {mobileMapOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="relative h-full w-full">
              <MapProvider>
                <MapPanel
                  trip={trip}
                  activeActivityId={activeActivityId}
                  onActivityHover={handleActivityHover}
                  onActivityClick={handleActivityClick}
                />
              </MapProvider>

              {/* Close button */}
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setMobileMapOpen(false)}
                className="absolute top-4 right-4 h-10 w-10 rounded-full shadow-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
