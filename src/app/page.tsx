import { getAllTrips } from "@/data/trips";
import { TripGrid } from "@/components/trips/trip-grid";

export default function HomePage() {
  const trips = getAllTrips();

  return (
    <main className="paper-texture min-h-[calc(100vh-3.5rem)]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        {/* Hero section */}
        <div className="mb-10 sm:mb-14">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Travel Journal
          </h1>
          <p className="mt-2 max-w-lg text-base leading-relaxed text-ink-light">
            Curated itineraries, routes, and recommendations from trips around
            the world.
          </p>
          <div className="mt-4 h-px w-16 bg-vermillion/60" />
        </div>

        <TripGrid trips={trips} />
      </div>
    </main>
  );
}
