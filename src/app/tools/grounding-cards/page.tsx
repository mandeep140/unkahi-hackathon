"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button, Card, LoadingState, ProgressDots } from "@/components/ui";
import { RegulationRecheck } from "@/components/RegulationRecheck";

const PROMPTS = [
  "Name three things you can see right now.",
  "Name two things you can hear right now.",
  "Name one thing you can feel against your skin.",
  "Notice the temperature of the air around you.",
  "Notice where your feet are touching the ground.",
];

export default function GroundingCardsPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <GroundingCardsContent />
    </Suspense>
  );
}

function GroundingCardsContent() {
  const searchParams = useSearchParams();
  const fromResults = searchParams.get("from") === "results";
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState<number[]>([]);

  function next() {
    setDone((d) => [...d, index]);
    if (index < PROMPTS.length - 1) setIndex(index + 1);
  }

  const finished = done.length >= PROMPTS.length;

  return (
    <div className="flex flex-col gap-6 items-center max-w-md">
      <div className="text-center">
        <p className="text-sm font-medium text-accent-strong mb-2">
          Grounding
        </p>
        <h1 className="text-xl font-semibold tracking-tight">
          A gentle pass through your senses
        </h1>
      </div>

      {finished ? (
        <Card className="w-full text-center animate-fade-up">
          <p className="text-2xl mb-2" aria-hidden>
            ◎
          </p>
          <p className="text-[15px] font-medium mb-1">That&apos;s all of them.</p>
          <p className="text-[14px] text-muted leading-relaxed">
            No need to judge how it felt. Just notice whatever is true right now.
          </p>
        </Card>
      ) : (
        <Card key={index} className="w-full text-center py-14 animate-fade-up">
          <p className="text-lg leading-relaxed">{PROMPTS[index]}</p>
        </Card>
      )}

      <div className="w-full">
        <ProgressDots total={PROMPTS.length} current={done.length - 1} />
      </div>

      {!finished && (
        <Button onClick={next} className="w-fit">
          Next
        </Button>
      )}

      {finished && fromResults && <RegulationRecheck toolId="grounding-cards" />}

      <Link
        href="/tools"
        className="text-sm text-muted hover:text-accent-strong underline underline-offset-4 transition-colors"
      >
        Back to tools
      </Link>
    </div>
  );
}
