export type MoodValue = 1 | 2 | 3 | 4 | 5;

export interface UserProfile {
  id: string;
  name: string;
  language: string;
  createdAt: string;
  baselineComplete: boolean;
}

export interface CheckIn {
  id: string;
  userId: string;
  mood: MoodValue;
  note: string;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  text: string;
  sentiment: "low" | "neutral" | "positive";
  createdAt: string;
}

export interface AssessmentQuestion {
  id: string;
  prompt: string;
  options: { label: string; value: number }[];
}

export interface AssessmentDefinition {
  id: string;
  title: string;
  description: string;
  questions: AssessmentQuestion[];
  interpret: (score: number) => { band: string; summary: string };
}

export interface AssessmentResponse {
  id: string;
  userId: string;
  assessmentId: string;
  answers: Record<string, number>;
  score: number;
  band: string;
  createdAt: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  kind: "breathing" | "journaling" | "reflection" | "resource" | "grounding";
}

export interface OrgParticipantEvent {
  type: string;
  createdAt: string;
}
