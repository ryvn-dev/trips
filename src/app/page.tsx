import { getAllTrips } from "@/data/trips";
import { TripGrid } from "@/components/trips/trip-grid";

export default function HomePage() {
  const trips = getAllTrips();

  return (
    <main className="paper-texture min-h-[calc(100vh-3.5rem)]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        {/* Editorial masthead */}
        <div className="mb-12 sm:mb-16">
          <p className="text-[10px] uppercase tracking-[0.4em] text-ink-muted mb-3">
            A travel journal
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[0.9]">
            Ryvn&apos;s Trips
          </h1>
          <div className="mt-4 h-px w-16 bg-vermillion/60" />
          <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-light">
            Curated itineraries, routes, and recommendations from trips around
            the world.
          </p>
        </div>

        <TripGrid trips={trips} />
      </div>
    </main>
  );
}
