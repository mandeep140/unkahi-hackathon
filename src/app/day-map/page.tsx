"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DAY_MAP_STEPS, scoreDayMap, type DayMapAnswer } from "@/lib/daymap";
import { saveDayMapResult } from "@/lib/localStore";
import { clearSessionSensations, getSessionSensations } from "@/lib/sessionState";
import { apiPost } from "@/lib/client";
import { Card, LoadingState, ProgressDots } from "@/components/ui";

export default function DayMapPage() {
  const router = useRouter();
  const [sensations] = useState<string[]>(() => getSessionSensations());
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<DayMapAnswer[]>([]);
  const [finishing, setFinishing] = useState(false);

  const step = DAY_MAP_STEPS[stepIndex];

  async function choose(option: { pattern: DayMapAnswer["pattern"]; weights: DayMapAnswer["weights"] }) {
    const nextAnswers = [
      ...answers,
      { stepId: step.id, pattern: option.pattern, weights: option.weights },
    ];

    if (stepIndex < DAY_MAP_STEPS.length - 1) {
      setAnswers(nextAnswers);
      setStepIndex(stepIndex + 1);
      return;
    }

    setFinishing(true);
    const result = scoreDayMap(sensations, nextAnswers, false);
    saveDayMapResult(result);
    clearSessionSensations();
    try {
      await apiPost("/api/daymap", {
        pattern: result.primaryPattern,
        loadPercent: result.loadPercent,
      });
    } catch {
    }
    router.push("/results");
  }

  if (finishing) {
    return <LoadingState label="Putting your results together" />;
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

      <ProgressDots total={DAY_MAP_STEPS.length} current={stepIndex} />

      <p className="text-[13px] text-muted text-center">
        You can close this at any time. Nothing is saved until you finish.
      </p>
    </div>
  );
}
