import type { Activity, RouteGroup } from "@/types/trip";
import { ROUTE_GROUP_COLORS } from "@/types/trip";

export function filterActivitiesByRoute(
  activities: Activity[],
  activeRoutes: Set<string>,
): Activity[] {
  return activities.filter((a) => {
    if (!a.routeGroup) return activeRoutes.has("shared");
    return activeRoutes.has(a.routeGroup);
  });
}

export function isSharedActivity(activity: Activity): boolean {
  return !activity.routeGroup;
}

export function getRouteGroupColors(color: string) {
  return ROUTE_GROUP_COLORS[color] ?? ROUTE_GROUP_COLORS.rose;
}

export function buildDefaultActiveRoutes(
  routeGroups?: RouteGroup[],
): Set<string> {
  const all = new Set<string>(["shared"]);
  routeGroups?.forEach((rg) => all.add(rg.id));
  return all;
}
