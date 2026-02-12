"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { MapPin, ExternalLink } from "lucide-react";
import {
  CATEGORY_CONFIG,
  ROUTE_GROUP_COLORS,
  type Activity,
  type RouteGroup,
} from "@/types/trip";

export function ActivityCard({
  activity,
  index,
  isActive,
  onHover,
  onClick,
  routeGroup,
}: {
  activity: Activity;
  index: number;
  isActive: boolean;
  onHover: (id: string | null) => void;
  onClick: (activity: Activity) => void;
  routeGroup?: RouteGroup;
}) {
  const config = CATEGORY_CONFIG[activity.category];
  const routeColors = routeGroup
    ? (ROUTE_GROUP_COLORS[routeGroup.color] ?? ROUTE_GROUP_COLORS.rose)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: "easeOut" }}
      className="group relative flex gap-3 sm:gap-4"
      onMouseEnter={() => onHover(activity.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(activity)}
    >
      {/* Timeline dot */}
      <div className="relative z-10 flex flex-col items-center pt-1.5">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm transition-all duration-200 ${
            isActive
              ? "bg-paper-dark border border-sand scale-110"
              : "bg-card border border-border hover:border-sand"
          }`}
        >
          {config.emoji}
        </div>
      </div>

      {/* Content */}
      <div
        className={`flex-1 cursor-pointer border-l py-3 pl-4 pr-2 sm:py-4 transition-all duration-200 ${
          isActive
            ? "border-l-vermillion/40 bg-paper-dark/40"
            : "border-l-transparent hover:border-l-sand/60 hover:bg-paper-dark/20"
        }`}
      >
        {/* Time + Category + Route badge */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[13px] font-medium tabular-nums text-ink">
            {activity.time}
          </span>
          {activity.duration && (
            <>
              <span className="text-sand">·</span>
              <span className="text-[10px] uppercase tracking-wider text-ink-muted">
                {activity.duration}
              </span>
            </>
          )}
          {routeGroup && routeColors && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${routeColors.bg} ${routeColors.text} border ${routeColors.border}`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${routeColors.dot}`}
              />
              {routeGroup.name}
            </span>
          )}
          <span className="ml-auto text-[10px] uppercase tracking-[0.15em] text-ink-muted">
            {config.label}
          </span>
        </div>

        {/* Title */}
        <h4 className="mt-1.5 text-[15px] sm:text-base font-semibold tracking-tight leading-snug text-ink">
          {activity.title}
        </h4>

        {/* Location */}
        <div className="mt-1 flex items-center gap-1 text-xs text-ink-muted">
          <MapPin className="h-3 w-3 shrink-0 opacity-60" />
          <span className="truncate">{activity.location}</span>
        </div>

        {/* Description */}
        {activity.description && (
          <p className="mt-2 text-[13px] leading-relaxed text-ink-light">
            {activity.description}
          </p>
        )}

        {/* Image */}
        {activity.image && (
          <div className="mt-3 relative aspect-[16/9] overflow-hidden rounded-sm photo-filter">
            <Image
              src={activity.image}
              alt={activity.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        )}

        {/* Cost */}
        {activity.cost && (
          <p className="mt-2 text-xs text-ink-muted">
            {activity.cost}
          </p>
        )}

        {/* Tips — pull-quote */}
        {activity.tips && (
          <div className="mt-3 border-l border-sand/60 pl-3 py-0.5">
            <p className="text-xs italic leading-relaxed text-ink-muted">
              {activity.tips}
            </p>
          </div>
        )}

        {/* Links */}
        {activity.links && activity.links.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            {activity.links.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-xs text-ink-muted underline decoration-sand/60 underline-offset-2 transition-colors hover:text-ink hover:decoration-ink/30"
              >
                <ExternalLink className="h-3 w-3 opacity-50" />
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
