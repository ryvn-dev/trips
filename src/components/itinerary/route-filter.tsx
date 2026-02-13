"use client";

import { ROUTE_GROUP_COLORS, type RouteGroup } from "@/types/trip";
import { Users } from "lucide-react";

export function RouteFilter({
  routeGroups,
  activeRoutes,
  onToggleRoute,
}: {
  routeGroups: RouteGroup[];
  activeRoutes: Set<string>;
  onToggleRoute: (routeId: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none px-4 sm:px-6 py-3">
      <FilterPill
        active={activeRoutes.has("shared")}
        onClick={() => onToggleRoute("shared")}
        dotClass="bg-foreground/40"
        label="Everyone"
        icon={<Users className="h-3 w-3" />}
      />
      {routeGroups.map((group) => {
        const colors = ROUTE_GROUP_COLORS[group.color] ?? ROUTE_GROUP_COLORS.rose;
        return (
          <FilterPill
            key={group.id}
            active={activeRoutes.has(group.id)}
            onClick={() => onToggleRoute(group.id)}
            dotClass={colors.dot}
            label={group.name}
          />
        );
      })}
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  dotClass,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  dotClass: string;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all cursor-pointer ${
        active
          ? "border-foreground/20 bg-card text-foreground shadow-sm"
          : "border-transparent text-ink-muted hover:text-foreground hover:bg-card/50"
      }`}
    >
      {icon ?? <span className={`h-2 w-2 rounded-full ${dotClass}`} />}
      {label}
    </button>
  );
}
