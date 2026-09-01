import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/apiUser";
import { getOrCreateUser, updateUser } from "@/lib/db";

export async function GET(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "missing userId" }, { status: 400 });
  }
  const user = getOrCreateUser(userId);
  return NextResponse.json({ user });
}

export async function PATCH(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "missing userId" }, { status: 400 });
  }
  const body = await request.json();
  getOrCreateUser(userId);
  const user = updateUser(userId, {
    name: body.name,
    language: body.language,
    baselineComplete: body.baselineComplete,
  });
  return NextResponse.json({ user });
}
