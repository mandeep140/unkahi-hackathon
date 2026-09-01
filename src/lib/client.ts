"use client";

const USER_ID_KEY = "unkahi.userId";

export function getLocalUserId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

export async function apiGet<T>(path: string): Promise<T> {
  const userId = getLocalUserId();
  const res = await fetch(path, {
    headers: { "x-user-id": userId },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`GET ${path} failed`);
  return res.json();
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const userId = getLocalUserId();
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": userId },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} failed`);
  return res.json();
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const userId = getLocalUserId();
  const res = await fetch(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "x-user-id": userId },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PATCH ${path} failed`);
  return res.json();
}

export async function apiDelete<T>(path: string): Promise<T> {
  const userId = getLocalUserId();
  const res = await fetch(path, {
    method: "DELETE",
    headers: { "x-user-id": userId },
  });
  if (!res.ok) throw new Error(`DELETE ${path} failed`);
  return res.json();
}
