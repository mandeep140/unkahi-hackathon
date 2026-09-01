"use client";

import { useState } from "react";
import Link from "next/link";
import { PILLARS, findTool, patternLabel, type DayMapResult } from "@/lib/daymap";
import { getLatestDayMapResult, saveResonance, saveFeedback } from "@/lib/localStore";
import { useBaseline } from "@/lib/useBaseline";
import { Badge, Button, Card, EmptyState, SectionTitle, TextArea } from "@/components/ui";
import { PillarRadarChart, PillarBarChart } from "@/components/PillarCharts";

const LOAD_BAND_COPY: Record<"gentle" | "noticeable" | "significant", { label: string; body: string }> = {
  gentle: {
    label: "Things look fairly steady",
    body: "Nothing here stands out as especially heavy right now. That's worth noticing too.",
  },
  noticeable: {
    label: "There's some noticeable weight today",
    body: "A few things seem to be asking for attention. A short tool below may help, if you'd like.",
  },
  significant: {
    label: "It seems like a lot is carrying weight right now",
    body: "That sounds like a lot to hold. Nothing here is urgent to fix — take whatever pace feels right, and the safety plan page is there if you'd like extra support.",
  },
};

function loadBand(percent: number): "gentle" | "noticeable" | "significant" {
  if (percent < 35) return "gentle";
  if (percent < 65) return "noticeable";
  return "significant";
}

