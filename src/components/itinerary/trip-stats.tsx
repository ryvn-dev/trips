import { CalendarDays, MapPin, Utensils, Camera } from "lucide-react";
import type { Trip } from "@/types/trip";

export function TripStats({ trip }: { trip: Trip }) {
  const totalActivities = trip.days.reduce(
    (sum, day) => sum + day.activities.length,
    0
  );
  const foodCount = trip.days.reduce(
    (sum, day) =>
      sum + day.activities.filter((a) => a.category === "food").length,
    0
  );
  const sightCount = trip.days.reduce(
    (sum, day) =>
      sum + day.activities.filter((a) => a.category === "sight").length,
    0
  );

  const stats = [
    {
      icon: CalendarDays,
      value: trip.days.length,
      label: trip.days.length === 1 ? "Day" : "Days",
    },
    { icon: MapPin, value: totalActivities, label: "Stops" },
    { icon: Utensils, value: foodCount, label: "Eats" },
    { icon: Camera, value: sightCount, label: "Sights" },
  ];

  return (
    <div className="grid grid-cols-4 divide-x divide-border">
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col items-center py-4">
          <stat.icon className="h-4 w-4 text-ink-muted mb-1" />
          <span className="text-xl font-bold tabular-nums">{stat.value}</span>
          <span className="text-xs text-ink-muted">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}
