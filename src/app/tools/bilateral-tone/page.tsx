"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button, Card } from "@/components/ui";

export default function BilateralTonePage() {
  const [running, setRunning] = useState(false);
  const [side, setSide] = useState<"left" | "right">("left");
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const pannerRef = useRef<StereoPannerNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (!running) {
      oscillatorRef.current?.stop();
      oscillatorRef.current = null;
      return;
    }

    const ctx = new AudioContext();
    audioCtxRef.current = ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const panner = ctx.createStereoPanner();
    osc.frequency.value = 220;
    osc.type = "sine";
    gain.gain.value = 0.08;
    osc.connect(gain);
    gain.connect(panner);
    panner.connect(ctx.destination);
    osc.start();

    oscillatorRef.current = osc;
    pannerRef.current = panner;
    gainRef.current = gain;

    const interval = setInterval(() => {
      setSide((s) => {
        const next = s === "left" ? "right" : "left";
        if (pannerRef.current) {
          pannerRef.current.pan.value = next === "left" ? -0.8 : 0.8;
        }
        return next;
      });
    }, 900);

    return () => {
      clearInterval(interval);
      osc.stop();
      ctx.close();
    };
  }, [running]);

  return (
    <div className="flex flex-col gap-8 items-center max-w-md">
      <div className="text-center">
        <p className="text-sm font-medium text-accent-strong mb-2">
          Alternating tone
        </p>
        <h1 className="text-xl font-semibold tracking-tight">
          Something gentle to listen to for a bit
        </h1>
        <p className="text-[14px] text-muted mt-2">Headphones work best, but aren&apos;t required.</p>
      </div>

      <Card className="w-full flex items-center justify-center h-36">
        <div className="flex gap-10">
          <div
            className={`h-8 w-8 rounded-full transition-all duration-300 ${
              running && side === "left"
                ? "bg-accent scale-110 shadow-md"
                : "bg-surface-muted scale-100"
            }`}
          />
          <div
            className={`h-8 w-8 rounded-full transition-all duration-300 ${
              running && side === "right"
                ? "bg-accent scale-110 shadow-md"
                : "bg-surface-muted scale-100"
            }`}
          />
        </div>
      </Card>

      <Button onClick={() => setRunning((r) => !r)} className="w-fit">
        {running ? "Stop" : "Start"}
      </Button>

      <Link
        href="/tools"
        className="text-sm text-muted hover:text-accent-strong underline underline-offset-4 transition-colors"
      >
        Back to tools
      </Link>
    </div>
  );
}
