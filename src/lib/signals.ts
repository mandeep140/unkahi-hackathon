import type { CheckIn, JournalEntry, Recommendation } from "./types";

const NEGATIVE_WORDS = [
  "sad",
  "tired",
  "anxious",
  "worried",
  "stressed",
  "lonely",
  "overwhelmed",
  "angry",
  "hopeless",
  "exhausted",
  "afraid",
  "hurt",
];

const POSITIVE_WORDS = [
  "grateful",
  "happy",
  "calm",
  "hopeful",
  "proud",
  "relieved",
  "excited",
  "peaceful",
  "content",
  "good",
];

export function analyzeSentiment(text: string): JournalEntry["sentiment"] {
  const lower = text.toLowerCase();
  let score = 0;
  for (const word of NEGATIVE_WORDS) {
    if (lower.includes(word)) score -= 1;
  }
  for (const word of POSITIVE_WORDS) {
    if (lower.includes(word)) score += 1;
  }
  if (score <= -1) return "low";
  if (score >= 1) return "positive";
  return "neutral";
}

export type MoodDirection = "up" | "down" | "flat";

export function computeMoodTrend(
  checkins: CheckIn[]
): { average: number | null; direction: MoodDirection } {
  if (checkins.length === 0) {
    return { average: null, direction: "flat" };
  }
  const recent = checkins.slice(-7);
  const average =
    Math.round((recent.reduce((s, c) => s + c.mood, 0) / recent.length) * 100) / 100;

  if (recent.length < 2) {
    return { average, direction: "flat" };
  }
  const midpoint = Math.floor(recent.length / 2);
  const firstHalf = recent.slice(0, midpoint);
  const secondHalf = recent.slice(midpoint);
  const firstAvg = firstHalf.reduce((s, c) => s + c.mood, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((s, c) => s + c.mood, 0) / secondHalf.length;
  const diff = secondAvg - firstAvg;
  const direction: MoodDirection = diff > 0.3 ? "up" : diff < -0.3 ? "down" : "flat";
  return { average, direction };
}

const RECOMMENDATION_LIBRARY: Recommendation[] = [
  {
    id: "breathing-1",
    title: "Two-minute breathing exercise",
    description: "A short paced breathing exercise to steady your nervous system.",
    kind: "breathing",
  },
  {
    id: "journal-prompt-1",
    title: "Journaling prompt: naming the week",
    description: "Write for five minutes about one thing that took the most energy this week.",
    kind: "journaling",
  },
  {
    id: "grounding-1",
    title: "Grounding: five senses check",
    description: "Notice five things you can see, four you can hear, three you can touch.",
    kind: "grounding",
  },
  {
    id: "reflection-1",
    title: "Reflection: a small win",
    description: "Take a moment to write down one small thing that went well recently.",
    kind: "reflection",
  },
  {
    id: "resource-1",
    title: "Resource: understanding low-energy weeks",
    description: "A short read on why energy and focus can dip and what tends to help.",
    kind: "resource",
  },
];

export function buildRecommendations(params: {
  moodDirection: MoodDirection;
  band?: string;
  lastSentiment?: JournalEntry["sentiment"];
}): Recommendation[] {
  const { moodDirection, band, lastSentiment } = params;
  const picks: Recommendation[] = [];

  if (band === "strained" || moodDirection === "down") {
    picks.push(RECOMMENDATION_LIBRARY[0]);
    picks.push(RECOMMENDATION_LIBRARY[2]);
    picks.push(RECOMMENDATION_LIBRARY[4]);
  } else if (band === "mixed" || lastSentiment === "low") {
    picks.push(RECOMMENDATION_LIBRARY[1]);
    picks.push(RECOMMENDATION_LIBRARY[2]);
  } else {
    picks.push(RECOMMENDATION_LIBRARY[3]);
    picks.push(RECOMMENDATION_LIBRARY[1]);
  }

  const seen = new Set<string>();
  return picks.filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
}
