"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/client";
import { Card, PageHeader, SectionTitle, EmptyState } from "@/components/ui";
import type { CheckIn, Recommendation } from "@/lib/types";

interface CheckInsResponse {
  checkins: CheckIn[];
  trend: { average: number | null; direction: "up" | "down" | "flat" };
}

interface RecommendationsResponse {
  recommendations: Recommendation[];
  moodDirection: "up" | "down" | "flat";
}

const DIRECTION_LABEL: Record<string, string> = {
  up: "Trending up",
  down: "Trending down",
  flat: "Holding steady",
};

const DIRECTION_ICON: Record<string, string> = {
  up: "↗",
  down: "↘",
  flat: "→",
};

export default function DashboardPage() {
  const [checkinData, setCheckinData] = useState<CheckInsResponse | null>(null);
  const [recData, setRecData] = useState<RecommendationsResponse | null>(null);

  useEffect(() => {
    apiGet<CheckInsResponse>("/api/checkins").then(setCheckinData);
    apiGet<RecommendationsResponse>("/api/recommendations").then(setRecData);
  }, []);

  const recentCheckins = checkinData?.checkins.slice(-7).reverse() ?? [];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="A quiet look at your week"
        description="Nothing urgent here, just a gentle overview of how things have been."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <SectionTitle>This week, generally</SectionTitle>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-semibold">
              {checkinData?.trend.average ?? "—"}
            </p>
            {checkinData && (
              <span className="text-lg text-accent" aria-hidden>
                {DIRECTION_ICON[checkinData.trend.direction]}
              </span>
            )}
          </div>
          <p className="text-[14px] text-muted mt-1">
            {checkinData
              ? DIRECTION_LABEL[checkinData.trend.direction]
              : "Loading..."}
          </p>
        </Card>

        <Card className="flex flex-col">
          <SectionTitle>How are you right now?</SectionTitle>
          <p className="text-[14px] text-muted mb-3 flex-1 leading-relaxed">
            Takes a few seconds, whenever you&apos;re ready.
          </p>
          <Link
            href="/checkin"
            className="text-[14px] font-medium text-accent-strong underline underline-offset-4 w-fit"
          >
            Check in now
          </Link>
        </Card>
      </div>

      <div>
        <SectionTitle>Something that might help</SectionTitle>
        {!recData ? (
          <p className="text-[14px] text-muted">Loading...</p>
        ) : recData.recommendations.length === 0 ? (
          <EmptyState title="Nothing specific to suggest right now, and that's okay." />
        ) : (
          <div className="flex flex-col gap-3">
            {recData.recommendations.map((rec) => (
              <Card key={rec.id}>
                <p className="text-[15px] font-medium mb-1">{rec.title}</p>
                <p className="text-[14px] text-muted leading-relaxed">{rec.description}</p>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <SectionTitle>Recent check-ins</SectionTitle>
        {recentCheckins.length === 0 ? (
          <EmptyState title="No check-ins yet, no pressure to start now either." />
        ) : (
          <div className="flex flex-col gap-2">
            {recentCheckins.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between text-[14px] bg-surface border border-border rounded-2xl px-4 py-3"
              >
                <span className="text-muted">
                  {new Date(c.createdAt).toLocaleString()}
                </span>
                <span className="font-medium text-accent-strong">
                  {c.mood}/5
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-3 text-[14px]">
        <Link
          href="/journal"
          className="card-surface px-4 py-3.5 text-center font-medium hover:border-accent hover:text-accent-strong transition-colors"
        >
          Journal
        </Link>
        <Link
          href="/assessment"
          className="card-surface px-4 py-3.5 text-center font-medium hover:border-accent hover:text-accent-strong transition-colors"
        >
          Check-in
        </Link>
        <Link
          href="/org"
          className="card-surface px-4 py-3.5 text-center font-medium hover:border-accent hover:text-accent-strong transition-colors"
        >
          Organization view
        </Link>
      </div>
    </div>
  );
}
