"use client";

const SENSATIONS_KEY = "unkahi.session.sensations";

export function setSessionSensations(ids: string[]) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(SENSATIONS_KEY, JSON.stringify(ids));
}

export function getSessionSensations(): string[] {
  if (typeof window === "undefined") return [];
  const raw = window.sessionStorage.getItem(SENSATIONS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function clearSessionSensations() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(SENSATIONS_KEY);
}
