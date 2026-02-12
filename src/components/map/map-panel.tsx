"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  Map,
  AdvancedMarker,
  useMap,
  InfoWindow,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import { CATEGORY_CONFIG, type Activity, type Trip } from "@/types/trip";

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
              : "border-white bg-white hover:scale-110"
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

function DayRoutes({ trip }: { trip: Trip }) {
  const map = useMap();
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    if (!map) return;

    // Clean up previous polylines
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];

    trip.days.forEach((day, dayIndex) => {
      const coords = day.activities
        .filter((a) => a.coordinates)
        .map((a) => a.coordinates!);

      if (coords.length < 2) return;

      const polyline = new google.maps.Polyline({
        path: coords,
        geodesic: true,
        strokeColor: DAY_COLORS[dayIndex % DAY_COLORS.length],
        strokeOpacity: 0.6,
        strokeWeight: 3,
        icons: [
          {
            icon: {
              path: "M 0,-1 0,1",
              strokeOpacity: 1,
              scale: 3,
            },
            offset: "0",
            repeat: "16px",
          },
        ],
      });

      polyline.setMap(map);
      polylinesRef.current.push(polyline);
    });

    return () => {
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
    };
  }, [map, trip]);

  return null;
}

function MapController({
  activities,
  activeActivityId,
}: {
  activities: Activity[];
  activeActivityId: string | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    if (activeActivityId) {
      const activity = activities.find((a) => a.id === activeActivityId);
      if (activity?.coordinates) {
        map.panTo(activity.coordinates);
        map.setZoom(15);
      }
    }
  }, [map, activeActivityId, activities]);

  // Fit bounds to all markers on initial load
  useEffect(() => {
    if (!map) return;

    const coords = activities
      .filter((a) => a.coordinates)
      .map((a) => a.coordinates!);

    if (coords.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    coords.forEach((c) => bounds.extend(c));
    map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
  }, [map, activities]);

  return null;
}

export function MapPanel({
  trip,
  activeActivityId,
  onActivityHover,
  onActivityClick,
}: {
  trip: Trip;
  activeActivityId: string | null;
  onActivityHover: (id: string | null) => void;
  onActivityClick: (activity: Activity) => void;
}) {
  const allActivities = useMemo(
    () => trip.days.flatMap((d) => d.activities).filter((a) => a.coordinates),
    [trip]
  );

  const center = useMemo(() => {
    if (allActivities.length === 0) return { lat: 35.6762, lng: 139.6503 };
    const coords = allActivities.map((a) => a.coordinates!);
    return {
      lat: coords.reduce((s, c) => s + c.lat, 0) / coords.length,
      lng: coords.reduce((s, c) => s + c.lng, 0) / coords.length,
    };
  }, [allActivities]);

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
        activities={allActivities}
        activeActivityId={activeActivityId}
      />
      <DayRoutes trip={trip} />
      {allActivities.map((activity) => (
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
