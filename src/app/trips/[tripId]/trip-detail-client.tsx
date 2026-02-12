"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { TripHero } from "@/components/itinerary/trip-hero";
import { TripStats } from "@/components/itinerary/trip-stats";
import { TimelineView } from "@/components/itinerary/timeline-view";
import { MapPanel } from "@/components/map/map-panel";
import { MapProvider } from "@/components/map/map-provider";
import { MobileDrawer } from "@/components/mobile-drawer/mobile-drawer";
import { Button } from "@/components/ui/button";
import { buildDefaultActiveRoutes } from "@/lib/route-utils";
import type { Trip, Activity } from "@/types/trip";

export function TripDetailClient({ trip }: { trip: Trip }) {
  const [activeActivityId, setActiveActivityId] = useState<string | null>(null);
  const [mobileItineraryMode, setMobileItineraryMode] = useState(false);
  const [activeRoutes, setActiveRoutes] = useState<Set<string>>(() =>
    buildDefaultActiveRoutes(trip.routeGroups),
  );

  const handleToggleRoute = useCallback((routeId: string) => {
    setActiveRoutes((prev) => {
      const next = new Set(prev);
      if (next.has(routeId)) {
        next.delete(routeId);
      } else {
        next.add(routeId);
      }
      return next;
    });
  }, []);

  const handleActivityHover = useCallback((id: string | null) => {
    setActiveActivityId(id);
  }, []);

  const handleActivityClick = useCallback((activity: Activity) => {
    setActiveActivityId(activity.id);
  }, []);

  const handleEnterItinerary = useCallback(() => {
    setMobileItineraryMode(true);
  }, []);

  const handleScrollSync = useCallback((id: string) => {
    setActiveActivityId(id);
  }, []);

  return (
    <main className="min-h-screen">
      {/* === Mobile Layout === */}
      <div className="lg:hidden">
        <AnimatePresence mode="wait">
          {!mobileItineraryMode ? (
            /* Phase 1: Hero + Overview */
            <motion.div
              key="hero"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <TripHero
                trip={trip}
                onEnterItinerary={handleEnterItinerary}
              />
              <div className="border-t border-border">
                <TripStats trip={trip} />
              </div>
            </motion.div>
          ) : (
            /* Phase 2: Map + Drawer */
            <motion.div
              key="itinerary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="fixed inset-0 z-40"
            >
              {/* Full-screen map background */}
              <MapProvider>
                <MapPanel
                  trip={trip}
                  activeActivityId={activeActivityId}
                  onActivityHover={handleActivityHover}
                  onActivityClick={handleActivityClick}
                  activeRoutes={activeRoutes}
                  bottomPadding={Math.round(window.innerHeight * 0.55)}
                />
              </MapProvider>

              {/* Back button */}
              <div className="absolute top-4 left-4 z-50">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => setMobileItineraryMode(false)}
                  className="h-10 w-10 rounded-full shadow-lg bg-white/80 backdrop-blur-sm border-0 cursor-pointer"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </div>

              {/* Bottom sheet drawer */}
              <MobileDrawer
                trip={trip}
                activeActivityId={activeActivityId}
                onActivityHover={handleActivityHover}
                onActivityClick={handleActivityClick}
                activeRoutes={activeRoutes}
                onToggleRoute={handleToggleRoute}
                onActiveActivityChange={handleScrollSync}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* === Desktop Layout (unchanged) === */}
      <div className="hidden lg:block">
        <TripHero trip={trip} />

        <div className="relative lg:flex">
          {/* Timeline - left side */}
          <div className="w-full lg:w-[60%] xl:w-[55%]">
            <TimelineView
              trip={trip}
              activeActivityId={activeActivityId}
              onActivityHover={handleActivityHover}
              onActivityClick={handleActivityClick}
              activeRoutes={activeRoutes}
              onToggleRoute={handleToggleRoute}
            />
          </div>

          {/* Map - right side */}
          <div className="lg:w-[40%] xl:w-[45%]">
            <div className="sticky top-14 h-[calc(100vh-3.5rem)]">
              <MapProvider>
                <MapPanel
                  trip={trip}
                  activeActivityId={activeActivityId}
                  onActivityHover={handleActivityHover}
                  onActivityClick={handleActivityClick}
                  activeRoutes={activeRoutes}
                />
              </MapProvider>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
