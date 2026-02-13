"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Map,
  AdvancedMarker,
  useMap,
  InfoWindow,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import {
  CATEGORY_CONFIG,
  ROUTE_GROUP_COLORS,
  type Activity,
  type Trip,
  type DrivingRoute,
} from "@/types/trip";
import { filterActivitiesByRoute } from "@/lib/route-utils";

// Morandi-palette — muted, dusty tones; distinct per day but cohesive
const DAY_COLORS = [
  "#8b7355", // warm umber
  "#7a9aaa", // dusty blue
  "#b87a7a", // faded rose
  "#7aaa98", // sage green
  "#9a8aaa", // lavender grey
  "#b0a07a", // wheat
  "#a0636e", // plum
  "#5a8a7a", // muted teal
  "#c4956a", // terracotta
  "#6a7a8a", // slate
];


/** Decode a Google Maps encoded polyline string into lat/lng pairs. */
function decodePolyline(encoded: string): google.maps.LatLngLiteral[] {
  const points: google.maps.LatLngLiteral[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return points;
}

/** Haversine distance in km between two lat/lng points. */
function haversineDistance(
  a: google.maps.LatLngLiteral,
  b: google.maps.LatLngLiteral,
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      sinLng * sinLng;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/** Build cumulative distance array along a polyline path. */
function buildCumulativeDistances(path: google.maps.LatLngLiteral[]): number[] {
  const d = [0];
  for (let i = 1; i < path.length; i++) {
    d.push(d[i - 1] + haversineDistance(path[i - 1], path[i]));
  }
  return d;
}

/** Interpolate a position along a polyline path given a 0→1 fraction. */
function interpolateAlongPath(
  path: google.maps.LatLngLiteral[],
  cumDist: number[],
  totalDist: number,
  fraction: number,
): { point: google.maps.LatLngLiteral; heading: number } {
  const target = fraction * totalDist;
  let lo = 0;
  let hi = cumDist.length - 1;
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    if (cumDist[mid] <= target) lo = mid;
    else hi = mid;
  }
  const segLen = cumDist[hi] - cumDist[lo];
  const segFrac = segLen > 0 ? (target - cumDist[lo]) / segLen : 0;
  const a = path[lo];
  const b = path[hi];
  return {
    point: {
      lat: a.lat + (b.lat - a.lat) * segFrac,
      lng: a.lng + (b.lng - a.lng) * segFrac,
    },
    heading: Math.atan2(b.lng - a.lng, b.lat - a.lat) * (180 / Math.PI),
  };
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function ActivityMarker({
  activity,
  isActive,
  onHover,
  onClick,
}: {
  activity: Activity;
  isActive: boolean;
  onHover: (id: string | null) => void;
  onClick: (activity: Activity) => void;
}) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const config = CATEGORY_CONFIG[activity.category];

  if (!activity.coordinates) return null;

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={activity.coordinates}
        onClick={() => onClick(activity)}
        onMouseEnter={() => onHover(activity.id)}
        onMouseLeave={() => onHover(null)}
        zIndex={isActive ? 100 : 1}
      >
        <div
          className={`flex items-center gap-1 rounded-full border-2 px-2 py-1 text-xs font-medium shadow-md transition-all duration-200 ${
            isActive
              ? "scale-125 border-foreground bg-white shadow-lg"
              : "border-white bg-white hover:scale-105"
          }`}
        >
          <span>{config.emoji}</span>
          <span className="max-w-[100px] truncate text-ink hidden sm:inline">
            {activity.title}
          </span>
        </div>
      </AdvancedMarker>

      {isActive && marker && (
        <InfoWindow
          anchor={marker}
          headerDisabled
          className="max-w-[200px]"
        >
          <div className="p-1">
            <p className="font-semibold text-sm text-gray-900">
              {activity.title}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{activity.location}</p>
            {activity.time && (
              <p className="text-xs text-gray-400 mt-0.5">
                {activity.time}
                {activity.duration && ` · ${activity.duration}`}
              </p>
            )}
          </div>
        </InfoWindow>
      )}
    </>
  );
}

/** Resolve stroke color for a driving route segment — per-day color with route group override. */
function getSegmentColor(
  route: DrivingRoute,
  activityMap: Record<string, Activity>,
  trip: Trip,
  dayIndex: number,
): string {
  const from = activityMap[route.from];
  const to = activityMap[route.to];
  // If both ends share the same route group, use that group's color
  if (from?.routeGroup && from.routeGroup === to?.routeGroup) {
    const rg = trip.routeGroups?.find((g) => g.id === from.routeGroup);
    if (rg) {
      return ROUTE_GROUP_COLORS[rg.color]?.mapColor ?? DAY_COLORS[dayIndex % DAY_COLORS.length];
    }
  }
  return DAY_COLORS[dayIndex % DAY_COLORS.length];
}

