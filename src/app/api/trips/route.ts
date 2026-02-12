import { NextResponse } from "next/server";
import { getAllTrips } from "@/data/trips";

export async function GET() {
  return NextResponse.json(getAllTrips());
}
