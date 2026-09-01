import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/apiUser";
import { listAssessmentResponses, listCheckIns, listJournalEntries } from "@/lib/db";
import { buildRecommendations, computeMoodTrend } from "@/lib/signals";

export async function GET(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "missing userId" }, { status: 400 });
  }
  const checkins = listCheckIns(userId);
  const journalEntries = listJournalEntries(userId);
  const assessmentResponses = listAssessmentResponses(userId);

  const { direction } = computeMoodTrend(checkins);
  const latestAssessment = assessmentResponses[0];
  const latestJournal = journalEntries[0];

  const recommendations = buildRecommendations({
    moodDirection: direction,
    band: latestAssessment?.band,
    lastSentiment: latestJournal?.sentiment,
  });

  return NextResponse.json({ recommendations, moodDirection: direction });
}
