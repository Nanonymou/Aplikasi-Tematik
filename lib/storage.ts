import type { MathMode } from "./questions";
import { getCurrentUser } from "./users";

/**
 * Penyimpanan sementara di localStorage (stub).
 * Nanti diganti/disinkronkan dengan backend (Vercel Postgres) pada fase backend.
 */

export interface SessionResult {
  /** Pemilik sesi; kosong pada data lama sebelum ada akun. */
  userId?: string;
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
    const sessions = loadAllSessionResults();
    sessions.push({ ...result, userId: getCurrentUser()?.id });
    window.localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch {
    // Penyimpanan penuh / diblokir — abaikan, latihan tetap jalan.
  }
}

/** Semua sesi dari semua pengguna (dipakai internal & migrasi backend nanti). */
export function loadAllSessionResults(): SessionResult[] {
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

/** Sesi milik pengguna yang sedang masuk saja. */
export function loadSessionResults(): SessionResult[] {
  const userId = getCurrentUser()?.id;
  if (!userId) return [];
  return loadAllSessionResults().filter((s) => s.userId === userId);
}

export function totalStars(): number {
  return loadSessionResults().reduce((sum, s) => sum + (s.stars ?? 0), 0);
}
