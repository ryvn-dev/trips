import type { Trip, TripSummary } from "@/types/trip";

import tokyoTrip from "./tokyo-2026-summer.json";
import kyotoTrip from "./kyoto-weekend.json";
import sriLankaTrip from "./sri-lanka-2026.json";

const trips: Trip[] = [tokyoTrip, kyotoTrip, sriLankaTrip] as Trip[];

export function getAllTrips(): TripSummary[] {
  return trips
    .map((trip) => {
      const { days, ...rest } = trip;
      return {
        ...rest,
        totalDays: days.length,
        totalActivities: days.reduce((sum, day) => sum + day.activities.length, 0),
      };
    })
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
}

export function getTripById(id: string): Trip | undefined {
  return trips.find((trip) => trip.id === id);
}

export function getAllTripIds(): string[] {
  return trips.map((trip) => trip.id);
}
