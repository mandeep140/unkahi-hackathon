import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/apiUser";
import { listAssessmentResponses, listCheckIns } from "@/lib/db";
import { buildRecommendations, computeMoodTrend } from "@/lib/signals";

export async function GET(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "missing userId" }, { status: 400 });
  }
  const checkins = listCheckIns(userId);
  const assessmentResponses = listAssessmentResponses(userId);

  const { direction } = computeMoodTrend(checkins);
  const latestAssessment = assessmentResponses[0];

  const recommendations = buildRecommendations({
    moodDirection: direction,
    band: latestAssessment?.band,
  });

  return NextResponse.json({ recommendations, moodDirection: direction });
}
