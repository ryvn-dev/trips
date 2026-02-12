import type { Trip } from "@/types/trip";

export function TripStats({ trip }: { trip: Trip }) {
  const totalActivities = trip.days.reduce(
    (sum, day) => sum + day.activities.length,
    0,
  );
  const foodCount = trip.days.reduce(
    (sum, day) =>
      sum + day.activities.filter((a) => a.category === "food").length,
    0,
  );
  const sightCount = trip.days.reduce(
    (sum, day) =>
      sum + day.activities.filter((a) => a.category === "sight").length,
    0,
  );

  const stats = [
    { value: trip.days.length, label: trip.days.length === 1 ? "Day" : "Days" },
    { value: totalActivities, label: "Stops" },
    { value: foodCount, label: "Eats" },
    { value: sightCount, label: "Sights" },
  ];

  return (
    <div className="grid grid-cols-4 divide-x divide-border">
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col items-center py-5">
          <span className="text-2xl sm:text-3xl font-mono font-bold tabular-nums leading-none">
            {stat.value}
          </span>
          <span className="mt-1.5 text-[10px] uppercase tracking-[0.25em] text-ink-muted">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
}
