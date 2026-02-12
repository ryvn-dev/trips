"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * Watches activity card elements inside a scroll container using IntersectionObserver.
 * When an activity enters the "active zone" (top third of visible area),
 * fires onActivityVisible so the map can pan to the matching location.
 */
export function useScrollToMapSync({
  containerRef,
  onActivityVisible,
  enabled,
}: {
  containerRef: RefObject<HTMLElement | null>;
  onActivityVisible: (id: string) => void;
  enabled: boolean;
}) {
  const callbackRef = useRef(onActivityVisible);
  callbackRef.current = onActivityVisible;

  useEffect(() => {
    if (!enabled) return;
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry closest to the top of the visible area
        let bestEntry: IntersectionObserverEntry | null = null;
        let bestRatio = 0;

        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            bestEntry = entry;
          }
        }

        if (bestEntry) {
          const id = (bestEntry.target as HTMLElement).dataset.activityId;
          if (id) {
            callbackRef.current(id);
          }
        }
      },
      {
        root: container,
        // Active zone: top ~30% of the visible scroll area
        rootMargin: "-10% 0px -65% 0px",
        threshold: [0, 0.5, 1],
      },
    );

    // Observe all activity card elements within the container
    const cards = container.querySelectorAll("[data-activity-id]");
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [containerRef, enabled]);
}
