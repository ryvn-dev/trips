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

  // Multiple trips — asymmetric grid
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
      {trips.map((trip, index) => {
        const variant =
          index === 0 ? "feature" : index <= 2 ? "standard" : "compact";
        const colSpan =
          index === 0
            ? "lg:col-span-7 lg:row-span-2"
            : index <= 2
              ? "lg:col-span-5"
              : "lg:col-span-4";
        return (
          <div key={trip.id} className={colSpan}>
            <TripCard trip={trip} index={index} variant={variant} />
          </div>
        );
      })}
    </div>
  );
}
