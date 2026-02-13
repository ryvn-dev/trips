#!/usr/bin/env node

/**
 * Fetches driving route polylines from Google Directions API for consecutive
 * activity pairs in a trip JSON file. Skips flights and activities without
 * coordinates. Writes encoded polylines back into the JSON.
 *
 * Usage:
 *   GOOGLE_MAPS_API_KEY=xxx node scripts/fetch-driving-routes.mjs src/data/trips/sri-lanka-2026.json
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
if (!API_KEY) {
  console.error("Error: set GOOGLE_MAPS_API_KEY env var");
  process.exit(1);
}

const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: node scripts/fetch-driving-routes.mjs <trip-json>");
  process.exit(1);
}

const absPath = resolve(filePath);
const trip = JSON.parse(readFileSync(absPath, "utf-8"));

// Max straight-line distance (km) to consider drivable — anything farther is a flight
const MAX_DRIVE_KM = 300;

/** Haversine distance in km between two lat/lng points. */
function haversineKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

async function fetchRoute(origin, destination) {
  const url = new URL("https://maps.googleapis.com/maps/api/directions/json");
  url.searchParams.set("origin", `${origin.lat},${origin.lng}`);
  url.searchParams.set("destination", `${destination.lat},${destination.lng}`);
  url.searchParams.set("mode", "driving");
  url.searchParams.set("key", API_KEY);

  const res = await fetch(url.toString());
  const data = await res.json();

  if (data.status !== "OK" || !data.routes?.[0]) {
    console.warn(
      `  ⚠ No route: ${origin.lat},${origin.lng} → ${destination.lat},${destination.lng} (${data.status})`,
    );
    return null;
  }

  const route = data.routes[0];
  const leg = route.legs[0];

  return {
    polyline: route.overview_polyline.points,
    distance: leg.distance.text,
    duration: leg.duration.text,
  };
}

async function processTrip() {
  let totalRequests = 0;
  let totalRoutes = 0;

  for (const day of trip.days) {
    // Get activities with coordinates
    const eligible = day.activities.filter((a) => a.coordinates);

    if (eligible.length < 2) {
      day.drivingRoutes = [];
      continue;
    }

    console.log(`\n📅 ${day.title}`);
    const routes = [];

    for (let i = 0; i < eligible.length - 1; i++) {
      const from = eligible[i];
      const to = eligible[i + 1];

      // Skip if same coordinates (e.g. same location)
      if (
        from.coordinates.lat === to.coordinates.lat &&
        from.coordinates.lng === to.coordinates.lng
      ) {
        console.log(`  ⏭ ${from.title} → ${to.title} (same location)`);
        continue;
      }

      // Skip if too far apart — clearly a flight, not a drive
      const dist = haversineKm(from.coordinates, to.coordinates);
      if (dist > MAX_DRIVE_KM) {
        console.log(
          `  ✈️ ${from.title} → ${to.title} (${Math.round(dist)} km — skipped)`,
        );
        continue;
      }

      console.log(`  🚗 ${from.title} → ${to.title} (${Math.round(dist)} km)`);
      totalRequests++;

      const result = await fetchRoute(from.coordinates, to.coordinates);
      if (result) {
        routes.push({
          from: from.id,
          to: to.id,
          polyline: result.polyline,
          distance: result.distance,
          duration: result.duration,
        });
        console.log(`     ✓ ${result.distance}, ${result.duration}`);
        totalRoutes++;
      }

      // Respect rate limits
      await new Promise((r) => setTimeout(r, 200));
    }

    day.drivingRoutes = routes;
  }

  // Write back
  writeFileSync(absPath, JSON.stringify(trip, null, 2) + "\n", "utf-8");
  console.log(
    `\n✅ Done — ${totalRoutes}/${totalRequests} routes saved to ${absPath}`,
  );
}

processTrip().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
