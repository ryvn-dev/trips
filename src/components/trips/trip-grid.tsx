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

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {trips.map((trip, index) => (
        <TripCard key={trip.id} trip={trip} index={index} />
      ))}
    </div>
  );
}
