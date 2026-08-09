"use client";

const STORAGE_KEY = "user_objects_scanned_count";

export function getUserObjectsScannedCount(): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const parsed = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function addUserObjectsScanned(count: number): number {
  if (typeof window === "undefined" || count <= 0) return getUserObjectsScannedCount();
  const next = getUserObjectsScannedCount() + count;
  window.localStorage.setItem(STORAGE_KEY, String(next));
  return next;
}
