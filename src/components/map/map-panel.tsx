"use client";

import { useEffect, useMemo, useRef } from "react";
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
} from "@/types/trip";
import { filterActivitiesByRoute } from "@/lib/route-utils";

const DAY_COLORS = [
  "#c45b84", // rose (sakura accent)
  "#3d5a80", // indigo
  "#6b7f5e", // moss
  "#d4a060", // gold
  "#8b5e83", // plum
  "#4a9e8e", // teal
];

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

    // Clean up previous polylines
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];

    trip.days.forEach((day, dayIndex) => {
      const dayColor = DAY_COLORS[dayIndex % DAY_COLORS.length];

      if (trip.routeGroups && trip.routeGroups.length > 0) {
        // Group activities by route
        const sharedCoords = day.activities
          .filter(
            (a) => !a.routeGroup && a.coordinates && activeRoutes.has("shared"),
          )
          .map((a) => a.coordinates!);

        // Draw shared polyline
        if (sharedCoords.length >= 2) {
          const polyline = new google.maps.Polyline({
            path: sharedCoords,
            geodesic: true,
            strokeColor: dayColor,
            strokeOpacity: 0.6,
            strokeWeight: 3,
            icons: [
              {
                icon: { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 3 },
                offset: "0",
                repeat: "16px",
              },
            ],
          });
          polyline.setMap(map);
          polylinesRef.current.push(polyline);
        }

        // Draw per-route polylines
        for (const rg of trip.routeGroups) {
          if (!activeRoutes.has(rg.id)) continue;
          const routeActs = day.activities.filter(
            (a) => a.routeGroup === rg.id && a.coordinates,
          );
          if (routeActs.length === 0) continue;

          const rgColors = ROUTE_GROUP_COLORS[rg.color];
          const strokeColor = rgColors?.mapColor ?? dayColor;

          // Find shared anchors before/after this route segment
          const allWithCoords = day.activities.filter((a) => a.coordinates);
          const routeIds = new Set(routeActs.map((a) => a.id));
          const firstIdx = allWithCoords.findIndex((a) => routeIds.has(a.id));
          const lastIdx =
            allWithCoords.length -
            1 -
            [...allWithCoords].reverse().findIndex((a) => routeIds.has(a.id));

          const anchored: Activity[] = [];
          // Find preceding shared anchor
          for (let i = firstIdx - 1; i >= 0; i--) {
            if (!allWithCoords[i].routeGroup) {
              anchored.push(allWithCoords[i]);
              break;
            }
          }
          anchored.push(...routeActs);
          // Find following shared anchor
          for (let i = lastIdx + 1; i < allWithCoords.length; i++) {
            if (!allWithCoords[i].routeGroup) {
              anchored.push(allWithCoords[i]);
              break;
            }
          }

          const coords = anchored.map((a) => a.coordinates!);
          if (coords.length >= 2) {
            const polyline = new google.maps.Polyline({
              path: coords,
              geodesic: true,
              strokeColor,
              strokeOpacity: 0.5,
              strokeWeight: 2.5,
              icons: [
                {
                  icon: {
                    path: "M 0,-1 0,1",
                    strokeOpacity: 0.8,
                    scale: 2,
                  },
                  offset: "0",
                  repeat: "10px",
                },
              ],
            });
            polyline.setMap(map);
            polylinesRef.current.push(polyline);
          }
        }
      } else {
        // No route groups — original behavior
        const coords = day.activities
          .filter((a) => a.coordinates)
          .map((a) => a.coordinates!);

        if (coords.length < 2) return;

        const polyline = new google.maps.Polyline({
          path: coords,
          geodesic: true,
          strokeColor: dayColor,
          strokeOpacity: 0.6,
          strokeWeight: 3,
          icons: [
            {
              icon: { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 3 },
              offset: "0",
              repeat: "16px",
            },
          ],
        });

        polyline.setMap(map);
        polylinesRef.current.push(polyline);
      }
    });

    return () => {
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
    };
  }, [map, trip, activeRoutes]);

  return null;
}

function MapController({
  activities,
  activeActivityId,
  bottomPadding = 50,
}: {
  activities: Activity[];
  activeActivityId: string | null;
  bottomPadding?: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    if (activeActivityId) {
      const activity = activities.find((a) => a.id === activeActivityId);
      if (activity?.coordinates) {
        map.panTo(activity.coordinates);
        map.setZoom(15);
        // Offset center downward so marker appears in visible area above drawer
        if (bottomPadding > 50) {
          map.panBy(0, Math.round(bottomPadding / 2));
        }
      }
    }
  }, [map, activeActivityId, activities, bottomPadding]);

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
  onActivityHover,
  onActivityClick,
  activeRoutes,
  bottomPadding = 50,
}: {
  trip: Trip;
  activeActivityId: string | null;
  onActivityHover: (id: string | null) => void;
  onActivityClick: (activity: Activity) => void;
  activeRoutes: Set<string>;
  bottomPadding?: number;
}) {
  const filteredActivities = useMemo(() => {
    const all = trip.days.flatMap((d) => d.activities);
    return filterActivitiesByRoute(all, activeRoutes).filter(
      (a) => a.coordinates,
    );
  }, [trip, activeRoutes]);

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
        bottomPadding={bottomPadding}
      />
      <DayRoutes trip={trip} activeRoutes={activeRoutes} />
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
