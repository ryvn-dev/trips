# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

```bash
pnpm dev              # Start dev server (use -p 3001 if port 3000 is taken)
pnpm build            # Production build (also validates TypeScript)
pnpm lint             # Run ESLint
```

No test framework is configured.

## Architecture

**Personal travel itinerary web app** — static JSON data, no database, no auth. Deployed on Vercel. Users create trip itineraries as JSON files and share URLs with friends.

### Tech Stack
- Next.js 16 (App Router) with React 19, TypeScript
- Tailwind CSS v4 with shadcn/ui (new-york style)
- Framer Motion for animations
- @vis.gl/react-google-maps + native Google Maps JS API for maps
- pnpm package manager

### Data Flow
Trip data lives as static JSON files in `src/data/trips/`. The data access layer (`src/data/trips/index.ts`) exports `getAllTrips()`, `getTripById()`, and `getAllTripIds()`. Trip detail pages use SSG via `generateStaticParams()`.

To add a new trip: create a JSON file in `src/data/trips/`, import it in `index.ts`, and add it to the `trips` array.

### Key Layouts
- **Home page** (`/`): TripGrid showing TripCard components
- **Trip detail** (`/trips/[tripId]`): Split layout — timeline (60%) left, sticky Google Map (40%) right on desktop. On mobile, full-width timeline with floating map FAB and fullscreen overlay.
- State coordination between timeline and map happens in `trip-detail-client.tsx` via `activeActivityId`

### Component Organization
- `src/components/ui/` — shadcn/ui primitives (badge, button, card, etc.)
- `src/components/layout/` — header
- `src/components/trips/` — home page (trip-card, trip-grid)
- `src/components/itinerary/` — trip detail (timeline-view, day-section, activity-card, trip-hero, trip-stats)
- `src/components/map/` — Google Maps (map-panel with markers/polylines, map-provider with API key fallback)

### Map Implementation
`map-panel.tsx` uses `@vis.gl/react-google-maps` for AdvancedMarkers and InfoWindows. Route polylines are drawn using the native `google.maps.Polyline` API via `useMap()` hook (the React library lacks a 2D Polyline component). Each day gets a distinct color from `DAY_COLORS`.

## Styling

**Sakura (Japanese magazine) aesthetic** — soft rose/pink palette, paper texture, Leica-style photo filter.

Custom color tokens defined in `globals.css` under `@theme inline`:
- `paper`, `paper-dark` — backgrounds
- `ink`, `ink-light`, `ink-muted` — text hierarchy
- `vermillion` — primary accent (deep rose)
- `sakura` — light pink accent
- `sand`, `indigo`, `moss` — secondary accents

Custom CSS classes: `.photo-filter` (Leica desaturation + warm overlay on all images), `.paper-texture` (SVG noise), `.timeline-line` (gradient connector).

Activity categories use standard Tailwind colors (orange, blue, emerald, etc.) defined in `CATEGORY_CONFIG` in `src/types/trip.ts` — keep these distinct from the theme palette.

## Environment Variables

- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — Google Maps API key. Map gracefully falls back to "unavailable" message without it.

## Git

- **Never** add `Co-Authored-By` trailers to commit messages

## Conventions

- All UI text is **English** (not Chinese/Japanese despite the Japanese aesthetic)
- File names: kebab-case. Components: PascalCase. Constants: UPPER_SNAKE_CASE.
- All interactive components use `"use client"` directive
- Images use Unsplash URLs with `w=800&q=80` params; `images.unsplash.com` is configured in `next.config.ts` remote patterns
- Activity coordinates should come from verified Google Maps data, not guessed
