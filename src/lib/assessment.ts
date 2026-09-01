import type { AssessmentDefinition } from "./types";

export const wellbeingCheckin: AssessmentDefinition = {
  id: "wellbeing-checkin",
  title: "Weekly Wellbeing Check-in",
  description:
    "A short set of questions about how the past week has felt. Answers stay on this device unless sync is turned on.",
  questions: [
    {
      id: "sleep",
      prompt: "How has your sleep been this week?",
      options: [
        { label: "Restful", value: 0 },
        { label: "A little uneven", value: 1 },
        { label: "Often disrupted", value: 2 },
        { label: "Rarely restful", value: 3 },
      ],
    },
    {
      id: "energy",
      prompt: "How would you describe your energy levels?",
      options: [
        { label: "Steady", value: 0 },
        { label: "Some dips", value: 1 },
        { label: "Low most days", value: 2 },
        { label: "Consistently low", value: 3 },
      ],
    },
    {
      id: "focus",
      prompt: "How easy has it been to concentrate?",
      options: [
        { label: "Easy", value: 0 },
        { label: "Manageable", value: 1 },
        { label: "Difficult", value: 2 },
        { label: "Very difficult", value: 3 },
      ],
    },
    {
      id: "connection",
      prompt: "How connected have you felt to people around you?",
      options: [
        { label: "Well connected", value: 0 },
        { label: "Somewhat connected", value: 1 },
        { label: "Distant", value: 2 },
        { label: "Isolated", value: 3 },
      ],
    },
    {
      id: "outlook",
      prompt: "How has your outlook on the near future felt?",
      options: [
        { label: "Hopeful", value: 0 },
        { label: "Neutral", value: 1 },
        { label: "Uncertain", value: 2 },
        { label: "Discouraged", value: 3 },
      ],
    },
  ],
  interpret(score: number) {
    if (score <= 4) {
      return {
        band: "steady",
        summary: "Signals this week look steady. Keep up whatever has been working.",
      };
    }
    if (score <= 9) {
      return {
        band: "mixed",
        summary: "A mixed week. A short grounding activity or journaling prompt may help.",
      };
    }
    return {
      band: "strained",
      summary:
        "This week looks strained. Consider a support resource, and reach out to someone you trust.",
    };
  },
};

export const assessments: Record<string, AssessmentDefinition> = {
  [wellbeingCheckin.id]: wellbeingCheckin,
};

export function scoreAssessment(
  definition: AssessmentDefinition,
  answers: Record<string, number>
) {
  const score = Object.values(answers).reduce((sum, v) => sum + v, 0);
  const { band, summary } = definition.interpret(score);
  return { score, band, summary };
}
