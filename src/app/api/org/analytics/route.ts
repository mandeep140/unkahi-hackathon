import { NextResponse } from "next/server";
import { getAggregateAnalytics } from "@/lib/db";

export async function GET() {
  const analytics = getAggregateAnalytics();
  return NextResponse.json({ analytics });
}
