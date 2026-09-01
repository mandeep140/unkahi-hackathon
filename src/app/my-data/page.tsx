"use client";

import { useState } from "react";
import Link from "next/link";
import {
  getDayMapResults,
  getResonanceCounts,
  exportLocalData,
  clearAllLocalData,
} from "@/lib/localStore";
import { useBaseline } from "@/lib/useBaseline";
import { patternLabel } from "@/lib/daymap";
import { Button, Card, EmptyState, PageHeader, SectionTitle } from "@/components/ui";

export default function MyDataPage() {
  const [results] = useState(() => getDayMapResults());
  const [resonance] = useState(() => getResonanceCounts());
  const baseline = useBaseline();
  const [cleared, setCleared] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [clearing, setClearing] = useState(false);

  function handleExport() {
    setExporting(true);
    const json = exportLocalData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "unkahi-local-data.json";
    a.click();
    URL.revokeObjectURL(url);
    setTimeout(() => setExporting(false), 500);
  }

  function handleClear() {
    setClearing(true);
    setTimeout(() => {
      clearAllLocalData();
      setCleared(true);
      setClearing(false);
    }, 400);
  }

  if (results.length === 0 || cleared) {
    return (
      <EmptyState
        title={cleared ? "Everything has been cleared from this device." : "There's nothing here yet."}
        description={
          cleared
            ? "Nothing from this browser is kept anymore."
            : "Once you complete a check-in, you'll be able to see how things look over time."
        }
        action={
          !cleared && (
            <Link href="/start" className="text-sm font-medium underline underline-offset-4 text-accent-strong">
              Try a check-in
            </Link>
          )
        }
      />
    );
  }

  const recent = results.slice(0, 14);
  const maxLoad = Math.max(...recent.map((r) => r.loadPercent), 10);
  const totalResonance = resonance.yes + resonance.no;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Only visible to you"
        title="How things have looked over time"
        description="This comes entirely from what's stored on this device. It's yours to look at, export, or clear whenever you like."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <SectionTitle>Your usual range</SectionTitle>
          <p className="text-3xl font-semibold">{baseline.average ?? "—"}%</p>
          <p className="text-[13px] text-muted mt-1 leading-relaxed">
            based on your last {baseline.streak} check-in{baseline.streak === 1 ? "" : "s"}
          </p>
        </Card>
        <Card>
          <SectionTitle>How much it varies</SectionTitle>
          <p className="text-3xl font-semibold">{baseline.stdDev ?? "—"}</p>
          <p className="text-[13px] text-muted mt-1 leading-relaxed">
            smaller means steadier day to day
          </p>
        </Card>
        <Card>
          <SectionTitle>Today, compared to usual</SectionTitle>
          <p className="text-3xl font-semibold">
            {baseline.isDeviation ? "A bit different" : "Fairly typical"}
          </p>
          <p className="text-[13px] text-muted mt-1 leading-relaxed">
            measured only against your own history
          </p>
        </Card>
      </div>

      <div>
        <SectionTitle>A look at recent check-ins</SectionTitle>
        <Card>
          <div className="flex items-end gap-1.5 h-32">
            {recent
              .slice()
              .reverse()
              .map((r, i) => (
                <div
                  key={r.createdAt + i}
                  title={`${r.loadPercent}% · ${patternLabel(r.primaryPattern)}`}
                  className="flex-1 rounded-t-md bg-accent/70 hover:bg-accent transition-colors"
                  style={{ height: `${Math.max(6, (r.loadPercent / maxLoad) * 100)}%` }}
                />
              ))}
          </div>
          <p className="text-[13px] text-muted mt-3 leading-relaxed">
            Each bar is one check-in, oldest on the left. Taller just means
            more was going on at that moment, not that it was worse.
          </p>
        </Card>
      </div>

      {totalResonance > 0 && (
        <Card>
          <SectionTitle>How often results have felt right</SectionTitle>
          <p className="text-[14px] text-muted mb-3 leading-relaxed">
            Based on what you&apos;ve marked on past results pages.
          </p>
          <div className="flex gap-5 text-[14px]">
            <span>
              <strong>{resonance.yes}</strong> felt accurate
            </span>
            <span>
              <strong>{resonance.no}</strong> didn&apos;t quite fit
            </span>
          </div>
        </Card>
      )}

      <Card className="bg-surface-muted border-transparent">
        <SectionTitle>This information is yours</SectionTitle>
        <p className="text-[14px] text-muted mb-4 leading-relaxed">
          You can download everything on this page as a file to keep, or
          remove it completely. Either way, nothing about an organization
          program changes, since it never had access to this detail.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" loading={exporting} onClick={handleExport}>
            {exporting ? "Preparing..." : "Download as a file"}
          </Button>
          <Button variant="danger" loading={clearing} onClick={handleClear}>
            {clearing ? "Removing..." : "Remove everything"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