/** Draws dashed flight lines only — driving routes are shown by RouteAnimator during animation. */
function DayRoutes({
  trip,
  activeRoutes,
}: {
  trip: Trip;
  activeRoutes: Set<string>;
}) {
  const map = useMap();
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    if (!map) return;

    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];

    for (const day of trip.days) {
      const flights = day.activities.filter(
        (a) => a.category === "flight" && a.coordinates,
      );

      // Group by routeGroup to draw lines within each traveler's journey
      const byGroup = new globalThis.Map<string, Activity[]>();
      for (const a of flights) {
        const group = a.routeGroup ?? "shared";
        if (!activeRoutes.has(group)) continue;
        const arr = byGroup.get(group) ?? [];
        arr.push(a);
        byGroup.set(group, arr);
      }

      for (const [, activities] of byGroup) {
        for (let i = 0; i < activities.length - 1; i++) {
          const from = activities[i];
          const to = activities[i + 1];
          if (
            from.coordinates!.lat === to.coordinates!.lat &&
            from.coordinates!.lng === to.coordinates!.lng
          ) continue;

          const rg = from.routeGroup
            ? trip.routeGroups?.find((g) => g.id === from.routeGroup)
            : undefined;
          const color = rg
            ? (ROUTE_GROUP_COLORS[rg.color]?.mapColor ?? "#8b7355")
            : "#8b7355";

          const polyline = new google.maps.Polyline({
            path: [from.coordinates!, to.coordinates!],
            geodesic: true,
            strokeColor: color,
            strokeOpacity: 0,
            icons: [{
              icon: {
                path: "M 0,-1 0,1",
                strokeOpacity: 0.6,
                strokeWeight: 2,
                scale: 3,
              },
              offset: "0",
              repeat: "12px",
            }],
          });
          polyline.setMap(map);
          polylinesRef.current.push(polyline);
        }
      }
    }

    return () => {
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
    };
  }, [map, trip, activeRoutes]);

  return null;
}

/** Animates a capybara along a driving route when consecutive activities are clicked.
 *  Also draws the route polyline during animation. */
function RouteAnimator({
  clickedActivityId,
  routeLookup,
  onAnimatingChange,
  bottomPadding = 50,
}: {
  clickedActivityId: string | null;
  routeLookup: globalThis.Map<string, { route: DrivingRoute; dayIndex: number; color: string }>;
  onAnimatingChange: (animating: boolean) => void;
  bottomPadding?: number;
}) {
  const map = useMap();
  const prevIdRef = useRef<string | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const rafRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Don't track clicks until the map is ready — otherwise prevIdRef gets
    // updated before the map loads and we lose the click pair (mobile bug).
    if (!map) return;

    // Cancel any in-flight animation
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (markerRef.current) {
      markerRef.current.map = null;
      markerRef.current = null;
    }
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }
    onAnimatingChange(false);

    const prevId = prevIdRef.current;
    prevIdRef.current = clickedActivityId;

    if (!prevId || !clickedActivityId || prevId === clickedActivityId) return;

    // Check if these two activities are connected by a driving route
    let entry = routeLookup.get(`${prevId}->${clickedActivityId}`);
    let reversed = false;
    if (!entry) {
      entry = routeLookup.get(`${clickedActivityId}->${prevId}`);
      reversed = true;
    }
    if (!entry) return;

    // Decode path
    let path = decodePolyline(entry.route.polyline);
    if (reversed) path = [...path].reverse();
    if (path.length < 2) return;

    // Compute distances for interpolation
    const cumDist = buildCumulativeDistances(path);
    const totalDist = cumDist[cumDist.length - 1];

    // Fixed 5s per route segment
    const duration = 5000;

    // Tell MapController to stop fighting — we own the camera now
    onAnimatingChange(true);

    // Draw the route polyline (visible only during animation)
    const routePolyline = new google.maps.Polyline({
      path,
      geodesic: false,
      strokeColor: entry.color,
      strokeOpacity: 0.8,
      strokeWeight: 4,
    });
    routePolyline.setMap(map);
    polylineRef.current = routePolyline;

    // Fit map to show entire route — account for drawer on mobile
    const bounds = new google.maps.LatLngBounds();
    path.forEach((p) => bounds.extend(p));
    map.fitBounds(bounds, { top: 60, right: 60, bottom: bottomPadding + 60, left: 60 });

    // Create capybara marker
    const content = document.createElement("div");
    const img = document.createElement("img");
    img.src = "/nA3Up1.gif";
    img.style.width = "48px";
    img.style.height = "48px";
    img.style.imageRendering = "pixelated";
    content.appendChild(img);

    const capy = new google.maps.marker.AdvancedMarkerElement({
      map,
      position: path[0],
      content,
      zIndex: 200,
    });
    markerRef.current = capy;

    // Small delay to let fitBounds settle before animating
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      const startTime = performance.now();

      function animate(now: number) {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = easeInOutCubic(progress);
        const { point, heading } = interpolateAlongPath(path, cumDist, totalDist, eased);

        capy.position = point;
        // Flip horizontally when heading left (west)
        img.style.transform = heading < -90 || heading > 90 ? "scaleX(-1)" : "";

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate);
        } else {
          // Brief pause then clean up
          timeoutRef.current = setTimeout(() => {
            if (markerRef.current === capy) {
              capy.map = null;
              markerRef.current = null;
            }
            if (polylineRef.current) {
              polylineRef.current.setMap(null);
              polylineRef.current = null;
            }
            onAnimatingChange(false);
            timeoutRef.current = null;
          }, 500);
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    }, 300);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (markerRef.current) {
        markerRef.current.map = null;
        markerRef.current = null;
      }
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
      onAnimatingChange(false);
    };
  }, [map, clickedActivityId, routeLookup, onAnimatingChange, bottomPadding]);

  return null;
}

