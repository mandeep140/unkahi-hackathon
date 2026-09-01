"use client";

import type { DayMapResult, PillarVector } from "./daymap";

const RESULTS_KEY = "unkahi.daymap.results";
const SAFETY_PLAN_KEY = "unkahi.safetyPlan";
const RESONANCE_KEY = "unkahi.daymap.resonance";
const FEEDBACK_KEY = "unkahi.daymap.feedback";
const CORRECTION_KEY = "unkahi.daymap.correction";
const REGULATION_SESSION_KEY = "unkahi.regulation.session";
const TOOL_SHIFT_KEY = "unkahi.tool.shiftHistory";
const JOURNAL_KEY = "unkahi.journal.entries";

export interface SafetyPlan {
  warningSigns: string;
  copingSteps: string;
  trustedContact: string;
  updatedAt: string;
}

export function saveDayMapResult(result: DayMapResult) {
  if (typeof window === "undefined") return;
  const existing = getDayMapResults();
  existing.unshift(result);
  window.localStorage.setItem(RESULTS_KEY, JSON.stringify(existing.slice(0, 30)));
}

export function getDayMapResults(): DayMapResult[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(RESULTS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Partial<DayMapResult>[];
    return parsed.map((r) => ({
      scoringVersion: r.scoringVersion ?? "v0",
      loadPercent: r.loadPercent ?? 0,
      primaryPattern: r.primaryPattern ?? "flight",
      patternWeights: r.patternWeights ?? { fight: 0, flight: 0, freeze: 0, fawn: 0 },
      pillarScores: r.pillarScores ?? [0, 0, 0, 0, 0, 0],
      pillars: r.pillars ?? [],
      hasSignal: r.hasSignal ?? (r.pillars ? r.pillars.length > 0 : true),
      reflectionStrength: r.reflectionStrength ?? "moderate",
      hasDeeperPass: r.hasDeeperPass ?? false,
      createdAt: r.createdAt ?? new Date().toISOString(),
    })) as DayMapResult[];
  } catch {
    return [];
  }
}

export function getLatestDayMapResult(): DayMapResult | null {
  const results = getDayMapResults();
  return results[0] ?? null;
}

export function updateLatestDayMapResult(result: DayMapResult) {
  if (typeof window === "undefined") return;
  const existing = getDayMapResults();
  if (existing.length === 0) {
    saveDayMapResult(result);
    return;
  }
  existing[0] = result;
  window.localStorage.setItem(RESULTS_KEY, JSON.stringify(existing));
}

export type ResonanceValue = "yes" | "partly" | "no";

export function saveResonance(resultCreatedAt: string, value: ResonanceValue) {
  if (typeof window === "undefined") return;
  const raw = window.localStorage.getItem(RESONANCE_KEY);
  const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
  map[resultCreatedAt] = value;
  window.localStorage.setItem(RESONANCE_KEY, JSON.stringify(map));
}

export function getResonance(resultCreatedAt: string): ResonanceValue | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(RESONANCE_KEY);
  if (!raw) return null;
  try {
    const map = JSON.parse(raw) as Record<string, string>;
    const value = map[resultCreatedAt];
    if (value === "yes" || value === "partly" || value === "no") return value;
    return null;
  } catch {
    return null;
  }
}

export function saveFeedback(resultCreatedAt: string, text: string) {
  if (typeof window === "undefined") return;
  const raw = window.localStorage.getItem(FEEDBACK_KEY);
  const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
  map[resultCreatedAt] = text;
  window.localStorage.setItem(FEEDBACK_KEY, JSON.stringify(map));
}

export function getResonanceCounts(): { yes: number; partly: number; no: number } {
  if (typeof window === "undefined") return { yes: 0, partly: 0, no: 0 };
  const raw = window.localStorage.getItem(RESONANCE_KEY);
  if (!raw) return { yes: 0, partly: 0, no: 0 };
  try {
    const map = JSON.parse(raw) as Record<string, string>;
    const values = Object.values(map);
    return {
      yes: values.filter((v) => v === "yes").length,
      partly: values.filter((v) => v === "partly").length,
      no: values.filter((v) => v === "no").length,
    };
  } catch {
    return { yes: 0, partly: 0, no: 0 };
  }
}

export type CorrectionTarget =
  | "body"
  | "pattern"
  | "theme"
  | "recommendation"
  | "none";

export interface CorrectionEntry {
  target: CorrectionTarget;
  note?: string;
  createdAt: string;
}

export function saveCorrection(
  resultCreatedAt: string,
  target: CorrectionTarget,
  note?: string
) {
  if (typeof window === "undefined") return;
  const raw = window.localStorage.getItem(CORRECTION_KEY);
  const map = raw ? (JSON.parse(raw) as Record<string, CorrectionEntry>) : {};
  map[resultCreatedAt] = { target, note, createdAt: new Date().toISOString() };
  window.localStorage.setItem(CORRECTION_KEY, JSON.stringify(map));
}

export function getCorrection(resultCreatedAt: string): CorrectionEntry | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(CORRECTION_KEY);
  if (!raw) return null;
  try {
    const map = JSON.parse(raw) as Record<string, CorrectionEntry>;
    return map[resultCreatedAt] ?? null;
  } catch {
    return null;
  }
}

export interface RegulationSession {
  toolId: string;
  resultCreatedAt: string;
  beforeLoad: number;
  startedAt: string;
}

export function saveRegulationSession(session: RegulationSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REGULATION_SESSION_KEY, JSON.stringify(session));
}

export function getRegulationSession(): RegulationSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(REGULATION_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as RegulationSession;
  } catch {
    return null;
  }
}

