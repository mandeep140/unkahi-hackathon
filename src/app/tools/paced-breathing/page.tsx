"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui";

const PHASES = [
  { label: "Breathe in", seconds: 4 },
  { label: "Hold", seconds: 4 },
  { label: "Breathe out", seconds: 6 },
];

export default function PacedBreathingPage() {
  const [running, setRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(PHASES[0].seconds);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s > 1) return s - 1;
        setPhaseIndex((p) => {
          const next = (p + 1) % PHASES.length;
          if (next === 0) setCycles((c) => c + 1);
          setSecondsLeft(PHASES[next].seconds);
          return next;
        });
        return PHASES[(phaseIndex + 1) % PHASES.length].seconds;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running, phaseIndex]);

  const phase = PHASES[phaseIndex];
  const scale =
    phase.label === "Breathe in"
      ? "scale-100"
      : phase.label === "Hold"
        ? "scale-100"
        : "scale-75";

  return (
    <div className="flex flex-col gap-8 items-center">
      <div className="text-center">
        <p className="text-sm font-medium text-accent-strong mb-2">
          Breathing
        </p>
        <h1 className="text-xl font-semibold tracking-tight">
          A slower rhythm, for a moment
        </h1>
      </div>

      <div className="flex items-center justify-center h-60 w-60 relative">
        <div
          aria-hidden
          className="absolute inset-0 rounded-full bg-accent-soft"
          style={{ opacity: running ? 0.6 : 0.3 }}
        />
        <div
          className={`h-40 w-40 rounded-full border-2 border-accent bg-surface transition-transform duration-1000 ease-in-out ${scale} flex items-center justify-center shadow-md relative z-10`}
        >
          <div className="text-center">
            <p className="text-sm font-medium text-accent-strong">{phase.label}</p>
            <p className="text-3xl font-semibold tabular-nums">{secondsLeft}</p>
          </div>
        </div>
      </div>

      <Card className="w-full max-w-sm text-center">
        <p className="text-[14px] text-muted mb-4">
          {running ? `${cycles} rounds so far, no need to count` : "Start whenever you're ready."}
        </p>
        <button
          onClick={() => setRunning((r) => !r)}
          className="px-5 py-2.5 rounded-full text-sm font-medium bg-accent text-accent-foreground hover:bg-accent-strong transition-colors focus-ring shadow-sm"
        >
          {running ? "Pause" : "Start"}
        </button>
      </Card>

      <Link
        href="/tools"
        className="text-sm text-muted hover:text-accent-strong underline underline-offset-4 transition-colors"
      >
        Back to tools
      </Link>
    </div>
  );
}
