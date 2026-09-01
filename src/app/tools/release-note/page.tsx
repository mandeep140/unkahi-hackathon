"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button, Card, LoadingState, TextArea } from "@/components/ui";
import { RegulationRecheck } from "@/components/RegulationRecheck";

export default function ReleaseNotePage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ReleaseNoteContent />
    </Suspense>
  );
}

function ReleaseNoteContent() {
  const searchParams = useSearchParams();
  const fromResults = searchParams.get("from") === "results";
  const [text, setText] = useState("");
  const [releasing, setReleasing] = useState(false);
  const [released, setReleased] = useState(false);

  function release() {
    if (!text.trim()) return;
    setReleasing(true);
    setTimeout(() => {
      setText("");
      setReleasing(false);
      setReleased(true);
    }, 1200);
  }

  return (
    <div className="flex flex-col gap-6 max-w-md">
      <div>
        <p className="text-sm font-medium text-accent-strong mb-2">
          Writing it out
        </p>
        <h1 className="text-xl font-semibold tracking-tight mb-2">
          Put it into words, then set it down
        </h1>
        <p className="text-[14px] text-muted leading-relaxed">
          Nothing here is saved or sent anywhere, not even on this device.
          Write without worrying how it sounds, then let it go whenever
          you&apos;re ready.
        </p>
      </div>

      <Card>
        <TextArea
          rows={8}
          placeholder="Write whatever is heavy right now..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className={`transition-opacity duration-1000 ${releasing ? "opacity-0" : "opacity-100"}`}
          disabled={releasing}
        />
      </Card>

      {released && (
        <p className="text-[14px] text-muted text-center animate-fade-up">
          It&apos;s gone from the page now. You did that.
        </p>
      )}

      <Button onClick={release} disabled={!text.trim()} loading={releasing} className="w-fit">
        {releasing ? "Letting go..." : "Let it go"}
      </Button>

      {released && fromResults && <RegulationRecheck toolId="release-note" />}

      <Link
        href="/tools"
        className="text-sm text-muted hover:text-accent-strong underline underline-offset-4 transition-colors"
      >
        Back to tools
      </Link>
    </div>
  );
}
