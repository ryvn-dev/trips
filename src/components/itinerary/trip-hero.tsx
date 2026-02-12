"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, Users, Share2, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
      <div className="relative h-[280px] sm:h-[380px] lg:h-[420px] overflow-hidden photo-filter">
        <Image
          src={trip.coverImage}
          alt={trip.title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Content overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-8">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Tags */}
              <div className="mb-3 flex flex-wrap gap-1.5">
                {trip.tags.map((tag) => (
                  <Badge
                    key={tag}
                    className="border-0 bg-white/15 text-white/90 backdrop-blur-sm text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {trip.title}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
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

        {/* Share button */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
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
