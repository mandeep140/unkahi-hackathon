"use client";

import { useEffect, useState } from "react";
import { Card, PageHeader, SectionTitle, Skeleton } from "@/components/ui";

interface Analytics {
  totalParticipants: number;
  activeParticipants: number;
  checkinCount: number;
  journalCount: number;
  assessmentCount: number;
  avgMood: number;
  bandCounts: Record<string, number>;
  patternCounts: Record<string, number>;
  avgLoad: number;
  dayMapCount: number;
  trend: { date: string; checkins: number; journalEntries: number }[];
}

export default function OrgPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    fetch("/api/org/analytics")
      .then((res) => res.json())
      .then((data) => setAnalytics(data.analytics));
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="SUPER ADMIN PAGE!!" // development ke liye unprotected hai. right now db is not connected for cloud syncing of this data. This is a hackathon prototype.
        title="A group overview"
        description="Only general patterns across everyone, never a single person's words or answers. This view is for programs and cohorts, not individuals."
      />

      {!analytics ? (
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Card key={i}>
                <Skeleton className="h-3 w-24 mb-3" />
                <Skeleton className="h-8 w-16" />
              </Card>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[0, 1].map((i) => (
              <Card key={i} className="flex flex-col gap-2.5">
                <Skeleton className="h-3 w-28 mb-1" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3 page-transition">
            <Card>
              <SectionTitle>Active this week</SectionTitle>
              <p className="text-3xl font-semibold">
                {analytics.activeParticipants}
                <span className="text-[14px] font-normal text-muted"> / {analytics.totalParticipants}</span>
              </p>
            </Card>
            <Card>
              <SectionTitle>Average load, group-wide</SectionTitle>
              <p className="text-3xl font-semibold">{analytics.avgLoad}%</p>
            </Card>
            <Card>
              <SectionTitle>Check-ins completed</SectionTitle>
              <p className="text-3xl font-semibold">{analytics.dayMapCount}</p>
            </Card>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <SectionTitle>Engagement</SectionTitle>
              <div className="text-[14px] flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <span className="text-muted">Check-ins</span>
                  <span>{analytics.checkinCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Journal entries</span>
                  <span>{analytics.journalCount}</span>
                </div>
              </div>
            </Card>

            <Card>
              <SectionTitle>Common patterns</SectionTitle>
              <div className="text-[14px] flex flex-col gap-1.5">
                {Object.entries(analytics.patternCounts).length === 0 ? (
                  <span className="text-muted">No data yet</span>
                ) : (
                  Object.entries(analytics.patternCounts).map(([pattern, count]) => (
                    <div key={pattern} className="flex justify-between">
                      <span className="text-muted capitalize">{pattern}</span>
                      <span>{count}</span>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          <Card>
            <SectionTitle>How the group is doing overall</SectionTitle>
            <div className="text-[14px] flex flex-col gap-1.5">
              {Object.entries(analytics.bandCounts).length === 0 ? (
                <span className="text-muted">No data yet</span>
              ) : (
                Object.entries(analytics.bandCounts).map(([band, count]) => (
                  <div key={band} className="flex justify-between">
                    <span className="text-muted capitalize">{band}</span>
                    <span>{count}</span>
                  </div>
                ))
              )}
            </div>
          </Card>

          <div>
            <SectionTitle>The past week</SectionTitle>
            <div className="flex flex-col gap-2">
              {analytics.trend.map((day) => (
                <div
                  key={day.date}
                  className="flex items-center justify-between text-[14px] bg-surface border border-border rounded-2xl px-4 py-3"
                >
                  <span className="text-muted">{day.date}</span>
                  <span>{day.checkins} check-ins</span>
                  <span>{day.journalEntries} journal entries</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
