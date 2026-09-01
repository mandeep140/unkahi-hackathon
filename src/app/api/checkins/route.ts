import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/apiUser";
import { addCheckIn, getOrCreateUser, listCheckIns } from "@/lib/db";
import { computeMoodTrend } from "@/lib/signals";

export async function GET(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "missing userId" }, { status: 400 });
  }
  const checkins = listCheckIns(userId);
  const trend = computeMoodTrend(checkins);
  return NextResponse.json({ checkins, trend });
}

export async function POST(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "missing userId" }, { status: 400 });
  }
  const body = await request.json();
  const mood = Number(body.mood);
  if (![1, 2, 3, 4, 5].includes(mood)) {
    return NextResponse.json({ error: "mood must be 1-5" }, { status: 400 });
  }
  getOrCreateUser(userId);
  const entry = addCheckIn(userId, mood as 1 | 2 | 3 | 4 | 5, body.note ?? "");
  return NextResponse.json({ checkin: entry }, { status: 201 });
}
