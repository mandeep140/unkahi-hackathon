"use client";

import { useState } from "react";
import { getSafetyPlan, saveSafetyPlan, type SafetyPlan } from "@/lib/localStore";
import { Button, Card, PageHeader, SectionTitle, TextArea } from "@/components/ui";

const HELPLINES = [
  { region: "Govt. of India · 24x7", name: "KIRAN Helpline", contact: "1800-599-0019" },
  { region: "All India · 24x7", name: "Vandrevala Foundation", contact: "1860-266-2345" },
  { region: "All India · 24x7", name: "iCall (TISS)", contact: "9152987821" },
  { region: "All India · 24x7", name: "AASRA", contact: "9820466726" },
];

function toTelHref(number: string) {
  return `tel:${number.replace(/[^0-9+]/g, "")}`;
}

export default function SafetyPlanPage() {
  const [initial] = useState<SafetyPlan | null>(() => getSafetyPlan());
  const [warningSigns, setWarningSigns] = useState(initial?.warningSigns ?? "");
  const [copingSteps, setCopingSteps] = useState(initial?.copingSteps ?? "");
  const [trustedContact, setTrustedContact] = useState(initial?.trustedContact ?? "");
  const [saved, setSaved] = useState<SafetyPlan | null>(initial);

  function handleSave() {
    saveSafetyPlan({ warningSigns, copingSteps, trustedContact });
    setSaved(getSafetyPlan());
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="A place to turn to"
        description="Everything you write here stays on this device."
      />

      <a
        href={toTelHref("112")}
        className="flex items-center justify-between gap-3 rounded-2xl border border-danger/30 bg-danger-soft px-5 py-4 hover:bg-danger hover:text-white transition-colors group"
      >
        <div>
          <p className="text-[13px] font-medium text-danger group-hover:text-white/80">
            In immediate danger?
          </p>
          <p className="text-[17px] font-semibold text-foreground group-hover:text-white">
            Call 112 now
          </p>
        </div>
        <span
          aria-hidden
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-danger text-white text-[18px] shrink-0 group-hover:bg-white group-hover:text-danger transition-colors"
        >
          ☎
        </span>
      </a>

      <Card className="bg-support-soft border-transparent">
        <SectionTitle>People you can talk to right now</SectionTitle>
        <div className="flex flex-col gap-3">
          {HELPLINES.map((line) => (
            <div
              key={line.name}
              className="flex items-center justify-between gap-3 text-[15px] border-b border-support/20 last:border-none pb-3 last:pb-0"
            >
              <div>
                <p className="font-medium">{line.name}</p>
                <p className="text-muted text-[13px]">{line.region}</p>
                <p className="font-semibold text-accent-strong text-[14px] mt-0.5">
                  {line.contact}
                </p>
              </div>
              <a
                href={toTelHref(line.contact)}
                aria-label={`Call ${line.name}`}
                className="inline-flex items-center justify-center h-11 w-11 rounded-full bg-accent text-accent-foreground hover:bg-accent-strong transition-colors shrink-0 focus-ring shadow-sm"
              >
                <span aria-hidden className="text-[17px]">☎</span>
              </a>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle>Signs that things are getting harder</SectionTitle>
        <p className="text-[14px] text-muted mb-3 leading-relaxed">
          What have you noticed before, that tends to mean you need more
          support?
        </p>
        <TextArea
          rows={3}
          value={warningSigns}
          onChange={(e) => setWarningSigns(e.target.value)}
          placeholder="Whatever comes to mind..."
        />
      </Card>

      <Card>
        <SectionTitle>What has helped before</SectionTitle>
        <p className="text-[14px] text-muted mb-3 leading-relaxed">
          Anything that has gotten you through a hard moment in the past.
        </p>
        <TextArea
          rows={3}
          value={copingSteps}
          onChange={(e) => setCopingSteps(e.target.value)}
          placeholder="No wrong answers here..."
        />
      </Card>

      <Card>
        <SectionTitle>Someone you trust</SectionTitle>
        <p className="text-[14px] text-muted mb-3 leading-relaxed">
          A name and a way to reach them, for whenever you need it.
        </p>
        <TextArea
          rows={2}
          value={trustedContact}
          onChange={(e) => setTrustedContact(e.target.value)}
          placeholder="Optional..."
        />
      </Card>

      <Button onClick={handleSave} className="w-fit">
        Save this plan
      </Button>
      {saved && (
        <p className="text-[13px] text-muted">
          Saved on this device, {new Date(saved.updatedAt).toLocaleString()}.
        </p>
      )}
    </div>
  );
}