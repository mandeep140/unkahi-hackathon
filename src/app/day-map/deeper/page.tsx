"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DEEPER_STEPS,
  scoreDayMap,
  recomputeAfterDeeperPass,
  type DayMapAnswer,
} from "@/lib/daymap";
import { getLatestDayMapResult, updateLatestDayMapResult } from "@/lib/localStore";
import { apiPost } from "@/lib/client";
import { Button, Card, EmptyState, LoadingState, ProgressDots } from "@/components/ui";

export default function DeeperPassPage() {
  const [started, setStarted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<DayMapAnswer[]>([]);
  const [finishing, setFinishing] = useState(false);
  const router = useRouter();

  const previous = getLatestDayMapResult();

  if (!previous) {
    return (
      <EmptyState
        title="Complete the first check-in before going deeper."
        action={
          <Link href="/start" className="text-sm font-medium underline underline-offset-2">
            Start a check-in
          </Link>
        }
      />
    );
  }

  if (!started) {
    return (
      <div className="flex flex-col gap-6 max-w-md">
        <div>
          <p className="text-sm font-medium text-accent-strong mb-2">
            Completely optional
          </p>
          <h1 className="text-xl font-semibold tracking-tight mb-2">
            Want to explore a little further?
          </h1>
          <p className="text-[15px] text-muted leading-relaxed">
            Four more questions, this time using imagery instead of daily
            moments. There are no right answers here either. If anything
            feels like too much, it&apos;s completely fine to stop and try a
            calming tool instead.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={() => setStarted(true)} className="page-transition">
            Yes, let&apos;s continue
          </Button>
          <Link
            href="/results"
            className="inline-flex items-center justify-center px-5 py-3 border border-border rounded-full text-[15px] font-medium bg-surface hover:border-accent hover:text-accent-strong transition-colors focus-ring"
          >
            Not right now
          </Link>
        </div>
      </div>
    );
  }

  const step = DEEPER_STEPS[stepIndex];
  const previousResult = previous;

  async function choose(option: { pattern: DayMapAnswer["pattern"]; weights: DayMapAnswer["weights"] }) {
    const nextAnswers = [
      ...answers,
      { stepId: step.id, pattern: option.pattern, weights: option.weights },
    ];

    if (stepIndex < DEEPER_STEPS.length - 1) {
      setAnswers(nextAnswers);
      setStepIndex(stepIndex + 1);
      return;
    }

    setFinishing(true);
    const deeperResult = scoreDayMap([], nextAnswers, true);
    const merged = recomputeAfterDeeperPass(previousResult, deeperResult);
    updateLatestDayMapResult(merged);

    try {
      await apiPost("/api/daymap", {
        pattern: merged.primaryPattern,
        loadPercent: merged.loadPercent,
      });
    } catch {
    }
    router.push("/results");
  }

  if (finishing) {
    return <LoadingState label="Combining this with your earlier answers" />;
  }

  return (
    <div className="flex flex-col gap-6 max-w-md">
      <div key={step.id} className="animate-fade-up">
        <p className="text-sm font-medium text-accent-strong mb-2">
          {step.phase} · {step.stepLabel}
        </p>
        <h1 className="text-xl sm:text-[22px] font-semibold tracking-tight leading-snug">
          {step.prompt}
        </h1>
      </div>

      <div className="flex flex-col gap-2.5">
        {step.options.map((option) => (
          <Card key={option.label} className="p-0 overflow-hidden">
            <button
              onClick={() => choose(option)}
              className="w-full text-left px-5 py-4 text-[15px] leading-relaxed hover:bg-accent-soft hover:text-accent-strong focus-ring rounded-2xl transition-colors"
            >
              {option.label}
            </button>
          </Card>
        ))}
      </div>

      <ProgressDots total={DEEPER_STEPS.length} current={stepIndex} />
    </div>
  );
}
