"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BODY_SENSATIONS } from "@/lib/daymap";
import { Button, Card, PageHeader, SectionTitle } from "@/components/ui";

export default function StartPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [proceeding, setProceeding] = useState(false);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  function proceed() {
    setProceeding(true);
    const params = new URLSearchParams({ sensations: selected.join(",") });
    router.push(`/day-map?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-6 max-w-md">
      <PageHeader
        eyebrow="Step 1 of 2 · takes about a minute"
        title="First, how does your body feel right now?"
        description="Pick anything that fits. It's fine to pick none, or several. There's no need to explain or overthink it."
      />

      <Card>
        <SectionTitle>You can select more than one</SectionTitle>
        <div className="grid grid-cols-2 gap-2.5">
          {BODY_SENSATIONS.map((sensation) => {
            const active = selected.includes(sensation.id);
            return (
              <button
                key={sensation.id}
                onClick={() => toggle(sensation.id)}
                aria-pressed={active}
                className={`text-left px-3.5 py-3.5 rounded-2xl border text-[14px] leading-snug transition-all focus-ring ${
                  active
                    ? "bg-accent text-accent-foreground border-accent shadow-sm"
                    : "border-border bg-surface hover:border-accent hover:bg-accent-soft"
                }`}
              >
                <span className="mr-1.5" aria-hidden>
                  {sensation.icon}
                </span>
                {sensation.label}
              </button>
            );
          })}
        </div>
      </Card>

      <Button onClick={proceed} loading={proceeding} className="w-full sm:w-fit">
        {proceeding ? "Loading..." : selected.length === 0 ? "None of these, continue" : "Continue"}
      </Button>
    </div>
  );
}
