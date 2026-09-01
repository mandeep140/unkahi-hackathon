"use client";

import { useState } from "react";
import Link from "next/link";
import {
  clearRegulationSession,
  getRegulationSession,
  saveToolShift,
  type ToolShift,
} from "@/lib/localStore";
import { Card, SectionTitle } from "@/components/ui";

const SHIFT_OPTIONS: { value: ToolShift; label: string }[] = [
  { value: "lighter", label: "Lighter" },
  { value: "same", label: "About the same" },
  { value: "heavier", label: "Heavier" },
  { value: "unsure", label: "Not sure" },
];

export function RegulationRecheck({ toolId }: { toolId: string }) {
  const [session] = useState(() => {
    const s = getRegulationSession();
    return s && s.toolId === toolId ? s : null;
  });
  const [shift, setShift] = useState<ToolShift | null>(null);
  const [done, setDone] = useState(false);

  if (!session) return null;
  const beforeLoad = session.beforeLoad;

  function choose(value: ToolShift) {
    setShift(value);
    saveToolShift({
      toolId,
      shift: value,
      beforeLoad,
      createdAt: new Date().toISOString(),
    });
    clearRegulationSession();
    setDone(true);
  }

  return (
    <Card className="w-full max-w-md bg-surface-muted border-transparent">
      <SectionTitle>Your experience after trying it</SectionTitle>
      {!done ? (
        <>
          <p className="text-[14px] text-muted mb-3 leading-relaxed">
            Did anything shift? No pressure either way.
          </p>
          <div className="flex flex-wrap gap-2">
            {SHIFT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => choose(option.value)}
                className={`px-3.5 py-2 rounded-full border text-[13px] font-medium transition-all focus-ring ${
                  shift === option.value
                    ? "bg-accent text-accent-foreground border-accent"
                    : "border-border bg-surface hover:border-accent hover:bg-accent-soft"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <p className="text-[14px] leading-relaxed mb-1">
            Noted — self-reflection signal saved on this device.
          </p>
          <p className="text-[13px] text-muted mb-3 leading-relaxed">
            This isn&apos;t a measurement of your nervous system, just what you noticed.
          </p>
          <Link
            href="/results"
            className="text-[14px] font-medium text-accent-strong underline underline-offset-4"
          >
            Back to your reflection
          </Link>
        </>
      )}
    </Card>
  );
}
