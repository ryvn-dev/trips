"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Fragment } from "react";
import { CalendarDays, MapPin, Users, Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Trip } from "@/types/trip";
import { useState } from "react";

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const startOpts: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
  };
  const endOpts: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    year: "numeric",
  };
  return `${s.toLocaleDateString("en-US", startOpts)} – ${e.toLocaleDateString("en-US", endOpts)}`;
}

export function TripHero({ trip }: { trip: Trip }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: trip.title, url });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Cover Image */}
      <div className="relative h-screen lg:h-[420px] overflow-hidden photo-filter">
        <Image
          src={trip.coverImage}
          alt={trip.title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        {/* Gradient + text overlay — hidden on mobile (drawer covers it) */}
        <div className="hidden lg:block absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="hidden lg:block absolute bottom-0 right-0 p-8 pointer-events-none select-none overflow-hidden">
          <span className="text-[9rem] font-bold leading-none text-white/[0.06] whitespace-nowrap">
            {trip.location}
          </span>
        </div>

        <div className="hidden lg:block absolute inset-x-0 bottom-0 p-8">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Tags — editorial slash-separated */}
              <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-white/60">
                {trip.tags.map((tag, i) => (
                  <Fragment key={tag}>
                    {i > 0 && <span>/</span>}
                    <span>{tag}</span>
                  </Fragment>
                ))}
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[0.95]">
                {trip.title}
              </h1>

              <p className="mt-2 max-w-2xl text-base leading-relaxed text-white/80">
                {trip.description}
              </p>

              {/* Meta row */}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/70">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {trip.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4" />
                  {formatDateRange(trip.startDate, trip.endDate)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {trip.travelers.join(", ")}
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Share button — desktop only */}
        <div className="hidden lg:block absolute top-6 right-6">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleShare}
            className="gap-1.5 bg-white/15 text-white backdrop-blur-sm border-0 hover:bg-white/25 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4" />
                Share
              </>
            )}
          </Button>
        </div>
      </div>

    </motion.div>
  );
}
