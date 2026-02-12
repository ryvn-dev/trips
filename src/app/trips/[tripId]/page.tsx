import { notFound } from "next/navigation";
import { getTripById, getAllTripIds } from "@/data/trips";
import { TripDetailClient } from "./trip-detail-client";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return getAllTripIds().map((id) => ({ tripId: id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string }>;
}): Promise<Metadata> {
  const { tripId } = await params;
  const trip = getTripById(tripId);
  if (!trip) return { title: "Trip Not Found" };

  return {
    title: `${trip.title} — Trips`,
    description: trip.description,
    openGraph: {
      title: trip.title,
      description: trip.description,
      images: [{ url: trip.coverImage, width: 1200, height: 630 }],
    },
  };
}

export default async function TripPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const trip = getTripById(tripId);

  if (!trip) {
    notFound();
  }

  return <TripDetailClient trip={trip} />;
}