export default function ResultsPage() {
  const [result] = useState<DayMapResult | null>(() => getLatestDayMapResult());
  const [resonance, setResonance] = useState<"yes" | "no" | null>(null);
  const [feedback, setFeedback] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const baseline = useBaseline();

  if (!result) {
    return (
      <EmptyState
        title="No check-in on this device yet."
        description="A short check-in takes about a minute, whenever you're ready."
        action={
          <Link href="/start" className="text-sm font-medium underline underline-offset-4 text-accent-strong">
            Start a check-in
          </Link>
        }
      />
    );
  }

  const primaryPillar = PILLARS[result.pillars[0]];
  const secondaryPillar = result.pillars[1] ? PILLARS[result.pillars[1]] : null;
  const recommendedTool = findTool(primaryPillar.toolId);
  const createdAt = result.createdAt;
  const band = LOAD_BAND_COPY[loadBand(result.loadPercent)];

  function handleResonance(value: "yes" | "no") {
    setResonance(value);
    saveResonance(createdAt, value);
  }

  function submitFeedback() {
    if (!feedback.trim()) return;
    saveFeedback(createdAt, feedback.trim());
    setFeedbackSent(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="bg-gradient-to-br from-accent-soft via-accent-soft to-clay-soft/60 border-transparent shadow-[var(--shadow-glow)]">
        <p className="text-sm font-medium text-accent-strong mb-2">
          What we noticed, gently
        </p>
        <h1 className="text-xl sm:text-[22px] font-semibold tracking-tight mb-2 leading-snug">
          {band.label}
        </h1>
        <p className="text-[15px] text-foreground/80 leading-relaxed mb-4">
          {band.body}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge tone="accent">Leaning toward {patternLabel(result.primaryPattern).toLowerCase()}</Badge>
          {result.hasDeeperPass && <Badge>looked a little deeper too</Badge>}
        </div>
        {baseline.average !== null && (
          <p className="text-[13px] text-muted mt-3">
            Compared with your own past check-ins, this
            {baseline.isDeviation ? " stands out a bit from your usual range." : " is close to where you tend to be."}
          </p>
        )}
      </Card>

      <div>
        <button
          onClick={() => setShowChart((v) => !v)}
          className="text-[14px] text-muted hover:text-accent-strong underline underline-offset-4 transition-colors"
        >
          {showChart ? "Hide the detailed view" : "See a more detailed view"}
        </button>
        {showChart && (
          <div className="grid gap-4 sm:grid-cols-2 mt-4 animate-fade-up">
            <Card>
              <SectionTitle>Shape of today</SectionTitle>
              <PillarRadarChart scores={result.pillarScores} />
            </Card>
            <Card>
              <SectionTitle>Where it shows up most</SectionTitle>
              <PillarBarChart scores={result.pillarScores} />
            </Card>
          </div>
        )}
      </div>

      {recommendedTool && (
        <Card lift className="bg-clay-soft border-transparent">
          <SectionTitle>A gentle next step</SectionTitle>
          <p className="text-[15px] font-medium mb-1">
            <span className="mr-2" aria-hidden>{recommendedTool.icon}</span>
            {recommendedTool.title}
          </p>
          <p className="text-[14px] text-foreground/75 mb-4">{recommendedTool.summary}</p>
          <Link
            href={`/tools/${recommendedTool.id}`}
            className="inline-flex items-center px-5 py-2.5 rounded-full text-[14px] font-medium bg-clay text-white hover:bg-clay-strong transition-colors focus-ring shadow-sm"
          >
            Try it now
          </Link>
        </Card>
      )}

      <div>
        <SectionTitle>What this might be about</SectionTitle>
        <div className="flex flex-col gap-3">
          <Card>
            <div className="flex items-start gap-3">
              <span
                aria-hidden
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-strong"
              >
                {primaryPillar.icon}
              </span>
              <div>
                <p className="text-[15px] font-medium mb-1">{primaryPillar.title}</p>
                <p className="text-[14px] text-muted mb-2 leading-relaxed">{primaryPillar.description}</p>
                <p className="text-[14px] leading-relaxed">
                  <span className="text-muted">A small idea: </span>
                  {primaryPillar.tip}
                </p>
              </div>
            </div>
          </Card>
          {secondaryPillar && (
            <Card>
              <div className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-strong"
                >
                  {secondaryPillar.icon}
                </span>
                <div>
                  <p className="text-[15px] font-medium mb-1">{secondaryPillar.title}</p>
                  <p className="text-[14px] text-muted mb-2 leading-relaxed">{secondaryPillar.description}</p>
                  <p className="text-[14px] leading-relaxed">
                    <span className="text-muted">A small idea: </span>
                    {secondaryPillar.tip}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      <Card>
        <SectionTitle>Does this feel true to you?</SectionTitle>
        <p className="text-[14px] text-muted mb-4 leading-relaxed">
          You know yourself better than any tool can. This is just a
          reflection, not a verdict.
        </p>
        <div className="flex gap-2 mb-4">
          <Button
            variant={resonance === "yes" ? "primary" : "secondary"}
            onClick={() => handleResonance("yes")}
          >
            Yes, that fits
          </Button>
          <Button
            variant={resonance === "no" ? "primary" : "secondary"}
            onClick={() => handleResonance("no")}
          >
            Not really
          </Button>
        </div>

        {resonance && !feedbackSent && (
          <div className="flex flex-col gap-3 animate-fade-up">
            <p className="text-[14px] text-muted leading-relaxed">
              Want to add anything, in your own words? Completely optional,
              and stays on this device.
            </p>
            <TextArea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Only if you'd like to..."
            />
            <Button onClick={submitFeedback} disabled={!feedback.trim()} className="w-fit">
              Save this note
            </Button>
          </div>
        )}
        {feedbackSent && (
          <p className="text-[14px] text-muted">Saved, just for you, on this device.</p>
        )}
      </Card>

      {!result.hasDeeperPass && (
        <Card>
          <SectionTitle>If you&apos;d like to go further</SectionTitle>
          <p className="text-[14px] text-muted mb-3 leading-relaxed">
            There&apos;s an optional second set of questions that looks at things
            from a different angle. Only worth trying if you feel up for it.
          </p>
          <Link
            href="/day-map/deeper"
            className="text-[14px] font-medium underline underline-offset-4 text-accent-strong"
          >
            Explore a bit more
          </Link>
        </Card>
      )}

      <div className="flex gap-5 text-[14px] flex-wrap">
        <Link href="/tools" className="underline underline-offset-4 text-muted hover:text-accent-strong">
          Browse calming tools
        </Link>
        <Link href="/my-data" className="underline underline-offset-4 text-muted hover:text-accent-strong">
          See how this has changed over time
        </Link>
      </div>

      <p className="text-[13px] text-muted border-t border-border pt-5 leading-relaxed">
        This is a self-reflection tool, not a medical or clinical assessment.
        If things feel like more than you can carry right now, the safety
        plan page has people and resources ready to help.
      </p>
    </div>
  );
}
