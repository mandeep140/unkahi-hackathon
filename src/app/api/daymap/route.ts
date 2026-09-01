import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/apiUser";
import { addDayMapSubmission, getOrCreateUser } from "@/lib/db";

export async function POST(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "missing userId" }, { status: 400 });
  }
  const body = await request.json();
  const pattern = String(body.pattern ?? "");
  const loadPercent = Number(body.loadPercent);
  if (!pattern || Number.isNaN(loadPercent)) {
    return NextResponse.json({ error: "pattern and loadPercent are required" }, { status: 400 });
  }
  getOrCreateUser(userId);
  const submission = addDayMapSubmission(userId, pattern, loadPercent);
  return NextResponse.json({ submission }, { status: 201 });
}
