import type { MathMode } from "./questions";
import { getCurrentUser } from "./users";

/**
 * Hasil tantangan Mode Kilat (stub localStorage, per anak).
 * Setiap jawaban benar bernilai 1 bintang bonus.
 */

export interface TimerResult {
  userId?: string;
  mode: MathMode;
  correct: number;
  wrong: number;
  finishedAt: string;
}

const TIMER_KEY = "bintang-berhitung:timer";

export function saveTimerResult(result: Omit<TimerResult, "userId">) {
  if (typeof window === "undefined") return;
  try {
    const all = loadAllTimerResults();
    all.push({ ...result, userId: getCurrentUser()?.id });
    window.localStorage.setItem(TIMER_KEY, JSON.stringify(all));
  } catch {
    // abaikan — hasil kilat hanya hiasan bonus.
  }
}

function loadAllTimerResults(): TimerResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(TIMER_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as TimerResult[]) : [];
  } catch {
    return [];
  }
}

/** Hasil kilat milik anak yang sedang masuk. */
export function loadTimerResults(): TimerResult[] {
  const userId = getCurrentUser()?.id;
  if (!userId) return [];
  return loadAllTimerResults().filter((r) => r.userId === userId);
}

/** Rekor jawaban benar terbanyak dalam satu sesi kilat (mode tertentu). */
export function getTimerBest(mode: MathMode): number {
  return loadTimerResults()
    .filter((r) => r.mode === mode)
    .reduce((best, r) => Math.max(best, r.correct), 0);
}
