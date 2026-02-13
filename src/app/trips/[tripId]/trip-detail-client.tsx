"use client";

import { useState, useCallback } from "react";
import { Share2, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { TripHero } from "@/components/itinerary/trip-hero";
import { TimelineView } from "@/components/itinerary/timeline-view";
import { MapPanel } from "@/components/map/map-panel";
import { MapProvider } from "@/components/map/map-provider";
import { MobileDrawer } from "@/components/mobile-drawer/mobile-drawer";
import { HubDrawer } from "@/components/mobile-drawer/hub-drawer";
import { GuideDrawer } from "@/components/mobile-drawer/guide-drawer";
import { GuideTopImage } from "@/components/mobile-drawer/guide-top-image";
import { buildDefaultActiveRoutes } from "@/lib/route-utils";
import type { Trip, Activity } from "@/types/trip";
import type { MobileView } from "@/components/mobile-drawer/hub-drawer";

export function TripDetailClient({ trip }: { trip: Trip }) {
  const [activeActivityId, setActiveActivityId] = useState<string | null>(null);
  const [clickedActivityId, setClickedActivityId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<MobileView>("hub");
  const [activeRoutes, setActiveRoutes] = useState<Set<string>>(() =>
    buildDefaultActiveRoutes(trip.routeGroups),
  );
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: trip.title, url });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [trip.title]);

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
    setClickedActivityId(activity.id);
  }, []);

  const handleScrollSync = useCallback((id: string) => {
    setActiveActivityId(id);
  }, []);

  const handleNavigate = useCallback((view: MobileView) => {
    setActiveActivityId(null);
    setMobileView(view);
  }, []);

  const handleBackToHub = useCallback(() => {
    setActiveActivityId(null);
    setMobileView("hub");
  }, []);

  return (
    <main className="min-h-screen">
      {/* === Mobile Layout === */}
      <div className="lg:hidden">
        <AnimatePresence mode="wait">
          {mobileView === "hub" && (
            <motion.div
              key="hub"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <TripHero trip={trip} />
              {/* Share — floating top-right over hero */}
              <button
                onClick={handleShare}
                className="fixed top-5 right-5 z-50 flex h-9 w-9 items-center justify-center rounded-full bg-black/20 backdrop-blur-sm text-white transition-colors hover:bg-black/30 cursor-pointer"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Share2 className="h-4 w-4" />
                )}
              </button>
              <HubDrawer
                trip={trip}
                onNavigate={handleNavigate}
              />
            </motion.div>
          )}

          {mobileView === "itinerary" && (
            <motion.div
              key="itinerary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="fixed inset-0 z-40"
            >
              <MapProvider>
                <MapPanel
                  trip={trip}
                  activeActivityId={activeActivityId}
                  clickedActivityId={clickedActivityId}
                  onActivityHover={handleActivityHover}
                  onActivityClick={handleActivityClick}
                  activeRoutes={activeRoutes}
                  bottomPadding={Math.round(window.innerHeight * 0.55)}
                />
              </MapProvider>

              <MobileDrawer
                trip={trip}
                activeActivityId={activeActivityId}
                onActivityHover={handleActivityHover}
                onActivityClick={handleActivityClick}
                activeRoutes={activeRoutes}
                onToggleRoute={handleToggleRoute}
                onActiveActivityChange={handleScrollSync}
                onBack={handleBackToHub}
              />
            </motion.div>
          )}

          {mobileView === "preparation" && trip.guides?.preparation && (
            <motion.div
              key="preparation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="fixed inset-0 z-40"
            >
              <GuideTopImage
                src={trip.guides.preparation.coverImage || trip.coverImage}
                alt={trip.guides.preparation.title}
              />
              <GuideDrawer
                guide={trip.guides.preparation}
                onBack={handleBackToHub}
              />
            </motion.div>
          )}

          {mobileView === "culture" && trip.guides?.culture && (
            <motion.div
              key="culture"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="fixed inset-0 z-40"
            >
              <GuideTopImage
                src={trip.guides.culture.coverImage || trip.coverImage}
                alt={trip.guides.culture.title}
              />
              <GuideDrawer
                guide={trip.guides.culture}
                onBack={handleBackToHub}
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
                  clickedActivityId={clickedActivityId}
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
