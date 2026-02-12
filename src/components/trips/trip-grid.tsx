"use client";

import { TripCard } from "./trip-card";
import type { TripSummary } from "@/types/trip";

export function TripGrid({ trips }: { trips: TripSummary[] }) {
  if (trips.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-lg text-ink-muted">No trips yet.</p>
        <p className="mt-1 text-sm text-ink-muted">
          Add a trip JSON file to get started.
        </p>
      </div>
    );
  }

  // Single trip — full-width feature
  if (trips.length === 1) {
    return (
      <div className="max-w-4xl">
        <TripCard trip={trips[0]} index={0} variant="feature" />
      </div>
    );
  }

  // Multiple trips — first is feature, rest are standard cards
  return (
    <div className="space-y-12 sm:space-y-16">
      <TripCard trip={trips[0]} index={0} variant="feature" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {trips.slice(1).map((trip, index) => (
          <TripCard
            key={trip.id}
            trip={trip}
            index={index + 1}
            variant="standard"
          />
        ))}
      </div>
    </div>
  );
}
