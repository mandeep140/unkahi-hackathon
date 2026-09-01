"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/client";
import { Badge, Button, Card, PageHeader, SectionTitle } from "@/components/ui";
import type { AssessmentDefinition, AssessmentResponse } from "@/lib/types";

export default function AssessmentPage() {
  const [definitions, setDefinitions] = useState<AssessmentDefinition[]>([]);
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [summary, setSummary] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<{ definitions: AssessmentDefinition[]; responses: AssessmentResponse[] }>(
      "/api/assessment"
    ).then((data) => {
      setDefinitions(data.definitions);
      setResponses(data.responses);
      setLoading(false);
    });
  }, []);

  const definition = definitions[0];

  async function handleSubmit() {
    if (!definition) return;
    if (Object.keys(answers).length !== definition.questions.length) return;
    setSubmitting(true);
    try {
      const data = await apiPost<{ summary: string }>("/api/assessment", {
        assessmentId: definition.id,
        answers,
      });
      setSummary(data.summary);
      const refreshed = await apiGet<{ responses: AssessmentResponse[] }>(
        "/api/assessment"
      );
      setResponses(refreshed.responses);
      setAnswers({});
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !definition) {
    return <p className="text-sm text-muted">Loading...</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={definition.title} description={definition.description} />

      <div className="flex flex-col gap-4">
        {definition.questions.map((question) => (
          <Card key={question.id}>
            <SectionTitle>{question.prompt}</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {question.options.map((option) => (
                <button
                  key={option.label}
                  onClick={() =>
                    setAnswers((prev) => ({ ...prev, [question.id]: option.value }))
                  }
                  aria-pressed={answers[question.id] === option.value}
                  className={`px-3.5 py-2 rounded-full border text-sm font-medium transition-all focus-ring ${
                    answers[question.id] === option.value
                      ? "bg-accent text-accent-foreground border-accent shadow-sm"
                      : "border-border bg-surface hover:border-accent hover:bg-accent-soft"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Button
        disabled={
          Object.keys(answers).length !== definition.questions.length || submitting
        }
        onClick={handleSubmit}
        className="w-fit"
      >
        {submitting ? "Just a moment..." : "Finish"}
      </Button>

      {summary && (
        <Card className="bg-accent-soft border-transparent animate-fade-up">
          <SectionTitle>What this suggests</SectionTitle>
          <p className="text-[15px] leading-relaxed">{summary}</p>
        </Card>
      )}

      {responses.length > 0 && (
        <div>
          <SectionTitle>Past check-ins</SectionTitle>
          <div className="flex flex-col gap-2">
            {responses.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between text-[14px] bg-surface border border-border rounded-2xl px-4 py-3"
              >
                <span className="text-muted">
                  {new Date(r.createdAt).toLocaleDateString()}
                </span>
                <Badge tone="accent">{r.band}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