export function clearRegulationSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(REGULATION_SESSION_KEY);
}

export type ToolShift = "lighter" | "same" | "heavier" | "unsure";

export interface ToolShiftEntry {
  toolId: string;
  shift: ToolShift;
  beforeLoad: number;
  createdAt: string;
}

export function saveToolShift(entry: ToolShiftEntry) {
  if (typeof window === "undefined") return;
  const existing = getToolShiftHistory();
  existing.unshift(entry);
  window.localStorage.setItem(TOOL_SHIFT_KEY, JSON.stringify(existing.slice(0, 50)));
}

export function getToolShiftHistory(): ToolShiftEntry[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(TOOL_SHIFT_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ToolShiftEntry[];
  } catch {
    return [];
  }
}

export function getPreferredTool(candidateToolIds: string[]): string | null {
  const history = getToolShiftHistory();
  if (history.length === 0) return null;

  let bestToolId: string | null = null;
  let bestScore = -1;

  for (const toolId of candidateToolIds) {
    const entries = history.filter((h) => h.toolId === toolId);
    if (entries.length < 2) continue;
    const lighterCount = entries.filter((e) => e.shift === "lighter").length;
    const ratio = lighterCount / entries.length;
    if (ratio > 0.5 && lighterCount > bestScore) {
      bestScore = lighterCount;
      bestToolId = toolId;
    }
  }

  return bestToolId;
}

const ALL_LOCAL_KEYS = [
  RESULTS_KEY,
  SAFETY_PLAN_KEY,
  RESONANCE_KEY,
  FEEDBACK_KEY,
  CORRECTION_KEY,
  REGULATION_SESSION_KEY,
  TOOL_SHIFT_KEY,
  JOURNAL_KEY,
];

export function exportLocalData(): string {
  if (typeof window === "undefined") return "{}";
  const dump: Record<string, unknown> = { exportedAt: new Date().toISOString() };
  for (const key of ALL_LOCAL_KEYS) {
    const raw = window.localStorage.getItem(key);
    if (raw) {
      try {
        dump[key] = JSON.parse(raw);
      } catch {
        dump[key] = raw;
      }
    }
  }
  return JSON.stringify(dump, null, 2);
}

export function buildReadableSummary(): string {
  const results = getDayMapResults();
  const resonance = getResonanceCounts();
  const safetyPlan = getSafetyPlan();
  const lines: string[] = [];
  lines.push("unkahi — local data summary");
  lines.push(`Generated on this device: ${new Date().toLocaleString()}`);
  lines.push("");
  lines.push(`Check-ins stored on this device: ${results.length}`);
  if (results.length > 0) {
    lines.push("");
    lines.push("Recent check-ins:");
    for (const r of results.slice(0, 10)) {
      lines.push(
        `- ${new Date(r.createdAt).toLocaleDateString()}: load ${r.loadPercent}%, primary pattern ${r.primaryPattern}${
          r.hasDeeperPass ? " (includes deeper pass)" : ""
        }`
      );
    }
  }
  lines.push("");
  lines.push(
    `Resonance marks: ${resonance.yes} "yes", ${resonance.partly} "partly", ${resonance.no} "not really"`
  );
  lines.push("");
  lines.push(`Safety plan saved: ${safetyPlan ? "yes" : "no"}`);
  lines.push("");
  lines.push(
    "This summary was generated entirely on this device. Nothing was uploaded to create it."
  );
  return lines.join("\n");
}

export function clearAllLocalData() {
  if (typeof window === "undefined") return;
  for (const key of ALL_LOCAL_KEYS) {
    window.localStorage.removeItem(key);
  }
}

export interface JournalEntry {
  id: string;
  text: string;
  sentiment: "low" | "neutral" | "positive";
  createdAt: string;
}

export function addJournalEntry(
  text: string,
  sentiment: JournalEntry["sentiment"]
): JournalEntry {
  const entry: JournalEntry = {
    id: crypto.randomUUID(),
    text,
    sentiment,
    createdAt: new Date().toISOString(),
  };
  if (typeof window === "undefined") return entry;
  const existing = getJournalEntries();
  existing.unshift(entry);
  window.localStorage.setItem(JOURNAL_KEY, JSON.stringify(existing));
  return entry;
}

export function getJournalEntries(): JournalEntry[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(JOURNAL_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as JournalEntry[];
  } catch {
    return [];
  }
}

export function deleteJournalEntry(entryId: string) {
  if (typeof window === "undefined") return;
  const existing = getJournalEntries().filter((e) => e.id !== entryId);
  window.localStorage.setItem(JOURNAL_KEY, JSON.stringify(existing));
}

export function getSafetyPlan(): SafetyPlan | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SAFETY_PLAN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SafetyPlan;
  } catch {
    return null;
  }
}

export function saveSafetyPlan(plan: Omit<SafetyPlan, "updatedAt">) {
  if (typeof window === "undefined") return;
  const full: SafetyPlan = { ...plan, updatedAt: new Date().toISOString() };
  window.localStorage.setItem(SAFETY_PLAN_KEY, JSON.stringify(full));
}

export function averagePillarVectorExcluding(
  results: DayMapResult[],
  excludeCreatedAt: string
): PillarVector | null {
  const others = results.filter((r) => r.createdAt !== excludeCreatedAt && r.hasSignal);
  if (others.length === 0) return null;
  const sum = others.reduce<PillarVector>(
    (acc, r) => acc.map((v, i) => v + r.pillarScores[i]) as PillarVector,
    [0, 0, 0, 0, 0, 0]
  );
  return sum.map((v) => v / others.length) as PillarVector;
}
