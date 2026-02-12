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
}

export type TripSummary = Omit<Trip, "days"> & {
  totalDays: number;
  totalActivities: number;
};

export const CATEGORY_CONFIG: Record<
  ActivityCategory,
  { emoji: string; label: string; color: string; bgColor: string }
> = {
  food: {
    emoji: "🍜",
    label: "Food",
    color: "text-orange-600",
    bgColor: "bg-orange-50 border-orange-200",
  },
  sight: {
    emoji: "📸",
    label: "Sight",
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-200",
  },
  transport: {
    emoji: "🚃",
    label: "Transport",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 border-emerald-200",
  },
  hotel: {
    emoji: "🏨",
    label: "Stay",
    color: "text-violet-600",
    bgColor: "bg-violet-50 border-violet-200",
  },
  shopping: {
    emoji: "🛍️",
    label: "Shopping",
    color: "text-pink-600",
    bgColor: "bg-pink-50 border-pink-200",
  },
  activity: {
    emoji: "🎯",
    label: "Activity",
    color: "text-amber-600",
    bgColor: "bg-amber-50 border-amber-200",
  },
  note: {
    emoji: "📝",
    label: "Note",
    color: "text-slate-600",
    bgColor: "bg-slate-50 border-slate-200",
  },
};
