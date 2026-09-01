"use client";

import { useState } from "react";
import Link from "next/link";
import {
  PILLARS,
  findTool,
  patternChipLabel,
  patternStateSentence,
  explainResult,
  reflectionStrengthLabel,
  reflectionStrengthDescription,
  comparePillarsToHistory,
  type DayMapResult,
} from "@/lib/daymap";
import {
  getLatestDayMapResult,
  getDayMapResults,
  saveResonance,
  saveFeedback,
  saveCorrection,
  saveRegulationSession,
  getResonance,
  getCorrection,
  averagePillarVectorExcluding,
  getPreferredTool,
  type ResonanceValue,
  type CorrectionTarget,
} from "@/lib/localStore";
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

const CORRECTION_OPTIONS: { value: CorrectionTarget; label: string }[] = [
  { value: "body", label: "The body description" },
  { value: "pattern", label: "The pattern" },
  { value: "theme", label: "The theme" },
  { value: "recommendation", label: "The recommendation" },
  { value: "none", label: "None of these" },
];

export default function ResultsPage() {
  const [result] = useState<DayMapResult | null>(() => getLatestDayMapResult());
  const [resonance, setResonance] = useState<ResonanceValue | null>(() =>
    result ? getResonance(result.createdAt) : null
  );
  const [feedback, setFeedback] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [showWhy, setShowWhy] = useState(false);
  const [correctionOpen, setCorrectionOpen] = useState(false);
  const [correctionTarget, setCorrectionTarget] = useState<CorrectionTarget | null>(() =>
    result ? getCorrection(result.createdAt)?.target ?? null : null
  );
  const [correctionNote, setCorrectionNote] = useState("");
  const [correctionSaved, setCorrectionSaved] = useState(false);

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

  const createdAt = result.createdAt;
  const hasSignal = result.hasSignal && result.pillars.length > 0;
  const primaryPillar = hasSignal ? PILLARS[result.pillars[0]] : null;
  const secondaryPillar = hasSignal && result.pillars[1] ? PILLARS[result.pillars[1]] : null;
  const recommendedToolId = primaryPillar?.toolId;
  const preferredToolId = recommendedToolId ? getPreferredTool([recommendedToolId]) : null;
  const activeToolId = preferredToolId ?? recommendedToolId ?? null;
  const recommendedTool = activeToolId ? findTool(activeToolId) : undefined;
  const band = LOAD_BAND_COPY[loadBand(result.loadPercent)];

  const history = getDayMapResults();
  const historyAverage = averagePillarVectorExcluding(history, createdAt);
  const pillarShift = historyAverage ? comparePillarsToHistory(result.pillarScores, historyAverage) : null;
  const enoughHistoryForComparison = history.filter((r) => r.hasSignal).length >= 3;

  function handleResonance(value: ResonanceValue) {
    setResonance(value);
    saveResonance(createdAt, value);
  }

  function submitFeedback() {
    if (!feedback.trim()) return;
    saveFeedback(createdAt, feedback.trim());
    setFeedbackSent(true);
  }

  function submitCorrection(target: CorrectionTarget) {
    setCorrectionTarget(target);
    saveCorrection(createdAt, target, correctionNote.trim() || undefined);
    setCorrectionSaved(true);
  }

  const currentLoadPercent = result.loadPercent;

  function startRegulation() {
    if (!activeToolId) return;
    saveRegulationSession({
      toolId: activeToolId,
      resultCreatedAt: createdAt,
      beforeLoad: currentLoadPercent,
      startedAt: new Date().toISOString(),
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-[13px] text-muted">
        Private by default — this reflection was generated on this device.
      </p>

      {!hasSignal ? (
        <Card className="bg-surface-muted border-transparent">
          <p className="text-sm font-medium text-accent-strong mb-2">On-device result</p>
          <h1 className="text-xl sm:text-[22px] font-semibold tracking-tight mb-2 leading-snug">
            Nothing strongly stands out today.
          </h1>
          <p className="text-[15px] text-foreground/80 leading-relaxed">
            Your responses didn&apos;t point strongly toward any one pattern. That&apos;s useful
            too — this reflection isn&apos;t meant to force an answer.
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <Link
              href="/start"
              className="inline-flex items-center px-5 py-2.5 rounded-full text-[14px] font-medium bg-accent text-accent-foreground hover:bg-accent-strong transition-colors focus-ring"
            >
              Check in again later
            </Link>
            <Link
              href="/tools"
              className="inline-flex items-center px-5 py-2.5 rounded-full text-[14px] font-medium border border-border bg-surface hover:border-accent hover:text-accent-strong transition-colors focus-ring"
            >
              Browse calming tools
            </Link>
          </div>
        </Card>
      ) : (
        <>
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
              <Badge tone="accent">{patternChipLabel(result.primaryPattern)}</Badge>
              {result.hasDeeperPass && <Badge>includes a deeper pass</Badge>}
              <Badge>Reflection strength: {reflectionStrengthLabel(result.reflectionStrength)}</Badge>
            </div>
            <p className="text-[13px] text-muted mt-3 leading-relaxed">
              {patternStateSentence(result.primaryPattern)} This is a snapshot of today, not a
              label for who you are.
            </p>
          </Card>

          <Card>
            <SectionTitle>What changed</SectionTitle>
            {!enoughHistoryForComparison ? (
              <p className="text-[14px] text-muted leading-relaxed">
                Your personal baseline will become clearer after a few check-ins.
              </p>
            ) : pillarShift ? (
              <p className="text-[14px] leading-relaxed">
                {PILLARS[pillarShift.pillar].shortLabel} looks{" "}
                {pillarShift.direction === "higher" ? "a little higher" : "a little lower"} than
                your recent range today.
              </p>
            ) : (
              <p className="text-[14px] text-muted leading-relaxed">
                This looks close to your recent range.
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
              <SectionTitle>You could try this now</SectionTitle>
              {preferredToolId && (
                <p className="text-[13px] text-clay-strong mb-2">
                  {recommendedTool.title} seemed to resonate with you last time. Want to try it
                  again?
                </p>
              )}
              <p className="text-[15px] font-medium mb-1">
                <span className="mr-2" aria-hidden>{recommendedTool.icon}</span>
                {recommendedTool.title}
              </p>
              <p className="text-[14px] text-foreground/75 mb-2">{recommendedTool.summary}</p>
              <p className="text-[13px] text-muted mb-4">
                Suggested because {primaryPillar!.shortLabel} was the strongest theme in this
                check-in.
              </p>
              <Link
                href={`/tools/${recommendedTool.id}?from=results&resultAt=${encodeURIComponent(createdAt)}`}
                onClick={startRegulation}
                className="inline-flex items-center px-5 py-2.5 rounded-full text-[14px] font-medium bg-clay text-white hover:bg-clay-strong transition-colors focus-ring shadow-sm"
              >
                Try for 2 minutes
              </Link>
            </Card>
          )}

          <div>
            <button
              onClick={() => setShowWhy((v) => !v)}
              className="text-[14px] text-muted hover:text-accent-strong underline underline-offset-4 transition-colors"
            >
              {showWhy ? "Hide why this showed up" : "Why this showed up"}
            </button>
            {showWhy && (
              <Card className="mt-3 animate-fade-up">
                <p className="text-[14px] leading-relaxed">{explainResult(result)}</p>
                <p className="text-[13px] text-muted mt-3 leading-relaxed">
                  {reflectionStrengthDescription(result.reflectionStrength)}
                </p>
              </Card>
            )}
          </div>

          <div>
            <SectionTitle>What this might be about</SectionTitle>
            <div className="flex flex-col gap-3">
              <Card>
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-strong"
                  >
                    {primaryPillar!.icon}
                  </span>
                  <div>
                    <p className="text-[15px] font-medium mb-1">{primaryPillar!.title}</p>
                    <p className="text-[13px] text-accent-strong mb-1">{primaryPillar!.subtitle}</p>
                    <p className="text-[14px] text-muted mb-2 leading-relaxed">{primaryPillar!.description}</p>
                    <p className="text-[14px] leading-relaxed">
                      <span className="text-muted">A small idea: </span>
                      {primaryPillar!.tip}
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
                      <p className="text-[13px] text-accent-strong mb-1">{secondaryPillar.subtitle}</p>
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
        </>
      )}

      <Card>
        <SectionTitle>Does this feel true to you?</SectionTitle>
        <p className="text-[14px] text-muted mb-4 leading-relaxed">
          You know yourself better than any tool can. This is just a
          reflection, not a verdict.
        </p>
        <div className="flex gap-2 mb-2 flex-wrap">
          <Button
            variant={resonance === "yes" ? "primary" : "secondary"}
            onClick={() => handleResonance("yes")}
          >
            Yes, that fits
          </Button>
          <Button
            variant={resonance === "partly" ? "primary" : "secondary"}
            onClick={() => handleResonance("partly")}
          >
            Partly
          </Button>
          <Button
            variant={resonance === "no" ? "primary" : "secondary"}
            onClick={() => handleResonance("no")}
          >
            Not really
          </Button>
        </div>

        {resonance === "no" && (
          <p className="text-[13px] text-muted mb-3 animate-fade-up">
            That&apos;s useful too. This reflection is a prompt, not a verdict.
          </p>
        )}

        {resonance && !feedbackSent && (
          <div className="flex flex-col gap-3 animate-fade-up mt-2">
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

      <Card>
        <SectionTitle>Something here feels off?</SectionTitle>
        {!correctionOpen && !correctionTarget && (
          <button
            onClick={() => setCorrectionOpen(true)}
            className="text-[14px] font-medium text-accent-strong underline underline-offset-4"
          >
            Let us know what didn&apos;t fit
          </button>
        )}
        {correctionTarget && !correctionOpen && (
          <p className="text-[14px] text-muted">
            Noted locally: {CORRECTION_OPTIONS.find((o) => o.value === correctionTarget)?.label}.
            This result stays as-is — nothing is retrained from this.
          </p>
        )}
        {correctionOpen && (
          <div className="flex flex-col gap-3 animate-fade-up">
            <div className="flex flex-wrap gap-2">
              {CORRECTION_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => submitCorrection(option.value)}
                  className={`px-3.5 py-2 rounded-full border text-[13px] font-medium transition-all focus-ring ${
                    correctionTarget === option.value
                      ? "bg-accent text-accent-foreground border-accent"
                      : "border-border bg-surface hover:border-accent hover:bg-accent-soft"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {correctionSaved && (
              <>
                <p className="text-[13px] text-muted">
                  Thanks. This is just for your own agency over the result — it&apos;s local, and
                  optional to say more.
                </p>
                <TextArea
                  rows={2}
                  value={correctionNote}
                  onChange={(e) => setCorrectionNote(e.target.value)}
                  placeholder="What would you change? (optional)"
                />
                <Button
                  variant="secondary"
                  className="w-fit"
                  onClick={() => saveCorrection(createdAt, correctionTarget!, correctionNote.trim() || undefined)}
                >
                  Save note
                </Button>
              </>
            )}
          </div>
        )}
      </Card>

      {hasSignal && !result.hasDeeperPass && (
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
