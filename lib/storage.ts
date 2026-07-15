import type { MathMode } from "./questions";

/**
 * Penyimpanan sementara di localStorage (stub).
 * Nanti diganti/disinkronkan dengan backend (Vercel Postgres) pada fase backend.
 */

export interface SessionResult {
  mode: MathMode;
  topic: number;
  /** Jumlah jawaban benar pada percobaan pertama */
  correct: number;
  /** Jumlah soal dalam sesi */
  total: number;
  /** Nilai 0–100 */
  score: number;
  /** Bintang yang didapat pada sesi ini */
  stars: number;
  /** ISO timestamp saat sesi selesai */
  finishedAt: string;
}

const SESSIONS_KEY = "bintang-berhitung:sessions";

export function saveSessionResult(result: SessionResult) {
  if (typeof window === "undefined") return;
  try {
    const sessions = loadSessionResults();
    sessions.push(result);
    window.localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch {
    // Penyimpanan penuh / diblokir — abaikan, latihan tetap jalan.
  }
}

export function loadSessionResults(): SessionResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SessionResult[]) : [];
  } catch {
    return [];
  }
}

export function totalStars(): number {
  return loadSessionResults().reduce((sum, s) => sum + (s.stars ?? 0), 0);
}