function MapController({
  activities,
  activeActivityId,
  isAnimating,
  bottomPadding = 50,
}: {
  activities: Activity[];
  activeActivityId: string | null;
  isAnimating: boolean;
  bottomPadding?: number;
}) {
  const map = useMap();
  const bottomPaddingRef = useRef(bottomPadding);
  bottomPaddingRef.current = bottomPadding;

  useEffect(() => {
    if (!map || isAnimating) return;

    if (activeActivityId) {
      const activity = activities.find((a) => a.id === activeActivityId);
      if (activity?.coordinates) {
        map.panTo(activity.coordinates);
        map.setZoom(15);
        // Offset center downward so marker appears in visible area above drawer
        const pad = bottomPaddingRef.current;
        if (pad > 50) {
          map.panBy(0, Math.round(pad / 2));
        }
      }
    }
  }, [map, activeActivityId, activities, isAnimating]);

  // Fit bounds to all markers on initial load
  useEffect(() => {
    if (!map) return;

    const coords = activities
      .filter((a) => a.coordinates)
      .map((a) => a.coordinates!);

    if (coords.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    coords.forEach((c) => bounds.extend(c));
    map.fitBounds(bounds, { top: 50, right: 50, bottom: bottomPadding, left: 50 });
  }, [map, activities, bottomPadding]);

  return null;
}

export function MapPanel({
  trip,
  activeActivityId,
  clickedActivityId,
  onActivityHover,
  onActivityClick,
  activeRoutes,
  bottomPadding = 50,
}: {
  trip: Trip;
  activeActivityId: string | null;
  clickedActivityId: string | null;
  onActivityHover: (id: string | null) => void;
  onActivityClick: (activity: Activity) => void;
  activeRoutes: Set<string>;
  bottomPadding?: number;
}) {
  const [isAnimating, setIsAnimating] = useState(false);
  const handleAnimatingChange = useCallback((animating: boolean) => {
    setIsAnimating(animating);
  }, []);

  const filteredActivities = useMemo(() => {
    const all = trip.days.flatMap((d) => d.activities);
    return filterActivitiesByRoute(all, activeRoutes).filter(
      (a) => a.coordinates,
    );
  }, [trip, activeRoutes]);

  // O(1) lookup for consecutive activity pairs connected by a driving route
  const routeLookup = useMemo(() => {
    const activityMap: Record<string, Activity> = {};
    for (const day of trip.days) {
      for (const a of day.activities) activityMap[a.id] = a;
    }
    const lookup = new globalThis.Map<string, { route: DrivingRoute; dayIndex: number; color: string }>();
    trip.days.forEach((day, dayIndex) => {
      for (const route of day.drivingRoutes ?? []) {
        const color = getSegmentColor(route, activityMap, trip, dayIndex);
        lookup.set(`${route.from}->${route.to}`, { route, dayIndex, color });
      }
    });
    return lookup;
  }, [trip]);

  const center = useMemo(() => {
    if (filteredActivities.length === 0)
      return { lat: 35.6762, lng: 139.6503 };
    const coords = filteredActivities.map((a) => a.coordinates!);
    return {
      lat: coords.reduce((s, c) => s + c.lat, 0) / coords.length,
      lng: coords.reduce((s, c) => s + c.lng, 0) / coords.length,
    };
  }, [filteredActivities]);

  return (
    <Map
      defaultCenter={center}
      defaultZoom={12}
      mapId="trips-map"
      gestureHandling="cooperative"
      disableDefaultUI={false}
      zoomControl={true}
      mapTypeControl={false}
      streetViewControl={false}
      fullscreenControl={false}
      className="h-full w-full"
      colorScheme="LIGHT"
    >
      <MapController
        activities={filteredActivities}
        activeActivityId={activeActivityId}
        isAnimating={isAnimating}
        bottomPadding={bottomPadding}
      />
      <DayRoutes trip={trip} activeRoutes={activeRoutes} />
      <RouteAnimator
        clickedActivityId={clickedActivityId}
        routeLookup={routeLookup}
        onAnimatingChange={handleAnimatingChange}
        bottomPadding={bottomPadding}
      />
      {filteredActivities.map((activity) => (
        <ActivityMarker
          key={activity.id}
          activity={activity}
          isActive={activeActivityId === activity.id}
          onHover={onActivityHover}
          onClick={onActivityClick}
        />
      ))}
    </Map>
  );
}
