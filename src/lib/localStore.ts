"use client";

import type { DayMapResult } from "./daymap";

const RESULTS_KEY = "unkahi.daymap.results";
const SAFETY_PLAN_KEY = "unkahi.safetyPlan";
const RESONANCE_KEY = "unkahi.daymap.resonance";
const FEEDBACK_KEY = "unkahi.daymap.feedback";

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
    return JSON.parse(raw) as DayMapResult[];
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

export function saveResonance(resultCreatedAt: string, value: "yes" | "no") {
  if (typeof window === "undefined") return;
  const raw = window.localStorage.getItem(RESONANCE_KEY);
  const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
  map[resultCreatedAt] = value;
  window.localStorage.setItem(RESONANCE_KEY, JSON.stringify(map));
}

export function saveFeedback(resultCreatedAt: string, text: string) {
  if (typeof window === "undefined") return;
  const raw = window.localStorage.getItem(FEEDBACK_KEY);
  const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
  map[resultCreatedAt] = text;
  window.localStorage.setItem(FEEDBACK_KEY, JSON.stringify(map));
}

export function getResonanceCounts(): { yes: number; no: number } {
  if (typeof window === "undefined") return { yes: 0, no: 0 };
  const raw = window.localStorage.getItem(RESONANCE_KEY);
  if (!raw) return { yes: 0, no: 0 };
  try {
    const map = JSON.parse(raw) as Record<string, string>;
    const values = Object.values(map);
    return {
      yes: values.filter((v) => v === "yes").length,
      no: values.filter((v) => v === "no").length,
    };
  } catch {
    return { yes: 0, no: 0 };
  }
}

const ALL_LOCAL_KEYS = [
  RESULTS_KEY,
  SAFETY_PLAN_KEY,
  RESONANCE_KEY,
  FEEDBACK_KEY,
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

export function clearAllLocalData() {
  if (typeof window === "undefined") return;
  for (const key of ALL_LOCAL_KEYS) {
    window.localStorage.removeItem(key);
  }
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
