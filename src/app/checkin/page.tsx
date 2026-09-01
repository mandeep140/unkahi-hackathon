"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/client";
import { Button, Card, PageHeader, SectionTitle, TextArea } from "@/components/ui";

const MOOD_OPTIONS: { value: 1 | 2 | 3 | 4 | 5; label: string }[] = [
  { value: 1, label: "Very low" },
  { value: 2, label: "Low" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Good" },
  { value: 5, label: "Very good" },
];

export default function CheckInPage() {
  const router = useRouter();
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!mood) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiPost("/api/checkins", { mood, note });
      router.push("/dashboard");
    } catch {
      setError("That didn't save. Would you like to try again?");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-md">
      <PageHeader
        title="How are you feeling right now?"
        description="Just a quick moment. There's no right answer."
      />

      <Card>
        <SectionTitle>Pick what fits closest</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {MOOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setMood(option.value)}
              aria-pressed={mood === option.value}
              className={`px-4 py-2.5 rounded-full border text-[14px] font-medium transition-all focus-ring ${
                mood === option.value
                  ? "bg-accent text-accent-foreground border-accent shadow-sm"
                  : "border-border bg-surface hover:border-accent hover:bg-accent-soft"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle>Anything you&apos;d like to add (optional)</SectionTitle>
        <TextArea
          rows={4}
          placeholder="Only if you feel like it..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </Card>

      {error && <p className="text-[14px] text-danger">{error}</p>}

      <Button disabled={!mood} loading={submitting} onClick={handleSubmit} className="w-fit">
        {submitting ? "Saving..." : "Save"}
      </Button>
    </div>
  );
}
