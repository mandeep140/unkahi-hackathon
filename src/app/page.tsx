import Link from "next/link";
import { Card } from "@/components/ui";

const FEATURES = [
  {
    icon: "◉",
    tone: "accent" as const,
    title: "Private by default",
    body: "The main check-in is processed on this device. If you're ever part of a group program, only a small summary signal is shared, never your own words.",
  },
  {
    icon: "◐",
    tone: "clay" as const,
    title: "No pressure, no rush",
    body: "Skip anything. Stop anytime. There's nothing to get right, and nothing is being scored against you.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-12 relative">
      <div
        aria-hidden
        className="blob-decoration animate-drift h-72 w-72 -top-20 -left-24 bg-accent/5"
      />
      <div
        aria-hidden
        className="blob-decoration animate-drift h-56 w-56 top-10 -right-16 bg-clay/10"
        style={{ animationDelay: "3s" }}
      />

      <div className="max-w-xl relative">
        <span className="inline-flex items-center gap-2 rounded-full bg-accent-soft text-accent-strong text-[13px] font-medium px-3.5 py-1.5 mb-5">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
          A quiet space, whenever you need one
        </span>
        <h1 className="text-3xl sm:text-[36px] font-semibold tracking-tight mb-4 leading-tight">
          Take a moment to notice
          <br />
          how you&apos;re doing today.
        </h1>
        <p className="text-muted leading-relaxed text-[16px] max-w-md">
          A few gentle questions, at your own pace. Nothing to prepare, nothing
          to get wrong. You can stop whenever you like.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 relative">
        {FEATURES.map((feature) => (
          <Card key={feature.title} lift className="flex flex-col gap-3">
            <span
              aria-hidden
              className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl text-lg ${
                feature.tone === "accent"
                  ? "bg-accent-soft text-accent-strong"
                  : "bg-clay-soft text-clay-strong"
              }`}
            >
              {feature.icon}
            </span>
            <h3 className="font-medium text-[15px]">{feature.title}</h3>
            <p className="text-[14px] text-muted leading-relaxed">{feature.body}</p>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 relative">
        <Link
          href="/start"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-[15px] font-medium bg-accent text-accent-foreground hover:bg-accent-strong shadow-[var(--shadow-glow)] transition-all focus-ring"
        >
          Begin when you&apos;re ready
        </Link>
        <Link
          href="/tools"
          className="inline-flex items-center justify-center px-6 py-3.5 rounded-full text-[15px] font-medium border border-border bg-surface hover:border-accent hover:text-accent-strong transition-colors focus-ring"
        >
          Just want a calming tool?
        </Link>
      </div>

      <Link
        href="/safety-plan"
        className="text-[14px] text-muted hover:text-clay-strong underline underline-offset-4 transition-colors w-fit relative"
      >
        Looking for someone to talk to right now?
      </Link>

      <p className="text-[13px] text-muted max-w-md relative">
        The check-in, results, tools, and journal above stay on this device.
        A couple of simpler pages (mood check-in, weekly assessment) are a
        separate, secondary module and store entries on the server instead
        — see{" "}
        <Link href="/resources" className="underline underline-offset-4 hover:text-accent-strong">
          resources
        </Link>{" "}
        for details.
      </p>
    </div>
  );
}
