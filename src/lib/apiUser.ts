import { NextRequest } from "next/server";

export function getUserIdFromRequest(request: NextRequest): string | null {
  const header = request.headers.get("x-user-id");
  if (header && header.trim().length > 0) return header.trim();
  const { searchParams } = new URL(request.url);
  const fromQuery = searchParams.get("userId");
  if (fromQuery && fromQuery.trim().length > 0) return fromQuery.trim();
  return null;
}
