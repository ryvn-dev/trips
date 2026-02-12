"use client";

import { APIProvider } from "@vis.gl/react-google-maps";

export function MapProvider({ children }: { children: React.ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-paper-dark text-sm text-ink-muted p-4 text-center">
        <div>
          <p className="font-medium">Map unavailable</p>
          <p className="mt-1 text-xs">
            Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable the map.
          </p>
        </div>
      </div>
    );
  }

  return <APIProvider apiKey={apiKey}>{children}</APIProvider>;
}
