import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/apiUser";
import { addAssessmentResponse, getOrCreateUser, listAssessmentResponses } from "@/lib/db";
import { assessments, scoreAssessment } from "@/lib/assessment";

export async function GET(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "missing userId" }, { status: 400 });
  }
  const responses = listAssessmentResponses(userId);
  return NextResponse.json({
    definitions: Object.values(assessments),
    responses,
  });
}

export async function POST(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "missing userId" }, { status: 400 });
  }
  const body = await request.json();
  const assessmentId = String(body.assessmentId ?? "");
  const definition = assessments[assessmentId];
  if (!definition) {
    return NextResponse.json({ error: "unknown assessment" }, { status: 400 });
  }
  const answers = body.answers as Record<string, number>;
  if (!answers || typeof answers !== "object") {
    return NextResponse.json({ error: "answers are required" }, { status: 400 });
  }
  getOrCreateUser(userId);
  const { score, band, summary } = scoreAssessment(definition, answers);
  const response = addAssessmentResponse(userId, assessmentId, answers, score, band);
  return NextResponse.json({ response, summary }, { status: 201 });
}
