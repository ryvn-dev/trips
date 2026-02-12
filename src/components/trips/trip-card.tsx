"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
}: {
  trip: TripSummary;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
    >
      <Link href={`/trips/${trip.id}`} className="group block">
        <article className="overflow-hidden rounded-lg border border-border/60 bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
          {/* Cover Image */}
          <div className="relative aspect-[4/3] overflow-hidden photo-filter">
            <Image
              src={trip.coverImage}
              alt={trip.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            {/* Location badge */}
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white/90">
              <MapPin className="h-3.5 w-3.5" />
              <span className="text-sm font-medium">{trip.location}</span>
            </div>

            {/* Day count */}
            <div className="absolute top-3 right-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-ink backdrop-blur-sm">
              {trip.totalDays} {trip.totalDays === 1 ? "day" : "days"}
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="text-lg font-semibold tracking-tight group-hover:text-vermillion transition-colors">
              {trip.title}
            </h3>

            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-light">
              {trip.description}
            </p>

            {/* Meta */}
            <div className="mt-3 flex items-center gap-4 text-xs text-ink-muted">
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                {formatDateRange(trip.startDate, trip.endDate)}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {trip.travelers.length}
              </span>
            </div>

            {/* Tags */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {trip.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs font-normal bg-paper-dark text-ink-light border-0"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
