"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, TextArea } from "@/components/ui";

export default function ReleaseNotePage() {
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

      <button
        onClick={release}
        disabled={!text.trim() || releasing}
        className="px-5 py-2.5 rounded-full text-[15px] font-medium bg-accent text-accent-foreground hover:bg-accent-strong transition-colors focus-ring shadow-sm disabled:opacity-50"
      >
        {releasing ? "Letting go..." : "Let it go"}
      </button>

      <Link
        href="/tools"
        className="text-sm text-muted hover:text-accent-strong underline underline-offset-4 transition-colors"
      >
        Back to tools
      </Link>
    </div>
  );
}
