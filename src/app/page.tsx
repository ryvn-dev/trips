import { getAllTrips } from "@/data/trips";
import { TripGrid } from "@/components/trips/trip-grid";

export default function HomePage() {
  const trips = getAllTrips();

  return (
    <main className="paper-texture min-h-[calc(100vh-3.5rem)]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        {/* Editorial masthead */}
        <div className="mb-16 sm:mb-20 flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-ink-muted mb-3">
              A travel journal
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[0.9]">
              Trips
            </h1>
            <div className="mt-4 h-px w-16 bg-vermillion/60" />
            <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-light">
              Curated itineraries, routes, and recommendations from trips around
              the world.
            </p>
          </div>
          <div className="hidden sm:block text-right">
            <span className="text-[8rem] font-mono font-bold leading-none text-ink/[0.05] select-none">
              {String(trips.length).padStart(2, "0")}
            </span>
          </div>
        </div>

        <TripGrid trips={trips} />
      </div>
    </main>
  );
}
