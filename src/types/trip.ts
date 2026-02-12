export type ActivityCategory =
  | "food"
  | "sight"
  | "transport"
  | "hotel"
  | "shopping"
  | "activity"
  | "note";

export interface Activity {
  id: string;
  time: string;
  title: string;
  description?: string;
  location: string;
  address?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  category: ActivityCategory;
  cost?: string;
  duration?: string;
  tips?: string;
  links?: { label: string; url: string }[];
  image?: string;
  routeGroup?: string;
}

export interface RouteGroup {
  id: string;
  name: string;
  color: string;
  travelers: string[];
}

export interface TripDay {
  date: string;
  title: string;
  activities: Activity[];
}

export interface Trip {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  location: string;
  tags: string[];
  travelers: string[];
  days: TripDay[];
  themeColor?: string;
  routeGroups?: RouteGroup[];
}

export type TripSummary = Omit<Trip, "days"> & {
  totalDays: number;
  totalActivities: number;
};

// Unified palette — all categories use muted sakura tones.
// Emoji provides visual differentiation; color is restrained.
export const CATEGORY_CONFIG: Record<
  ActivityCategory,
  { emoji: string; label: string }
> = {
  food: { emoji: "🍜", label: "Food" },
  sight: { emoji: "📸", label: "Sight" },
  transport: { emoji: "🚃", label: "Transport" },
  hotel: { emoji: "🏨", label: "Stay" },
  shopping: { emoji: "🛍️", label: "Shopping" },
  activity: { emoji: "🎯", label: "Activity" },
  note: { emoji: "📝", label: "Note" },
};

// Muted, desaturated palette matching the Leica/sakura aesthetic
export const ROUTE_GROUP_COLORS: Record<
  string,
  { text: string; bg: string; border: string; dot: string; mapColor: string }
> = {
  rose: {
    text: "text-[#a0636e]",
    bg: "bg-[#f5ece8]",
    border: "border-[#dcc5be]",
    dot: "bg-[#b87a7a]",
    mapColor: "#b87a7a",
  },
  sky: {
    text: "text-[#5a7a8a]",
    bg: "bg-[#edf1f3]",
    border: "border-[#c4d1d8]",
    dot: "bg-[#7a9aaa]",
    mapColor: "#7a9aaa",
  },
  amber: {
    text: "text-[#8a7a5a]",
    bg: "bg-[#f3f0e8]",
    border: "border-[#d8d0b8]",
    dot: "bg-[#b0a07a]",
    mapColor: "#b0a07a",
  },
  violet: {
    text: "text-[#7a6a8a]",
    bg: "bg-[#f0ecf3]",
    border: "border-[#cec4d8]",
    dot: "bg-[#9a8aaa]",
    mapColor: "#9a8aaa",
  },
  teal: {
    text: "text-[#5a7a6e]",
    bg: "bg-[#ecf1ee]",
    border: "border-[#bcd0c8]",
    dot: "bg-[#7aaa98]",
    mapColor: "#7aaa98",
  },
};
