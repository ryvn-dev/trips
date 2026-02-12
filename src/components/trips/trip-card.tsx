"use client";

import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarDays, Users } from "lucide-react";
import type { TripSummary } from "@/types/trip";

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const startStr = s.toLocaleDateString("en-US", opts);
  const endStr = e.toLocaleDateString("en-US", { ...opts, year: "numeric" });
  return `${startStr} – ${endStr}`;
}

export function TripCard({
  trip,
  index,
  variant = "standard",
}: {
  trip: TripSummary;
  index: number;
  variant?: "feature" | "standard" | "compact";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: index * 0.15,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      <Link href={`/trips/${trip.id}`} className="group block">
        {variant === "feature" ? (
          <FeatureCard trip={trip} index={index} />
        ) : variant === "compact" ? (
          <CompactCard trip={trip} />
        ) : (
          <StandardCard trip={trip} index={index} />
        )}
      </Link>
    </motion.div>
  );
}

function FeatureCard({
  trip,
  index,
}: {
  trip: TripSummary;
  index: number;
}) {
  return (
    <article className="relative overflow-hidden">
      {/* Ghost number */}
      <span className="absolute -top-6 -left-3 text-[8rem] font-mono font-bold leading-none text-ink/[0.04] select-none pointer-events-none z-10">
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Horizontal layout on desktop */}
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
        {/* Image */}
        <div className="relative sm:w-[55%] aspect-[4/5] sm:aspect-[3/4] overflow-hidden photo-filter">
          <Image
            src={trip.coverImage}
            alt={trip.title}
            fill
            priority
            className="object-cover transition-transform duration-500 group-hover:scale-[1.01]"
            sizes="(max-width: 640px) 100vw, 55vw"
          />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center py-2 sm:py-8">
          {/* Tags */}
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-ink-muted">
            {trip.tags.map((tag, i) => (
              <Fragment key={tag}>
                {i > 0 && <span className="text-sand">/</span>}
                <span>{tag}</span>
              </Fragment>
            ))}
          </div>

          <h3 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight group-hover:text-ink transition-colors leading-tight">
            {trip.title}
          </h3>
          <div className="mt-3 h-px w-12 bg-vermillion/50" />

          <p className="mt-4 text-sm leading-relaxed text-ink-light line-clamp-3">
            {trip.description}
          </p>

          {/* Meta */}
          <div className="mt-4 flex items-center gap-4 text-xs text-ink-muted">
            <span className="flex items-center gap-1 font-mono tracking-wider">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDateRange(trip.startDate, trip.endDate)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {trip.travelers.join(", ")}
            </span>
          </div>

          {/* Day count stamp */}
          <div className="mt-6 flex h-14 w-14 items-center justify-center rounded-full border-2 border-vermillion/30 rotate-[-8deg]">
            <div className="text-center leading-none">
              <span className="block text-lg font-bold text-vermillion">
                {trip.totalDays}
              </span>
              <span className="block text-[7px] uppercase tracking-wider text-vermillion/70">
                days
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function StandardCard({
  trip,
  index,
}: {
  trip: TripSummary;
  index: number;
}) {
  return (
    <article className="relative overflow-hidden transition-all duration-300 group-hover:-translate-y-0.5">
      {/* Ghost number */}
      <span className="absolute -top-2 -left-1 text-[5rem] font-mono font-bold leading-none text-ink/[0.04] select-none pointer-events-none z-10">
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Image — portrait aspect */}
      <div className="relative aspect-[3/4] overflow-hidden photo-filter">
        <Image
          src={trip.coverImage}
          alt={trip.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.01]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Day stamp */}
        <div className="absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/40 rotate-[-8deg]">
          <div className="text-center leading-none">
            <span className="block text-base font-bold text-white">
              {trip.totalDays}
            </span>
            <span className="block text-[6px] uppercase tracking-wider text-white/70">
              days
            </span>
          </div>
        </div>

        {/* Bottom overlay content */}
        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-white/60 mb-2">
            {trip.tags.slice(0, 3).map((tag, i) => (
              <Fragment key={tag}>
                {i > 0 && <span>/</span>}
                <span>{tag}</span>
              </Fragment>
            ))}
          </div>
          <h3 className="text-lg font-semibold tracking-tight text-white leading-tight">
            {trip.title}
          </h3>
          <p className="mt-1 text-xs text-white/70 font-mono tracking-wider">
            {formatDateRange(trip.startDate, trip.endDate)}
          </p>
        </div>
      </div>
    </article>
  );
}

function CompactCard({ trip }: { trip: TripSummary }) {
  return (
    <article className="flex gap-4 items-center py-3 transition-all duration-200 group-hover:translate-x-1">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-sm photo-filter">
        <Image
          src={trip.coverImage}
          alt={trip.title}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold tracking-tight truncate group-hover:text-ink transition-colors">
          {trip.title}
        </h3>
        <p className="text-[10px] uppercase tracking-wider text-ink-muted mt-0.5">
          {trip.location}
        </p>
      </div>
    </article>
  );
}
