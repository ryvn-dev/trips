"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  Clock,
  MapPin,
  ExternalLink,
  Lightbulb,
  DollarSign,
} from "lucide-react";
import { CATEGORY_CONFIG, type Activity } from "@/types/trip";

export function ActivityCard({
  activity,
  index,
  isActive,
  onHover,
  onClick,
}: {
  activity: Activity;
  index: number;
  isActive: boolean;
  onHover: (id: string | null) => void;
  onClick: (activity: Activity) => void;
}) {
  const config = CATEGORY_CONFIG[activity.category];

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
      className="group relative flex gap-3 sm:gap-4"
      onMouseEnter={() => onHover(activity.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(activity)}
    >
      {/* Timeline dot */}
      <div className="relative z-10 flex flex-col items-center pt-1">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm transition-all duration-200 ${
            isActive
              ? `${config.bgColor} scale-110 shadow-sm`
              : "border-border bg-card hover:scale-105"
          }`}
        >
          {config.emoji}
        </div>
      </div>

      {/* Content */}
      <div
        className={`flex-1 cursor-pointer rounded-lg border p-3 sm:p-4 transition-all duration-200 ${
          isActive
            ? "border-sand bg-paper shadow-sm"
            : "border-transparent hover:border-border hover:bg-card"
        }`}
      >
        {/* Time + Category */}
        <div className="flex items-center gap-2 text-xs text-ink-muted">
          <Clock className="h-3 w-3" />
          <span className="font-mono">{activity.time}</span>
          {activity.duration && (
            <>
              <span className="text-border">·</span>
              <span>{activity.duration}</span>
            </>
          )}
          <span className={`ml-auto text-xs ${config.color}`}>
            {config.label}
          </span>
        </div>

        {/* Title */}
        <h4 className="mt-1.5 text-base font-semibold tracking-tight leading-snug">
          {activity.title}
        </h4>

        {/* Location */}
        <div className="mt-1 flex items-center gap-1 text-xs text-ink-muted">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{activity.location}</span>
          {activity.coordinates && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${activity.coordinates.lat},${activity.coordinates.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="ml-1 text-indigo hover:underline"
            >
              <ExternalLink className="inline h-3 w-3" />
            </a>
          )}
        </div>

        {/* Description */}
        {activity.description && (
          <p className="mt-2 text-sm leading-relaxed text-ink-light">
            {activity.description}
          </p>
        )}

        {/* Image */}
        {activity.image && (
          <div className="mt-3 relative aspect-[16/9] overflow-hidden rounded-md photo-filter">
            <Image
              src={activity.image}
              alt={activity.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        )}

        {/* Cost + Tips row */}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {activity.cost && (
            <span className="flex items-center gap-1 text-xs text-ink-muted">
              <DollarSign className="h-3 w-3" />
              {activity.cost}
            </span>
          )}
        </div>

        {/* Tips */}
        {activity.tips && (
          <div className="mt-2 flex gap-2 rounded-md bg-sakura/15 border border-sakura/30 px-3 py-2 text-xs text-ink-light">
            <Lightbulb className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{activity.tips}</span>
          </div>
        )}

        {/* Links */}
        {activity.links && activity.links.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {activity.links.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 rounded-md bg-indigo/10 px-2 py-1 text-xs text-indigo transition-colors hover:bg-indigo/20"
              >
                <ExternalLink className="h-3 w-3" />
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
